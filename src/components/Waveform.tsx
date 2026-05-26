import { useMemo } from 'react';
import type { Animal } from '../types';

interface Props {
  volume: number;
  animal: Animal;
  visible: boolean;
}

const BAR_COUNT = 24;

export function Waveform({ volume, animal, visible }: Props) {
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }), []);
  const accent = animal === 'cat' ? 'var(--cat-primary)' : 'var(--dog-primary)';

  return (
    <div className="waveform-bar" style={{ opacity: visible ? 1 : 0 }}>
      {bars.map((_, i) => {
        const center = BAR_COUNT / 2;
        const dist = Math.abs(i - center) / center;
        const height = volume > 0.05
          ? 8 + (volume * 24 * (1 - dist * 0.6)) * (0.7 + Math.random() * 0.3)
          : 8;
        return (
          <div
            key={i}
            className="wave-line"
            style={{
              height: `${height}px`,
              background: volume > 0.1 ? accent : 'var(--text-dim)',
            }}
          />
        );
      })}
    </div>
  );
}
