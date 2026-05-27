import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioFrame } from '../types';

export interface AudioAnalyser {
  frame: AudioFrame;
  start: () => Promise<void>;
  stop: () => void;
  active: boolean;
  stream: MediaStream | null;
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
  let maxCorr = 0;
  let bestOffset = -1;
  const minPeriod = Math.floor(sampleRate / 800);
  const maxPeriod = Math.floor(sampleRate / 80);

  for (let offset = minPeriod; offset < Math.min(maxPeriod, len / 2); offset++) {
    let corr = 0;
    for (let i = 0; i < len / 2; i++) {
      corr += Math.abs((buf[i] - 128) - (buf[i + offset] - 128));
    }
    corr = 1 - corr / ((len / 2) * 128);
    if (corr > maxCorr) {
      maxCorr = corr;
      bestOffset = offset;
    }
  }

  if (bestOffset > 0 && maxCorr > 0.1) {
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

  return { frame, start, stop, active, stream: streamRef.current };
}
