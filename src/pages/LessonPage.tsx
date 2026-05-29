import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LessonIcon } from '../components/LessonIcon';
import { Waveform } from '../components/Waveform';
import { TargetShape } from '../components/TargetShape';
import { Meters } from '../components/Meters';
import { FeedbackCard } from '../components/FeedbackCard';
import { AnalysisCard } from '../components/AnalysisCard';
import { Confetti } from '../components/Confetti';
import { KeyModal } from '../components/KeyModal';
import { ScoreDots } from '../components/ScoreDots';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { useAudioCapture } from '../hooks/useAudioCapture';
import { AnimalCoachAgent } from '../agent';
import { analyzeAudio } from '../analysis/matcher';
import { getStoredKey, storeKey } from '../apiKey';
import { getLessonById, getNextLesson } from '../data/lessons';
import { LESSON_SOUNDS } from '../data/sounds';
import { SoundPreview } from '../components/SoundPreview';
import {
  checkVolumeGate,
  computeMetricsFromFrames,
  computeScore,
} from '../lib/scoring';
import { awardXP, loadProgress, markLessonComplete, saveProgress } from '../lib/progress';
import { certificateLessons, isUnitComplete, proficiencyForUnit } from '../lib/certificates';
import { prefetchPortrait } from '../lib/portraitPrefetch';
import { updatePersonalityProfile } from '../lib/personalityProfile';
import type {
  Animal,
  AudioFrame,
  GateResult,
  MeasuredMetrics,
  Phase,
  Rating,
} from '../types';
import type { AnalysisResult } from '../analysis/types';

const RECORD_MS = 4000;

export function LessonPage() {
  const { animal: animalParam, lessonId } = useParams<{ animal: string; lessonId: string }>();
  const navigate = useNavigate();

  const lesson = getLessonById(lessonId ?? '');
  const animal = (animalParam ?? 'cat') as Animal;

  const [phase, setPhase] = useState<Phase>('idle');
  const [rating, setRating] = useState<Rating | null>(null);
  const [score, setScore] = useState(0);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [lastGate, setLastGate] = useState<GateResult | null>(null);
  const [lastMetrics, setLastMetrics] = useState<MeasuredMetrics | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analyser = useAudioAnalyser();
  const capture = useAudioCapture();
  const agentRef = useRef<AnimalCoachAgent | null>(null);
  const pendingKeyResolveRef = useRef<((key: string) => void) | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Frame accumulation for metrics
  const capturedFramesRef = useRef<AudioFrame[]>([]);
  const isCapturingRef = useRef(false);
  const currentGateRef = useRef<GateResult | null>(null);
  const currentScoreRef = useRef(0);
  const attemptCountRef = useRef(0);

  // Collect frames during recording
  useEffect(() => {
    if (isCapturingRef.current && analyser.active) {
      capturedFramesRef.current.push({ ...analyser.frame });
    }
  }, [analyser.frame, analyser.active]);

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
    if (!lesson) return;
    setPhase('connecting');
    setMicError(null);
    setRating(null);
    setLastGate(null);
    setLastMetrics(null);
    setXpEarned(null);

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

    const agent = new AnimalCoachAgent();
    agent.setCallbacks({
      onCoaching: (r) => {
        const gate = currentGateRef.current;
        setRating({
          score: currentScoreRef.current,
          comment: r.comment,
          heard: r.heard,
          category: r.category,
          passed: gate?.passed ?? false,
        });
      },
      onCoachingComplete: () => {
        setPhase((p) => (p === 'speaking' || p === 'evaluating' ? 'result' : p));
      },
      onError: (e) => {
        console.error('[agent error]', e);
        setPhase((p) => (p === 'speaking' ? 'result' : p));
      },
    });

    try {
      await agent.connect(apiKey, lesson);
    } catch (e) {
      console.error(e);
      setMicError('⚠ Agent connection failed — check your key');
      setPhase('idle');
      return;
    }

    agentRef.current = agent;
    setPhase('ready');
  }, [analyser, requestApiKey, lesson, animal]);

  const startRecording = useCallback(() => {
    const agent = agentRef.current;
    if (!agent || !lesson) return;

    setPhase('recording');
    setRating(null);
    setLastGate(null);
    setLastMetrics(null);
    setXpEarned(null);
    setAnalysis(null);

    capturedFramesRef.current = [];
    isCapturingRef.current = true;

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
      isCapturingRef.current = false;
      setPhase('evaluating');

      const samples = await capture.stopCapture();
      if (samples.length > 0) {
        analyzeAudio(samples, animal).then((result) => {
          if (result) {
            setAnalysis(result);
            const prog = updatePersonalityProfile(loadProgress(), animal, result);
            saveProgress(prog);
          }
        });
      }

      // Compute metrics locally
      const frames = capturedFramesRef.current;
      const metrics = computeMetricsFromFrames(frames, RECORD_MS);
      const breakdown = computeScore(metrics, lesson);
      const gate = checkVolumeGate(metrics, breakdown, lesson);

      attemptCountRef.current += 1;
      const isFirstAttempt = attemptCountRef.current === 1;

      currentGateRef.current = gate;
      currentScoreRef.current = Math.round(breakdown.overall * 10);
      setLastMetrics(metrics);
      setLastGate(gate);

      const dotScore = Math.min(5, Math.round(breakdown.overall * 5));
      setScore(dotScore);
      setPhase('speaking');

      if (gate.passed) {
        setXpEarned(lesson.xpReward);
        if (breakdown.overall >= 0.85) setConfettiBurst((b) => b + 1);
      }

      // Send to agent — onCoaching will refine the comment, onCoachingComplete transitions to result
      void agent.evaluateAttempt(metrics, gate, isFirstAttempt);
    }, RECORD_MS);
  }, [lesson, animal, analyser.stream, capture]);

  const handleNextLesson = useCallback(() => {
    if (!lesson) return;

    let prog = loadProgress();
    const score = lastGate?.breakdown.overall ?? 0;
    prog = markLessonComplete(prog, lesson.id, score);
    prog = awardXP(prog, lesson.xpReward);
    saveProgress(prog);

    // When the user is one lesson away from unlocking the certificate, start
    // generating the certificate portrait in the background so it is ready
    // (or close to it) by the time they claim the certificate.
    if (lesson.unit === 1 || lesson.unit === 2 || lesson.unit === 3) {
      const remaining = certificateLessons(animal, lesson.unit).filter(
        (l) => !prog.completedLessons.includes(l.id),
      ).length;
      if (remaining === 1) {
        prefetchPortrait({
          animal,
          unit: lesson.unit,
          profile: prog.personalityProfile?.[animal],
          proficiencyLabel: proficiencyForUnit(lesson.unit).label,
        });
      }
    }

    // If finishing this lesson completes the unit, send the user home and
    // auto-open the certificate claim flow so the reward is never missed.
    const unitJustCompleted =
      (lesson.unit === 1 || lesson.unit === 2 || lesson.unit === 3) &&
      isUnitComplete(animal, lesson.unit, prog);

    if (unitJustCompleted) {
      navigate('/', {
        state: { openCert: { animal, unit: lesson.unit as 1 | 2 | 3 } },
      });
      return;
    }

    const next = getNextLesson(lesson.id);
    if (next) {
      navigate(`/lesson/${next.animal}/${next.id}`);
    } else {
      navigate('/');
    }
  }, [lesson, navigate, lastGate, animal]);

  const retryAttempt = useCallback(() => {
    setRating(null);
    setLastGate(null);
    setLastMetrics(null);
    setXpEarned(null);
    setAnalysis(null);
    setScore(0);
    startRecording();
  }, [startRecording]);

  const handlePracticeClick = useCallback(() => {
    if (phase === 'idle') {
      void bootSession();
    } else if (phase === 'ready') {
      startRecording();
    } else if (phase === 'result') {
      handleNextLesson();
    }
  }, [phase, bootSession, startRecording, handleNextLesson]);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current);
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
      isCapturingRef.current = false;
      agentRef.current?.disconnect();
    };
  }, []);

  const practiceButton = useMemo(() => {
    const theme = animal === 'cat' ? 'cat-theme' : 'dog-theme';
    const soundWord = animal === 'cat' ? '🐱' : '🐶';
    switch (phase) {
      case 'idle':
        return { label: `Start Lesson`, disabled: false, listening: false, theme };
      case 'connecting':
        return { label: 'Connecting coach…', disabled: true, listening: true, theme };
      case 'ready':
        return { label: `${soundWord} Record Attempt`, disabled: false, listening: false, theme };
      case 'recording':
        return { label: `Recording… ${countdown ?? ''}s`, disabled: true, listening: true, theme };
      case 'evaluating':
        return { label: 'Analyzing…', disabled: true, listening: true, theme };
      case 'speaking':
        return { label: 'Getting feedback…', disabled: true, listening: true, theme };
      case 'result':
        return { label: 'Continue', disabled: false, listening: false, theme };
      default:
        return { label: '', disabled: true, listening: false, theme };
    }
  }, [phase, animal, countdown, lesson]);

  if (!lesson) {
    return (
      <div className="app">
        <div className="idle-state">
          <span className="idle-emoji">❓</span>
          <div className="idle-text">Lesson not found</div>
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        </div>
      </div>
    );
  }

  const showPracticeUI = phase !== 'idle';

  return (
    <>
      <div className="app">
        {/* Lesson header */}
        <header className="lesson-header fade-up">
          <button className="lesson-back-btn" onClick={() => navigate('/')}>←</button>
          <div className="lesson-header-progress">
            <div className="lesson-progress-track">
              <div
                className={`lesson-progress-fill ${animal === 'cat' ? 'cat' : 'dog'}`}
                style={{ width: phase === 'idle' ? '0%' : phase === 'result' && lastGate?.passed ? '100%' : '50%' }}
              />
            </div>
          </div>
          <div className="lesson-header-xp">+{lesson.xpReward} XP</div>
        </header>

        <ScoreDots filled={score} />

        {/* Main content */}
        <div className="main">
          {!showPracticeUI ? (
            <div className="lesson-intro-duo fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="duo-prompt">
                <span className="duo-prompt-label">Say this to your {animal}</span>
              </div>

              <div className="duo-goal-phrase">
                <span className="duo-goal-icon"><LessonIcon icon={lesson.icon} size={32} /></span>
                <h2 className="duo-goal-text">"{lesson.meaning}"</h2>
              </div>

              <div className="duo-phonemes">
                {lesson.phonemes.map((p, i) => (
                  <span key={i} className={`duo-phoneme-chip ${animal === 'cat' ? 'cat-chip' : 'dog-chip'}`}>
                    {p}
                  </span>
                ))}
              </div>

              <div className="duo-how-card">
                <p className="duo-how-text">{lesson.instruction}</p>
                {LESSON_SOUNDS[lesson.id] && (
                  <SoundPreview src={LESSON_SOUNDS[lesson.id]} animal={animal} />
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Waveform volume={analyser.frame.volume} animal={animal} visible={analyser.active} />
              <TargetShape animal={animal} />
              <Meters volume={analyser.frame.volume} pitch={analyser.frame.pitch} animal={animal} />
              <FeedbackCard phase={phase} rating={rating} animal={animal} />

              {/* Metric breakdown shown after result */}
              {phase === 'result' && lastGate && lastMetrics && (
                <div className="metric-breakdown fade-up">
                  <MetricRow
                    label="Volume"
                    score={lastGate.breakdown.volume}
                    measured={`${lastMetrics.volume_rms_db.toFixed(1)} dB`}
                    target={`${lesson.targets.volume_rms_db[0]}–${lesson.targets.volume_rms_db[1]} dB`}
                  />
                  <MetricRow
                    label="Pitch"
                    score={lastGate.breakdown.pitch}
                    measured={lastMetrics.pitch_hz > 0 ? `${Math.round(lastMetrics.pitch_hz)} Hz` : '—'}
                    target={`${lesson.targets.pitch_hz[0]}–${lesson.targets.pitch_hz[1]} Hz`}
                  />
                  <MetricRow
                    label="Duration"
                    score={lastGate.breakdown.duration}
                    measured={`${Math.round(lastMetrics.duration_ms)} ms`}
                    target={`${lesson.targets.duration_ms[0]}–${lesson.targets.duration_ms[1]} ms`}
                  />
                </div>
              )}

              <AnalysisCard result={analysis} visible={phase === 'result'} />

              {/* XP earned banner */}
              {phase === 'result' && xpEarned !== null && (
                <div className="xp-earned-banner fade-up">
                  🌟 +{xpEarned} XP earned!
                </div>
              )}

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
          {phase === 'result' && (
            <button
              className={`practice-btn-secondary ${animal === 'cat' ? 'cat' : 'dog'}`}
              onClick={retryAttempt}
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      <Confetti burstId={confettiBurst} animal={animal} />
      <KeyModal open={keyModalOpen} onSubmit={handleKeySubmit} />
    </>
  );
}

function MetricRow({
  label,
  score,
  measured,
  target,
}: {
  label: string;
  score: number;
  measured: string;
  target: string;
}) {
  const pct = Math.round(score * 100);
  const passed = score >= 0.65;
  return (
    <div className="metric-row">
      <div className="metric-row-header">
        <span className="metric-row-label">{label}</span>
        <span className={`metric-row-status ${passed ? 'pass' : 'fail'}`}>
          {passed ? '✓' : '✗'} {pct}%
        </span>
      </div>
      <div className="metric-row-track">
        <div
          className={`metric-row-fill ${passed ? 'pass' : 'fail'}`}
          style={{ width: `${pct}%` }}
        />
        <div className="metric-row-goal-marker" style={{ left: '65%' }} />
      </div>
      <div className="metric-row-values">
        <span className="metric-measured">{measured}</span>
        <span className="metric-target">target: {target}</span>
      </div>
    </div>
  );
}
