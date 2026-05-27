import { adjustVolumeRms, formatDbRange, isAudibleVolume, rmsToDb, roundDb } from '../lib/scoring';
import type { Animal } from '../types';

interface Props {
  volume: number;
  pitch: number;
  animal: Animal;
  noiseFloorRms?: number;
  volumeTarget?: [number, number];
  pitchTarget?: [number, number];
}

const DB_DISPLAY_MIN = -50;
const DB_DISPLAY_MAX = -8;

function dbToPct(db: number): number {
  return Math.min(100, Math.max(0, ((db - DB_DISPLAY_MIN) / (DB_DISPLAY_MAX - DB_DISPLAY_MIN)) * 100));
}

function pitchToPct(hz: number): number {
  return Math.min(100, Math.max(0, ((hz - 80) / 720) * 100));
}

function targetBandPct([min, max]: [number, number]): { left: number; width: number } {
  const left = dbToPct(min);
  const right = dbToPct(max);
  return { left, width: Math.max(4, right - left) };
}

export function Meters({
  volume,
  pitch,
  animal,
  noiseFloorRms = 0,
  volumeTarget,
  pitchTarget,
}: Props) {
  const adjustedVolume = adjustVolumeRms(volume, noiseFloorRms);
  const volumeDb = roundDb(rmsToDb(Math.max(adjustedVolume, 1e-7)));
  const volPct = dbToPct(volumeDb);
  const volBand = volumeTarget ? targetBandPct(volumeTarget) : null;
  const audible = isAudibleVolume(volume, noiseFloorRms);
  const inVolumeTarget =
    audible &&
    volumeTarget !== undefined &&
    volumeDb >= volumeTarget[0] &&
    volumeDb <= volumeTarget[1];

  const accent = animal === 'cat' ? 'var(--cat-primary)' : 'var(--dog-primary)';
  const pitchLight = animal === 'cat' ? 'var(--cat-light)' : 'var(--dog-light)';
  const pitchPct = pitch > 0 ? pitchToPct(pitch) : 0;
  const pitchBand =
    pitchTarget && pitchTarget[1] > pitchTarget[0]
      ? {
        left: pitchToPct(pitchTarget[0]),
        width: Math.max(4, pitchToPct(pitchTarget[1]) - pitchToPct(pitchTarget[0])),
      }
      : null;
  const inPitchTarget =
    pitchTarget !== undefined &&
    pitch > 0 &&
    pitch >= pitchTarget[0] &&
    pitch <= pitchTarget[1];

  const volumeColor = !audible
    ? 'var(--text-dim)'
    : inVolumeTarget
      ? 'var(--success)'
      : 'var(--warning)';
  const volumeFill = !audible ? 'var(--text-dim)' : inVolumeTarget ? 'var(--success)' : 'var(--warning)';

  return (
    <div className="meters fade-up" style={{ animationDelay: '.1s' }}>
      <div className="meter-card">
        <div className="meter-header">
          <span className="meter-title">Volume (peak)</span>
          <span className="meter-value" style={{ color: volumeColor }}>
            {!audible ? 'silent' : `${volumeDb} dB`}
          </span>
        </div>
        <div className="meter-track">
          {volBand && (
            <div
              className="meter-target-band"
              style={{ left: `${volBand.left}%`, width: `${volBand.width}%` }}
            />
          )}
          <div className="meter-fill" style={{ width: `${volPct}%`, background: volumeFill }} />
        </div>
        {volumeTarget && (
          <div className="meter-target-label">
            target: {formatDbRange(volumeTarget)} — make a sound
          </div>
        )}
      </div>
      <div className="meter-card">
        <div className="meter-header">
          <span className="meter-title">Pitch</span>
          <span
            className="meter-value"
            style={{ color: inPitchTarget ? pitchLight : pitch > 0 ? 'var(--warning)' : 'var(--text-dim)' }}
          >
            {pitch > 0 ? `${Math.round(pitch)} Hz` : '—'}
          </span>
        </div>
        <div className="meter-track">
          {pitchBand && (
            <div
              className="meter-target-band"
              style={{ left: `${pitchBand.left}%`, width: `${pitchBand.width}%` }}
            />
          )}
          <div className="meter-fill" style={{ width: `${pitchPct}%`, background: accent }} />
        </div>
        {pitchTarget && (
          <div className="meter-target-label">
            target: {pitchTarget[0]}–{pitchTarget[1]} Hz
          </div>
        )}
      </div>
    </div>
  );
}
