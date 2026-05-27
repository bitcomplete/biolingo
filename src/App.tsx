import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimalSelector } from './components/AnimalSelector';
import { ScoreDots } from './components/ScoreDots';
import { Waveform } from './components/Waveform';
import { TargetShape } from './components/TargetShape';
import { Meters } from './components/Meters';
import { FeedbackCard } from './components/FeedbackCard';
import { AnalysisCard } from './components/AnalysisCard';
import { Confetti } from './components/Confetti';
import { KeyModal } from './components/KeyModal';
import { VoicePicker } from './components/VoicePicker';
import { PersonaToggle } from './components/PersonaToggle';
import { useAudioAnalyser } from './hooks/useAudioAnalyser';
import { useAudioCapture } from './hooks/useAudioCapture';
import { SoundCriticAgent } from './agent';
import { analyzeAudio } from './analysis/matcher';
import { getStoredKey, storeKey } from './apiKey';
import { DEFAULT_VOICE, type Animal, type PersonaMode, type Phase, type Rating, type Voice } from './types';
import type { AnalysisResult } from './analysis/types';

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
  const [voice, setVoice] = useState<Voice>(DEFAULT_VOICE);
  const [persona, setPersona] = useState<PersonaMode>('ramsay');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analyser = useAudioAnalyser();
  const capture = useAudioCapture();
  const agentRef = useRef<SoundCriticAgent | null>(null);
  const animalRef = useRef<Animal>(animal);
  const voiceRef = useRef<Voice>(voice);
  const personaRef = useRef<PersonaMode>(persona);
  const pendingKeyResolveRef = useRef<((key: string) => void) | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  useEffect(() => { animalRef.current = animal; }, [animal]);
  useEffect(() => { voiceRef.current = voice; }, [voice]);
  useEffect(() => { personaRef.current = persona; }, [persona]);

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
        setPhase('speaking');
      },
      onAgentSpeechEnd: () => {
        setPhase((p) => (p === 'speaking' || p === 'evaluating' ? 'result' : p));
      },
      onError: (e) => {
        console.error('[agent error]', e);
      },
    });

    try {
      await agent.connect(apiKey, voiceRef.current, personaRef.current);
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
    setAnalysis(null);
    agent.mute(false);

    if (analyser.stream) {
      capture.startCapture(analyser.stream);
    }

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

      const samples = await capture.stopCapture();
      let result: AnalysisResult | null = null;
      if (samples.length > 0) {
        result = await analyzeAudio(samples, animalRef.current);
        setAnalysis(result);
      }

      agent.requestScoreNow(result ?? undefined);
    }, RECORD_MS);
  }, [analyser.stream, capture]);

  const handlePracticeClick = useCallback(() => {
    if (phase === 'idle') {
      void bootSession();
    } else if (phase === 'ready' || phase === 'result') {
      startRecording();
    }
  }, [phase, bootSession, startRecording]);

  const handleAnimalChange = useCallback((next: Animal) => {
    if (next === animal) return;
    setAnimal(next);
    agentRef.current?.notifyAnimalSwitch(next);
  }, [animal]);

  const handleVoiceChange = useCallback((next: Voice) => {
    setVoice(next);
    agentRef.current?.setVoice(next);
  }, []);

  const handlePersonaChange = useCallback((next: PersonaMode) => {
    setPersona(next);
    agentRef.current?.setPersona(next);
  }, []);

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
        return { label: animal === 'cat' ? 'Start Catsonality Test' : 'Start Dogsonality Test', disabled: false, listening: false, theme };
      case 'connecting':
        return { label: 'Connecting…', disabled: true, listening: true, theme };
      case 'ready':
        return { label: animal === 'cat' ? 'Tap & Meow' : 'Tap & Bark', disabled: false, listening: false, theme };
      case 'recording':
        return { label: `Listening… ${countdown ?? ''}s`, disabled: true, listening: true, theme };
      case 'evaluating':
        return { label: 'Analyzing your soul…', disabled: true, listening: true, theme };
      case 'speaking':
        return { label: 'Delivering verdict…', disabled: true, listening: true, theme };
      case 'result':
        return { label: 'Try Again', disabled: false, listening: false, theme };
      default:
        return { label: '', disabled: true, listening: false, theme };
    }
  }, [phase, animal, countdown]);

  const animalSelectorDisabled = phase === 'connecting' || phase === 'recording' || phase === 'evaluating';
  const showPracticeUI = phase !== 'idle';

  return (
    <>
      <div className="app">
        <header className="header fade-up">
          <div className="logo">BioLingo</div>
          <h1 className="title">{animal === 'cat' ? 'Catsonality' : 'Dogsonality'} Test</h1>
        </header>

        <AnimalSelector animal={animal} disabled={animalSelectorDisabled} onChange={handleAnimalChange} />

        <ScoreDots filled={score} />

        <div className="main">
          {!showPracticeUI ? (
            <div className="idle-state">
              <span className="idle-emoji">{animal === 'cat' ? '🐱' : '🐶'}</span>
              <div className="idle-text">What {animal} are you on the inside?</div>
              <div className="idle-sub">Meow or bark — we'll tell you your breed, vibe & personality</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Waveform volume={analyser.frame.volume} animal={animal} visible={analyser.active} />
              <TargetShape animal={animal} />
              <Meters volume={analyser.frame.volume} pitch={analyser.frame.pitch} animal={animal} />
              <FeedbackCard phase={phase} rating={rating} />
              <AnalysisCard result={analysis} visible={phase === 'result' || phase === 'speaking'} />
            </div>
          )}
        </div>

        <div className={`mic-status ${micError ? 'error' : ''}`}>{micError ?? ''}</div>

        <VoicePicker
          value={voice}
          disabled={phase === 'connecting' || phase === 'recording' || phase === 'evaluating' || phase === 'speaking'}
          onChange={handleVoiceChange}
        />

        <PersonaToggle
          value={persona}
          disabled={phase === 'connecting' || phase === 'recording' || phase === 'evaluating' || phase === 'speaking'}
          onChange={handlePersonaChange}
        />

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
