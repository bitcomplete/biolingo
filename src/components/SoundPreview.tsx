import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  animal: 'cat' | 'dog';
}

export function SoundPreview({ src, animal }: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  }, [playing]);

  return (
    <button
      className={`sound-preview-btn ${animal} ${playing ? 'playing' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Stop preview' : 'Play example sound'}
    >
      <span className="sound-preview-icon">{playing ? '⏹' : '▶'}</span>
      <span className="sound-preview-label">{playing ? 'Stop' : 'Hear example'}</span>
    </button>
  );
}
