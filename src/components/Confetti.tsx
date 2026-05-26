import { useEffect, useState } from 'react';
import type { Animal } from '../types';

interface Props {
  burstId: number;
  animal: Animal;
}

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
}

const CAT_COLORS = ['#ff6b9d', '#ffb8d4', '#e64980', '#ffd43b', '#69db7c'];
const DOG_COLORS = ['#ffa94d', '#ffd8a8', '#e8590c', '#ffd43b', '#69db7c'];

export function Confetti({ burstId, animal }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (burstId === 0) return;
    const colors = animal === 'cat' ? CAT_COLORS : DOG_COLORS;
    const next: Piece[] = Array.from({ length: 50 }).map((_, i) => ({
      id: burstId * 1000 + i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1 + Math.random(),
    }));
    setPieces(next);
    const timer = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(timer);
  }, [burstId, animal]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
