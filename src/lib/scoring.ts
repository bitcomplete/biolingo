import type { AudioFrame, FailReason, GateResult, Lesson, MeasuredMetrics, ScoreBreakdown } from '../types';

export function rmsToDb(rms: number): number {
  return 20 * Math.log10(Math.max(rms, 1e-7));
}

// Score a single metric: 1.0 if within [min,max], drops off proportionally outside.
function scoreMetric(value: number, [min, max]: [number, number]): number {
  if (max <= min) return 1;
  if (value >= min && value <= max) return 1.0;
  const width = max - min;
  if (value < min) return Math.max(0, 1 - (min - value) / width);
  return Math.max(0, 1 - (value - max) / width);
}

export function computeMetricsFromFrames(frames: AudioFrame[], recordingMs: number): MeasuredMetrics {
  if (frames.length === 0) {
    return {
      volume_rms_db: -60,
      peak_db: -60,
      pitch_hz: 0,
      duration_ms: 0,
      attack_ms: 0,
      burst_count: 0,
      burst_spacing_ms: 0,
      silence_ratio: 1,
    };
  }

  const volumes = frames.map((f) => f.volume);
  const frameMs = recordingMs / frames.length;

  // Only measure volume from frames where the user is actually making sound.
  // Using the median/mean of ALL frames (including silence) produces a dB reading
  // that's 20–40 dB too low whenever the recording window is longer than the sound.
  const VAD_THRESHOLD = 0.008;
  const voicedVolumes = volumes.filter((v) => v > VAD_THRESHOLD);
  const voicedCount = voicedVolumes.length;
  const silenceRatio = 1 - voicedCount / frames.length;
  const voicedMs = voicedCount * frameMs;

  // Mean of voiced frames — stable and representative of sustained loudness
  const meanVoicedVolume =
    voicedCount > 0 ? voicedVolumes.reduce((s, v) => s + v, 0) / voicedCount : 0;
  const peakVolume = voicedCount > 0 ? Math.max(...voicedVolumes) : 0;

  const voicedPitches = frames
    .filter((f) => f.volume > VAD_THRESHOLD && f.pitch > 0)
    .map((f) => f.pitch);
  const sortedPitches = [...voicedPitches].sort((a, b) => a - b);
  const medianPitch = sortedPitches.length > 0 ? sortedPitches[Math.floor(sortedPitches.length / 2)] : 0;

  const peakIdx = volumes.indexOf(peakVolume);
  const firstVoicedIdx = volumes.findIndex((v) => v > VAD_THRESHOLD);
  const attackMs =
    firstVoicedIdx >= 0 && peakIdx >= firstVoicedIdx ? (peakIdx - firstVoicedIdx) * frameMs : 0;

  // Burst detection: count amplitude threshold crossings from below
  const BURST_THRESHOLD = 0.02;
  let inBurst = false;
  let burstCount = 0;
  const burstTimes: number[] = [];
  for (let i = 0; i < volumes.length; i++) {
    if (!inBurst && volumes[i] > BURST_THRESHOLD) {
      inBurst = true;
      burstCount++;
      burstTimes.push(i * frameMs);
    } else if (inBurst && volumes[i] < BURST_THRESHOLD * 0.5) {
      inBurst = false;
    }
  }
  const burstSpacingMs =
    burstTimes.length >= 2
      ? burstTimes.slice(1).reduce((sum, t, i) => sum + (t - burstTimes[i]), 0) / (burstTimes.length - 1)
      : 0;

  return {
    volume_rms_db: rmsToDb(meanVoicedVolume),
    peak_db: rmsToDb(peakVolume),
    pitch_hz: medianPitch,
    duration_ms: voicedMs,
    attack_ms: attackMs,
    burst_count: burstCount,
    burst_spacing_ms: burstSpacingMs,
    silence_ratio: silenceRatio,
  };
}

export function computeScore(metrics: MeasuredMetrics, lesson: Lesson): ScoreBreakdown {
  const { targets } = lesson;

  const volumeScore = scoreMetric(metrics.volume_rms_db, targets.volume_rms_db);
  const pitchScore = metrics.pitch_hz > 0 ? scoreMetric(metrics.pitch_hz, targets.pitch_hz) : 0;
  const durationScore = scoreMetric(metrics.duration_ms, targets.duration_ms);

  let cadenceScore = 0.85; // default for non-burst lessons
  if (targets.burst_count) {
    const bScore = scoreMetric(metrics.burst_count, targets.burst_count);
    if (targets.burst_spacing_ms && metrics.burst_spacing_ms > 0) {
      cadenceScore = (bScore + scoreMetric(metrics.burst_spacing_ms, targets.burst_spacing_ms)) / 2;
    } else {
      cadenceScore = bScore;
    }
  }

  const overall =
    0.30 * pitchScore +
    0.25 * volumeScore +
    0.20 * cadenceScore +
    0.15 * durationScore +
    0.10 * 0.8; // emotional_match estimated at 0.8 (AI assesses this verbally)

  return { volume: volumeScore, pitch: pitchScore, cadence: cadenceScore, duration: durationScore, overall };
}

// Volume gate: hard requirements that block advancement (pitch is advisory only).
export function checkVolumeGate(
  metrics: MeasuredMetrics,
  breakdown: ScoreBreakdown,
  lesson: Lesson,
): GateResult {
  const failReasons: FailReason[] = [];

  if (metrics.silence_ratio > 0.88) {
    return { passed: false, failReasons: ['silence'], breakdown };
  }

  if (breakdown.volume < 0.68) {
    failReasons.push(
      metrics.volume_rms_db < lesson.targets.volume_rms_db[0] ? 'too_quiet' : 'too_loud',
    );
  }

  if (breakdown.duration < 0.50) {
    failReasons.push(
      metrics.duration_ms < lesson.targets.duration_ms[0] ? 'too_short' : 'too_long',
    );
  }

  return { passed: failReasons.length === 0, failReasons, breakdown };
}

export function failReasonsToRatingCategory(
  reasons: FailReason[],
): 'too_quiet' | 'too_loud' | 'silence' | 'total_failure' {
  if (reasons.includes('silence')) return 'silence';
  if (reasons.includes('too_quiet')) return 'too_quiet';
  if (reasons.includes('too_loud')) return 'too_loud';
  return 'total_failure';
}

export function failReasonsToMessage(reasons: FailReason[]): string {
  if (reasons.includes('silence')) return 'No sound detected — make sure your mic is working.';
  const msgs: string[] = [];
  if (reasons.includes('too_quiet')) msgs.push('too quiet');
  if (reasons.includes('too_loud')) msgs.push('too loud');
  if (reasons.includes('too_short')) msgs.push('too brief');
  if (reasons.includes('too_long')) msgs.push('too long');
  return msgs.length > 0 ? `Your attempt was ${msgs.join(' and ')} — try again.` : 'Not quite there.';
}
