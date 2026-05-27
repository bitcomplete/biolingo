import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioFrame } from '../types';

export interface AudioAnalyser {
  frame: AudioFrame;
  start: () => Promise<void>;
  stop: () => void;
  active: boolean;
}

function computeVolume(buf: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buf.length);
}

function computePitch(buf: Uint8Array, sampleRate: number): number {
  const len = buf.length;
  const halfLen = Math.floor(len / 2);

  // Compute RMS in raw units (0–128 scale) for amplitude-aware normalization.
  let sumSq = 0;
  for (let i = 0; i < len; i++) {
    const v = buf[i] - 128;
    sumSq += v * v;
  }
  const rmsRaw = Math.sqrt(sumSq / len);

  // Below this level the signal is too quiet for reliable pitch detection.
  // (Silence gives rmsRaw ≈ 0 and would otherwise return a spurious 800 Hz.)
  if (rmsRaw < 3) return 0;

  const minPeriod = Math.floor(sampleRate / 800);
  const maxPeriod = Math.floor(sampleRate / 80);
  // Normalise by signal amplitude so the score is independent of loudness.
  // Random noise scores ~0.44 at every offset; a true periodic signal scores
  // close to 1.0 at the fundamental period.
  const normFactor = halfLen * rmsRaw * 2;

  let maxCorr = -Infinity;
  let bestOffset = -1;

  for (let offset = minPeriod; offset < Math.min(maxPeriod, halfLen); offset++) {
    let amdf = 0;
    for (let i = 0; i < halfLen; i++) {
      amdf += Math.abs((buf[i] - 128) - (buf[i + offset] - 128));
    }
    const corr = 1 - amdf / normFactor;
    if (corr > maxCorr) {
      maxCorr = corr;
      bestOffset = offset;
    }
  }

  if (bestOffset > 0 && maxCorr > 0.5) {
    return sampleRate / bestOffset;
  }
  return 0;
}

export function useAudioAnalyser(): AudioAnalyser {
  const [frame, setFrame] = useState<AudioFrame>({ volume: 0, pitch: 0 });
  const [active, setActive] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);

  const loop = useCallback(() => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    const ctx = ctxRef.current;
    if (!analyser || !data || !ctx) return;

    analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>);
    const volume = computeVolume(data);
    const pitch = computePitch(data, ctx.sampleRate);
    setFrame({ volume, pitch });
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const AudioCtor: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtor();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    streamRef.current = stream;
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    setActive(true);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
    analyserRef.current = null;
    dataRef.current = null;
    setActive(false);
    setFrame({ volume: 0, pitch: 0 });
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { frame, start, stop, active };
}
