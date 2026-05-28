import { useCallback, useRef } from 'react';

const TARGET_SAMPLE_RATE = 16000;

export { TARGET_SAMPLE_RATE };

export interface AudioCapture {
  startCapture: (stream: MediaStream) => void;
  stopCapture: () => Promise<Float32Array>;
}

export function useAudioCapture(): AudioCapture {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCapture = useCallback((stream: MediaStream) => {
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(250);
    recorderRef.current = recorder;
  }, []);

  const stopCapture = useCallback(async (): Promise<Float32Array> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return new Float32Array(0);
    }

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType }));
      };
      recorder.stop();
    });

    recorderRef.current = null;
    chunksRef.current = [];

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const tempCtx = new AudioContext();
      const decoded = await tempCtx.decodeAudioData(arrayBuffer);
      await tempCtx.close();

      if (decoded.numberOfChannels === 0 || decoded.length === 0) {
        return new Float32Array(0);
      }

      const numSamples = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE);
      if (numSamples <= 0) return new Float32Array(0);

      const offlineCtx = new OfflineAudioContext(1, numSamples, TARGET_SAMPLE_RATE);
      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(offlineCtx.destination);
      source.start();
      const resampled = await offlineCtx.startRendering();
      return resampled.getChannelData(0);
    } catch (e) {
      console.warn('Audio capture decode failed:', e);
      return new Float32Array(0);
    }
  }, []);

  return { startCapture, stopCapture };
}
