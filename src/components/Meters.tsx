import type { Animal } from '../types';

interface Props {
  volume: number;
  pitch: number;
  animal: Animal;
}

function volumeLabel(v: number): { text: string; color: string; bg: string } {
  if (v < 0.03) return { text: 'silent', color: 'var(--text-dim)', bg: 'var(--text-dim)' };
  if (v < 0.08) return { text: 'quiet', color: 'var(--warning)', bg: 'var(--warning)' };
  if (v < 0.35) return { text: 'good', color: 'var(--success)', bg: 'var(--success)' };
  return { text: 'loud!', color: 'var(--danger)', bg: 'var(--danger)' };
}

export function Meters({ volume, pitch, animal }: Props) {
  const vol = volumeLabel(volume);
  const volPct = Math.min(volume * 300, 100);
  const accent = animal === 'cat' ? 'var(--cat-primary)' : 'var(--dog-primary)';
  const pitchLight = animal === 'cat' ? 'var(--cat-light)' : 'var(--dog-light)';
  const pitchPct = pitch > 0 ? Math.min(((pitch - 80) / 720) * 100, 100) : 0;

  return (
    <div className="meters fade-up" style={{ animationDelay: '.1s' }}>
      <div className="meter-card">
        <div className="meter-header">
          <span className="meter-title">Volume</span>
          <span className="meter-value" style={{ color: vol.color }}>{vol.text}</span>
        </div>
        <div className="meter-track">
          <div className="meter-zone" style={{ left: '20%' }} />
          <div className="meter-zone" style={{ left: '80%' }} />
          <div className="meter-fill" style={{ width: `${volPct}%`, background: vol.bg }} />
        </div>
      </div>
      <div className="meter-card">
        <div className="meter-header">
          <span className="meter-title">Pitch</span>
          <span className="meter-value" style={{ color: pitch > 0 ? pitchLight : 'var(--text-dim)' }}>
            {pitch > 0 ? `${Math.round(pitch)}Hz` : '—'}
          </span>
        </div>
        <div className="meter-track">
          <div className="meter-zone" style={{ left: '30%' }} />
          <div className="meter-zone" style={{ left: '70%' }} />
          <div className="meter-fill" style={{ width: `${pitchPct}%`, background: accent }} />
        </div>
      </div>
    </div>
  );
}
