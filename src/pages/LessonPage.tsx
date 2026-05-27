import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Waveform } from '../components/Waveform';
import { TargetShape } from '../components/TargetShape';
import { Meters } from '../components/Meters';
import { FeedbackCard } from '../components/FeedbackCard';
import { AnalysisCard } from '../components/AnalysisCard';
import { Confetti } from '../components/Confetti';
import { KeyModal } from '../components/KeyModal';
import { ScoreDots } from '../components/ScoreDots';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { useAudioCapture, TARGET_SAMPLE_RATE } from '../hooks/useAudioCapture';
import { AnimalCoachAgent } from '../agent';
import { analyzeAudio } from '../analysis/matcher';
import { getStoredKey, storeKey } from '../apiKey';
import { getLessonById, getNextLesson } from '../data/lessons';
import { LESSON_SOUNDS } from '../data/sounds';
import { SoundPreview } from '../components/SoundPreview';
import {
  checkVolumeGate,
  computeScore,
  failReasonsToRatingCategory,
  formatDbRange,
  getRelaxedTargets,
  measureNoiseFloor,
  METRIC_PASS_THRESHOLD,
  resolveRecordingMetrics,
  roundDb,
} from '../lib/scoring';
import { awardXP, loadProgress, markLessonComplete, saveProgress } from '../lib/progress';
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
  const [attemptNumber, setAttemptNumber] = useState(0);

  const analyser = useAudioAnalyser();
  const capture = useAudioCapture();
  const agentRef = useRef<AnimalCoachAgent | null>(null);
  const pendingKeyResolveRef = useRef<((key: string) => void) | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const sampleTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Frame accumulation for metrics
  const capturedFramesRef = useRef<AudioFrame[]>([]);
  const isCapturingRef = useRef(false);
  const currentGateRef = useRef<GateResult | null>(null);
  const currentScoreRef = useRef(0);
  const attemptCountRef = useRef(0);
  const noiseFloorRef = useRef(0);

  // Collect frames during recording (20ms polling — React effect misses most RAF ticks)
  useEffect(() => {
    return () => {
      if (sampleTimerRef.current) window.clearInterval(sampleTimerRef.current);
    };
  }, []);

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

    noiseFloorRef.current = await measureNoiseFloor(() => analyser.readFrame());

    const agent = new AnimalCoachAgent();
    agent.setCallbacks({
      onCoaching: (r) => {
        const gate = currentGateRef.current;
        const passed = gate?.passed ?? false;
        setRating({
          score: currentScoreRef.current,
          comment: r.comment,
          category: passed ? r.category : failReasonsToRatingCategory(gate?.failReasons ?? []),
          passed,
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

    sampleTimerRef.current = window.setInterval(() => {
      if (isCapturingRef.current) {
        capturedFramesRef.current.push(analyser.readFrame());
      }
    }, 20);
    capturedFramesRef.current.push(analyser.readFrame());

    const stream = analyser.getStream();
    if (stream) {
      capture.startCapture(stream);
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
      if (sampleTimerRef.current) window.clearInterval(sampleTimerRef.current);
      sampleTimerRef.current = null;
      setCountdown(null);
      isCapturingRef.current = false;
      setPhase('evaluating');

      const samples = await capture.stopCapture();
      if (samples.length > 0) {
        analyzeAudio(samples, animal).then((result) => {
          if (result) setAnalysis(result);
        });
      }

      const frames = capturedFramesRef.current;
      const metrics = resolveRecordingMetrics(
        frames,
        samples,
        TARGET_SAMPLE_RATE,
        RECORD_MS,
        noiseFloorRef.current,
      );
      const breakdown = computeScore(metrics, lesson);
      const gate = checkVolumeGate(metrics, breakdown, lesson);

      attemptCountRef.current += 1;
      const attemptNumber = attemptCountRef.current;

      currentGateRef.current = gate;
      currentScoreRef.current = Math.round(breakdown.overall * 10);
      setAttemptNumber(attemptNumber);
      setLastMetrics(metrics);
      setLastGate(gate);

      const dotScore = Math.min(5, Math.round(breakdown.overall * 5));
      setScore(dotScore);
      setPhase('speaking');

      if (gate.passed) {
        // Award XP and save progress
        const xp = lesson.xpReward;
        let prog = loadProgress();
        prog = markLessonComplete(prog, lesson.id, breakdown.overall);
        prog = awardXP(prog, xp);
        saveProgress(prog);
        setXpEarned(xp);
        if (breakdown.overall >= 0.85) setConfettiBurst((b) => b + 1);
      }

      // Send to agent — onCoaching will refine the comment, onCoachingComplete transitions to result
      void agent.evaluateAttempt(metrics, gate);
    }, RECORD_MS);
  }, [lesson, animal, analyser, capture]);

  const handlePracticeClick = useCallback(() => {
    if (phase === 'idle') {
      void bootSession();
    } else if (phase === 'ready' || phase === 'result') {
      startRecording();
    }
  }, [phase, bootSession, startRecording]);

  const handleNextLesson = useCallback(() => {
    if (!lesson) return;
    const next = getNextLesson(lesson.id);
    if (next) {
      navigate(`/lesson/${next.animal}/${next.id}`);
    } else {
      navigate('/');
    }
  }, [lesson, navigate]);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current);
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
      if (sampleTimerRef.current) window.clearInterval(sampleTimerRef.current);
      isCapturingRef.current = false;
      agentRef.current?.disconnect();
    };
  }, []);

  const practiceButton = useMemo(() => {
    const theme = animal === 'cat' ? 'cat-theme' : 'dog-theme';
    const soundWord = animal === 'cat' ? lesson?.emoji ?? '🐱' : lesson?.emoji ?? '🐶';
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
        return { label: 'Try Again', disabled: false, listening: false, theme };
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
  const targets = getRelaxedTargets(lesson.targets);

  return (
    <>
      <div className="app">
        {/* Lesson header */}
        <header className="lesson-header fade-up">
          <button className="lesson-back-btn" onClick={() => navigate('/')}>←</button>
          <div className="lesson-header-info">
            <span className="lesson-header-phase">
              {lesson.animal === 'cat' ? '🐱' : '🐶'} Phase {lesson.phase}
            </span>
            <span className="lesson-header-title">{lesson.title}</span>
          </div>
          <div className="lesson-header-xp">+{lesson.xpReward} XP</div>
        </header>

        <ScoreDots filled={score} />

        {/* Main content */}
        <div className="main">
          {!showPracticeUI ? (
            <div className="lesson-intro fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="lesson-intro-emoji">{lesson.emoji}</div>
              <h2 className="lesson-intro-title">{lesson.title}</h2>
              <p className="lesson-intro-description">{lesson.description}</p>
              <div className="lesson-intro-instruction">
                <span className="lesson-intro-instruction-label">How to do it</span>
                <p className="lesson-intro-instruction-text">{lesson.instruction}</p>
                {LESSON_SOUNDS[lesson.id] && (
                  <SoundPreview src={LESSON_SOUNDS[lesson.id]} animal={animal} />
                )}
              </div>
              <div className="lesson-targets">
                <div className="lesson-targets-label">Target Ranges</div>
                <div className="lesson-targets-row">
                  <div className="target-range-pill">
                    <span className="target-range-name">Volume (peak)</span>
                    <span className="target-range-val">
                      {formatDbRange(targets.volume_rms_db)}
                    </span>
                  </div>
                  <div className="target-range-pill">
                    <span className="target-range-name">Pitch</span>
                    <span className="target-range-val">
                      {targets.pitch_hz[0]}–{targets.pitch_hz[1]} Hz
                    </span>
                  </div>
                  <div className="target-range-pill">
                    <span className="target-range-name">Duration</span>
                    <span className="target-range-val">
                      {targets.duration_ms[0]}–{targets.duration_ms[1]} ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Waveform volume={analyser.frame.volume} animal={animal} visible={analyser.active} />
              <TargetShape animal={animal} />
              <Meters
                volume={analyser.frame.volume}
                pitch={analyser.frame.pitch}
                animal={animal}
                noiseFloorRms={noiseFloorRef.current}
                volumeTarget={targets.volume_rms_db}
                pitchTarget={targets.pitch_hz}
              />
              {phase === 'result' && lastGate && lastMetrics && (
                <div className="metric-breakdown fade-up">
                  <MetricRow
                    label="Volume (peak)"
                    score={lastGate.breakdown.volume}
                    measured={`${roundDb(lastMetrics.peak_db)} dB`}
                    target={formatDbRange(targets.volume_rms_db)}
                  />
                  <MetricRow
                    label="Pitch"
                    score={lastGate.breakdown.pitch}
                    measured={lastMetrics.pitch_hz > 0 ? `${Math.round(lastMetrics.pitch_hz)} Hz` : '—'}
                    target={`${targets.pitch_hz[0]}–${targets.pitch_hz[1]} Hz`}
                  />
                  <MetricRow
                    label="Duration"
                    score={lastGate.breakdown.duration}
                    measured={`${Math.round(lastMetrics.duration_ms)} ms`}
                    target={`${targets.duration_ms[0]}–${targets.duration_ms[1]} ms`}
                  />
                </div>
              )}
              <FeedbackCard
                phase={phase}
                rating={rating}
                attemptNumber={phase === 'result' ? attemptNumber : undefined}
                failReasons={lastGate?.failReasons}
              />

              <AnalysisCard result={analysis} visible={phase === 'result'} lessonId={lesson.id} />

              {/* XP earned banner */}
              {phase === 'result' && xpEarned !== null && (
                <div className="xp-earned-banner fade-up">
                  🌟 +{xpEarned} XP earned!
                </div>
              )}

              {/* Next lesson button */}
              {phase === 'result' && lastGate?.passed && (
                <button
                  className={`next-lesson-btn ${animal === 'cat' ? 'cat-theme' : 'dog-theme'}`}
                  onClick={handleNextLesson}
                >
                  Next Lesson →
                </button>
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
  const passed = score >= METRIC_PASS_THRESHOLD;
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
        <div className="metric-row-goal-marker" style={{ left: `${METRIC_PASS_THRESHOLD * 100}%` }} />
      </div>
      <div className="metric-row-values">
        <span className="metric-measured">{measured}</span>
        <span className="metric-target">target: {target}</span>
      </div>
    </div>
  );
}
