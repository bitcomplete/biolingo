import type { FailReason, Phase, Rating, RatingCategory } from '../types';
import { failReasonsToHint } from '../lib/scoring';

interface Props {
  phase: Phase;
  rating: Rating | null;
  attemptNumber?: number;
  failReasons?: FailReason[];
}

const CATEGORY_ICON: Record<RatingCategory, string> = {
  masterpiece: '🏆',
  solid: '✨',
  passable: '👍',
  too_quiet: '🔈',
  too_loud: '📢',
  wrong_pitch: '🎵',
  silence: '🦗',
  chaos: '🌪️',
};

interface View {
  icon: string;
  text: string;
  hint: string;
  ringClass: string;
  showScore: boolean;
  success: boolean;
}

function resultHint(
  passed: boolean,
  failReasons: FailReason[] | undefined,
  attemptNumber: number | undefined,
): string {
  if (passed) return 'Lesson complete!';
  const fix = failReasonsToHint(failReasons ?? []);
  return attemptNumber ? `Attempt ${attemptNumber} — ${fix}` : fix;
}

function viewForPhase(
  phase: Phase,
  rating: Rating | null,
  attemptNumber?: number,
  failReasons?: FailReason[],
): View {
  switch (phase) {
    case 'connecting':
      return { icon: '🎓', text: 'Connecting your coach…', hint: 'setting up the session', ringClass: 'thinking', showScore: false, success: false };
    case 'recording':
      return { icon: '👂', text: 'Listening…', hint: 'make your sound now', ringClass: 'active', showScore: false, success: false };
    case 'evaluating':
      return { icon: '🔬', text: 'Analyzing your attempt…', hint: 'checking your metrics', ringClass: 'thinking', showScore: false, success: false };
    case 'speaking':
      if (rating) {
        return {
          icon: CATEGORY_ICON[rating.category] || '🎓',
          text: rating.comment,
          hint: rating.passed ? 'passed!' : failReasonsToHint(failReasons ?? []),
          ringClass: '',
          showScore: false,
          success: rating.passed,
        };
      }
      return { icon: '🤔', text: 'Getting feedback…', hint: '', ringClass: 'thinking', showScore: false, success: false };
    case 'result':
      if (rating) {
        return {
          icon: rating.passed ? '🎉' : CATEGORY_ICON[rating.category] || '🎓',
          text: rating.comment,
          hint: resultHint(rating.passed, failReasons, attemptNumber),
          ringClass: '',
          showScore: rating.passed,
          success: rating.passed,
        };
      }
      return { icon: '🎓', text: '…', hint: '', ringClass: '', showScore: false, success: false };
    case 'ready':
    default:
      return { icon: '🎤', text: 'Coach is ready', hint: 'tap the button to record', ringClass: '', showScore: false, success: false };
  }
}

export function FeedbackCard({ phase, rating, attemptNumber, failReasons }: Props) {
  const view = viewForPhase(phase, rating, attemptNumber, failReasons);

  return (
    <div className={`feedback-card fade-up ${view.success ? 'success-glow' : ''}`} style={{ animationDelay: '.2s' }}>
      <div className={`listening-ring ${view.ringClass}`} />
      {view.showScore && rating && (
        <div className="feedback-score">{rating.score}/10</div>
      )}
      <div className="feedback-icon">{view.icon}</div>
      <div className="feedback-text">{view.text}</div>
      <div className={`feedback-hint ${view.success ? '' : 'feedback-hint-fail'}`}>{view.hint}</div>
    </div>
  );
}
