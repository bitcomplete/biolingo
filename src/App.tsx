import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimalSelector } from './components/AnimalSelector';
import { ScoreDots } from './components/ScoreDots';
import { Waveform } from './components/Waveform';
import { TargetShape } from './components/TargetShape';
import { Meters } from './components/Meters';
import { FeedbackCard } from './components/FeedbackCard';
import { Confetti } from './components/Confetti';
import { KeyModal } from './components/KeyModal';
import { useAudioAnalyser } from './hooks/useAudioAnalyser';
import { SoundCriticAgent } from './agent';
import { getStoredKey, storeKey } from './apiKey';
import type { Animal, Phase, Rating } from './types';

const RECORD_MS = 3000;

export function App() {
  const [animal, setAnimal] = useState<Animal>('cat');
  const [phase, setPhase] = useState<Phase>('idle');
  const [rating, setRating] = useState<Rating | null>(null);
  const [score, setScore] = useState(0);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  const analyser = useAudioAnalyser();
  const agentRef = useRef<SoundCriticAgent | null>(null);
  const animalRef = useRef<Animal>(animal);
  const pendingKeyResolveRef = useRef<((key: string) => void) | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  useEffect(() => { animalRef.current = animal; }, [animal]);

  const requestApiKey = useCallback((): Promise<string> => {
    const existing = getStoredKey();
    if (existing) return Promise.resolve(existing);
    return new Promise<string>((resolve) => {
      pendingKeyResolveRef.current = resolve;
      setKeyModalOpen(true);
    });
  }, []);

  const handleKeySubmit = useCallback((key: string) => {
    storeKey(key);
    setKeyModalOpen(false);
    pendingKeyResolveRef.current?.(key);
    pendingKeyResolveRef.current = null;
  }, []);

  const bootSession = useCallback(async () => {
    setPhase('connecting');
    setMicError(null);

    let apiKey: string;
    try {
      apiKey = await requestApiKey();
    } catch {
      setMicError('⚠ No API key');
      setPhase('idle');
      return;
    }

    try {
      await analyser.start();
    } catch (e) {
      console.error(e);
      setMicError('⚠ Microphone access denied');
      setPhase('idle');
      return;
    }

    const agent = new SoundCriticAgent();
    agent.setAnimal(animalRef.current);
    agent.setCallbacks({
      onResult: (r) => {
        setRating(r);
        const dots = Math.min(5, Math.round(r.score / 2));
        setScore(dots);
        if (r.score >= 9) setConfettiBurst((b) => b + 1);
        setPhase('result');
      },
      onAgentSpeechEnd: () => {
        setPhase((p) => (p === 'result' || p === 'evaluating' ? 'ready' : p));
      },
      onError: (e) => {
        console.error('[agent error]', e);
      },
    });

    try {
      await agent.connect(apiKey);
    } catch (e) {
      console.error(e);
      setMicError('⚠ Agent connection failed — check your key');
      setPhase('idle');
      return;
    }

    agentRef.current = agent;
    agent.notifyAnimalSwitch(animalRef.current);
    setPhase('ready');
  }, [analyser, requestApiKey]);

  const startRecording = useCallback(() => {
    const agent = agentRef.current;
    if (!agent) return;
    setPhase('recording');
    setRating(null);
    agent.mute(false);

    let remaining = Math.ceil(RECORD_MS / 1000);
    setCountdown(remaining);
    countdownTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setCountdown(remaining > 0 ? remaining : null);
    }, 1000);

    recordTimerRef.current = window.setTimeout(async () => {
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setCountdown(null);
      await agent.mute(true);
      setPhase('evaluating');
      agent.requestScoreNow();
    }, RECORD_MS);
  }, []);

  const handlePracticeClick = useCallback(() => {
    if (phase === 'idle') {
      void bootSession();
    } else if (phase === 'ready') {
      startRecording();
    }
  }, [phase, bootSession, startRecording]);

  const handleAnimalChange = useCallback((next: Animal) => {
    if (next === animal) return;
    setAnimal(next);
    agentRef.current?.notifyAnimalSwitch(next);
  }, [animal]);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current);
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
      agentRef.current?.disconnect();
    };
  }, []);

  const practiceButton = useMemo(() => {
    const theme = animal === 'cat' ? 'cat-theme' : 'dog-theme';
    switch (phase) {
      case 'idle':
        return { label: animal === 'cat' ? 'Start Meow Practice' : 'Start Bark Practice', disabled: false, listening: false, theme };
      case 'connecting':
        return { label: 'Connecting…', disabled: true, listening: true, theme };
      case 'ready':
        return { label: animal === 'cat' ? 'Tap to Meow' : 'Tap to Bark', disabled: false, listening: false, theme };
      case 'recording':
        return { label: `Listening… ${countdown ?? ''}s`, disabled: true, listening: true, theme };
      case 'evaluating':
        return { label: 'Judging…', disabled: true, listening: true, theme };
      case 'result':
        return { label: 'Speaking…', disabled: true, listening: true, theme };
    }
  }, [phase, animal, countdown]);

  const animalSelectorDisabled = phase === 'connecting' || phase === 'recording' || phase === 'evaluating';
  const showPracticeUI = phase !== 'idle';

  return (
    <>
      <div className="app">
        <header className="header fade-up">
          <div className="logo">Paws & Practice</div>
          <h1 className="title">Sound Critic</h1>
        </header>

        <AnimalSelector animal={animal} disabled={animalSelectorDisabled} onChange={handleAnimalChange} />

        <ScoreDots filled={score} />

        <div className="main">
          {!showPracticeUI ? (
            <div className="idle-state">
              <span className="idle-emoji">🎤</span>
              <div className="idle-text">Pick your animal & start practicing</div>
              <div className="idle-sub">A theatrical AI critic awaits</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Waveform volume={analyser.frame.volume} animal={animal} visible={analyser.active} />
              <TargetShape animal={animal} />
              <Meters volume={analyser.frame.volume} pitch={analyser.frame.pitch} animal={animal} />
              <FeedbackCard phase={phase} rating={rating} />
            </div>
          )}
        </div>

        <div className={`mic-status ${micError ? 'error' : ''}`}>{micError ?? ''}</div>

        <div className="practice-area">
          <button
            className={`practice-btn ${practiceButton.listening ? 'listening' : practiceButton.theme}`}
            disabled={practiceButton.disabled}
            onClick={handlePracticeClick}
          >
            {practiceButton.label}
          </button>
        </div>
      </div>

      <Confetti burstId={confettiBurst} animal={animal} />
      <KeyModal open={keyModalOpen} onSubmit={handleKeySubmit} />
    </>
  );
}
