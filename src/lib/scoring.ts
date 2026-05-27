import type { AudioFrame, FailReason, GateResult, Lesson, LessonTargets, MeasuredMetrics, ScoreBreakdown } from '../types';

export const METRIC_PASS_THRESHOLD = 0.65;

/** Min peak RMS after noise-floor subtraction — real speech, not room hiss. */
export const VOLUME_SIGNAL_RMS = 0.012;

/** Lower bound for displayed/scored dB targets. */
export const VOLUME_AUDIBLE_DB = -35;

export function roundDb(db: number): number {
  return Math.round(db);
}

export function formatDbRange([min, max]: [number, number]): string {
  return `${roundDb(min)} to ${roundDb(max)} dB`;
}

export function adjustVolumeRms(rms: number, noiseFloorRms: number): number {
  return Math.max(0, rms - noiseFloorRms);
}

export function isAudibleVolume(rms: number, noiseFloorRms = 0): boolean {
  return adjustVolumeRms(rms, noiseFloorRms) >= VOLUME_SIGNAL_RMS;
}

export async function measureNoiseFloor(
  readFrame: () => AudioFrame,
  ms = 400,
  intervalMs = 20,
): Promise<number> {
  const samples: number[] = [];
  const steps = Math.max(1, Math.ceil(ms / intervalMs));
  for (let i = 0; i < steps; i++) {
    samples.push(readFrame().volume);
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)] ?? 0;
}

export function rmsToDb(rms: number): number {
  return 20 * Math.log10(Math.max(rms, 1e-7));
}

/** Small slack for laptop mics — peak loudness, not time-averaged mean. */
export function getRelaxedTargets(targets: LessonTargets): LessonTargets {
  return {
    volume_rms_db: [
      Math.max(Math.round(targets.volume_rms_db[0] - 3), VOLUME_AUDIBLE_DB),
      Math.round(targets.volume_rms_db[1] + 4),
    ],
    pitch_hz: [Math.max(120, targets.pitch_hz[0] - 50), targets.pitch_hz[1] + 80],
    duration_ms: [
      Math.max(150, Math.round(targets.duration_ms[0] * 0.85)),
      Math.round(targets.duration_ms[1] * 1.2),
    ],
    ...(targets.burst_count && {
      burst_count: [targets.burst_count[0], targets.burst_count[1]] as [number, number],
    }),
    ...(targets.burst_spacing_ms && {
      burst_spacing_ms: [
        Math.max(50, targets.burst_spacing_ms[0] - 50),
        targets.burst_spacing_ms[1] + 100,
      ] as [number, number],
    }),
  };
}

// Score a single metric: 1.0 if within [min,max], drops off proportionally outside.
function scoreMetric(value: number, [min, max]: [number, number]): number {
  if (max <= min) return 1;
  if (value >= min && value <= max) return 1.0;
  const width = max - min;
  if (value < min) return Math.max(0, 1 - (min - value) / width);
  return Math.max(0, 1 - (value - max) / width);
}

export function computeMetricsFromFrames(
  frames: AudioFrame[],
  recordingMs: number,
  noiseFloorRms = 0,
): MeasuredMetrics {
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

  const volumes = frames.map((f) => adjustVolumeRms(f.volume, noiseFloorRms));
  const frameMs = recordingMs / frames.length;

  const peakVolume = Math.max(...volumes);

  if (peakVolume < VOLUME_SIGNAL_RMS) {
    return {
      volume_rms_db: rmsToDb(peakVolume),
      peak_db: rmsToDb(peakVolume),
      pitch_hz: 0,
      duration_ms: 0,
      attack_ms: 0,
      burst_count: 0,
      burst_spacing_ms: 0,
      silence_ratio: 1,
    };
  }

  // Adaptive VAD: fixed floor catches only noise when peak is tiny; otherwise
  const vadThreshold = Math.max(0.01, peakVolume * 0.2);
  const burstThreshold = Math.max(0.015, peakVolume * 0.35);

  const voicedIndices: number[] = [];
  for (let i = 0; i < volumes.length; i++) {
    if (volumes[i] > vadThreshold) voicedIndices.push(i);
  }
  const voicedCount = voicedIndices.length;
  const silenceRatio = 1 - voicedCount / frames.length;
  const voicedMs = voicedCount * frameMs;

  const voicedVolumes = voicedIndices.map((i) => volumes[i]);
  const voicedPeakVolume = voicedCount > 0 ? Math.max(...voicedVolumes) : 0;

  const voicedPitches = voicedIndices
    .map((i) => frames[i])
    .filter((f) => f.pitch > 0)
    .map((f) => f.pitch);
  const sortedPitches = [...voicedPitches].sort((a, b) => a - b);
  const medianPitch = sortedPitches.length > 0 ? sortedPitches[Math.floor(sortedPitches.length / 2)] : 0;

  const peakIdx = volumes.indexOf(voicedPeakVolume || peakVolume);
  const firstVoicedIdx = voicedIndices[0] ?? -1;
  const attackMs =
    firstVoicedIdx >= 0 && peakIdx >= firstVoicedIdx ? (peakIdx - firstVoicedIdx) * frameMs : 0;

  let inBurst = false;
  let burstCount = 0;
  const burstTimes: number[] = [];
  for (let i = 0; i < volumes.length; i++) {
    if (!inBurst && volumes[i] > burstThreshold) {
      inBurst = true;
      burstCount++;
      burstTimes.push(i * frameMs);
    } else if (inBurst && volumes[i] < burstThreshold * 0.5) {
      inBurst = false;
    }
  }
  const burstSpacingMs =
    burstTimes.length >= 2
      ? burstTimes.slice(1).reduce((sum, t, i) => sum + (t - burstTimes[i]), 0) / (burstTimes.length - 1)
      : 0;

  return {
    volume_rms_db: rmsToDb(voicedPeakVolume),
    peak_db: rmsToDb(voicedPeakVolume),
    pitch_hz: medianPitch,
    duration_ms: voicedMs,
    attack_ms: attackMs,
    burst_count: burstCount,
    burst_spacing_ms: burstSpacingMs,
    silence_ratio: silenceRatio,
  };
}

/** Derive gate metrics from decoded PCM — reliable vs React analyser snapshots. */
export function computeMetricsFromSamples(
  samples: Float32Array,
  sampleRate: number,
  noiseFloorRms = 0,
): MeasuredMetrics {
  if (samples.length === 0) {
    return computeMetricsFromFrames([], 0, noiseFloorRms);
  }

  const hopSamples = Math.max(1, Math.floor(sampleRate * 0.02)); // 20ms frames
  const frames: AudioFrame[] = [];
  for (let start = 0; start < samples.length; start += hopSamples) {
    const end = Math.min(start + hopSamples, samples.length);
    let sumSq = 0;
    for (let i = start; i < end; i++) sumSq += samples[i] * samples[i];
    frames.push({
      volume: adjustVolumeRms(Math.sqrt(sumSq / (end - start)), noiseFloorRms),
      pitch: 0,
    });
  }

  const recordingMs = (samples.length / sampleRate) * 1000;
  return computeMetricsFromFrames(frames, recordingMs, 0);
}

/** Prefer live analyser frames; fall back to decoded PCM when frames are sparse. */
export function resolveRecordingMetrics(
  frames: AudioFrame[],
  samples: Float32Array,
  sampleRate: number,
  recordingMs: number,
  noiseFloorRms = 0,
): MeasuredMetrics {
  const fromFrames = computeMetricsFromFrames(frames, recordingMs, noiseFloorRms);
  if (frames.length >= 40) return fromFrames;
  if (samples.length > 0) return computeMetricsFromSamples(samples, sampleRate, noiseFloorRms);
  return fromFrames;
}

export function computeScore(metrics: MeasuredMetrics, lesson: Lesson): ScoreBreakdown {
  const targets = getRelaxedTargets(lesson.targets);

  const volumeScore = scoreMetric(metrics.peak_db, targets.volume_rms_db);
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

// Pass requires volume, pitch, and duration to meet METRIC_PASS_THRESHOLD (matches UI rows).
export function checkVolumeGate(
  metrics: MeasuredMetrics,
  breakdown: ScoreBreakdown,
  lesson: Lesson,
): GateResult {
  const failReasons: FailReason[] = [];
  const targets = getRelaxedTargets(lesson.targets);

  if (metrics.peak_db < VOLUME_AUDIBLE_DB || metrics.duration_ms < 50) {
    return { passed: false, failReasons: ['silence'], breakdown };
  }

  if (breakdown.volume < METRIC_PASS_THRESHOLD) {
    failReasons.push(
      metrics.peak_db < targets.volume_rms_db[0] ? 'too_quiet' : 'too_loud',
    );
  }

  if (metrics.pitch_hz <= 0 || breakdown.pitch < METRIC_PASS_THRESHOLD) {
    failReasons.push('wrong_pitch');
  }

  if (breakdown.duration < METRIC_PASS_THRESHOLD) {
    failReasons.push(
      metrics.duration_ms < targets.duration_ms[0] ? 'too_short' : 'too_long',
    );
  }

  return { passed: failReasons.length === 0, failReasons, breakdown };
}

export function failReasonsToRatingCategory(
  reasons: FailReason[],
): 'too_quiet' | 'too_loud' | 'wrong_pitch' | 'silence' | 'chaos' {
  if (reasons.includes('silence')) return 'silence';
  if (reasons.includes('too_quiet')) return 'too_quiet';
  if (reasons.includes('too_loud')) return 'too_loud';
  if (reasons.includes('wrong_pitch')) return 'wrong_pitch';
  return 'chaos';
}

const FAIL_REASON_LABELS: Record<FailReason, string> = {
  too_quiet: 'volume too quiet',
  too_loud: 'volume too loud',
  wrong_pitch: 'pitch out of range',
  too_short: 'too brief',
  too_long: 'too long',
  silence: 'no sound detected',
};

export function failReasonsToHint(reasons: FailReason[]): string {
  if (reasons.length === 0) return 'not quite there yet';
  return `fix ${reasons.map((r) => FAIL_REASON_LABELS[r]).join(' and ')}`;
}
