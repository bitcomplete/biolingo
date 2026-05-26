import type { Phase, Rating, RatingCategory } from '../types';

interface Props {
  phase: Phase;
  rating: Rating | null;
}

const CATEGORY_ICON: Record<RatingCategory, string> = {
  masterpiece: '🏆',
  solid: '✨',
  passable: '🤷',
  too_quiet: '🔈',
  too_loud: '📢',
  wrong_species: '🤡',
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

function viewForPhase(phase: Phase, rating: Rating | null): View {
  switch (phase) {
    case 'connecting':
      return { icon: '🎭', text: 'Warming up the critic…', hint: 'connecting to the judge', ringClass: 'thinking', showScore: false, success: false };
    case 'recording':
      return { icon: '👂', text: 'Listening…', hint: 'make your sound now', ringClass: 'active', showScore: false, success: false };
    case 'evaluating':
      return { icon: '🤔', text: 'The critic is judging…', hint: 'brace yourself', ringClass: 'thinking', showScore: false, success: false };
    case 'speaking':
    case 'result':
      if (rating) {
        return {
          icon: CATEGORY_ICON[rating.category] || '🎭',
          text: rating.comment,
          hint: phase === 'speaking' ? 'the verdict is being delivered…' : rating.category.replace(/_/g, ' '),
          ringClass: phase === 'speaking' ? 'thinking' : '',
          showScore: true,
          success: rating.score >= 7,
        };
      }
      return { icon: '🎭', text: '…', hint: '', ringClass: '', showScore: false, success: false };
    case 'ready':
    default:
      return { icon: '🎤', text: 'Ready when you are', hint: 'tap to perform', ringClass: '', showScore: false, success: false };
  }
}

export function FeedbackCard({ phase, rating }: Props) {
  const view = viewForPhase(phase, rating);

  return (
    <div className={`feedback-card fade-up ${view.success ? 'success-glow' : ''}`} style={{ animationDelay: '.2s' }}>
      <div className={`listening-ring ${view.ringClass}`} />
      {view.showScore && rating && (
        <div className="feedback-score">{rating.score}/10</div>
      )}
      <div className="feedback-icon">{view.icon}</div>
      <div className="feedback-text">{view.text}</div>
      <div className="feedback-hint">{view.hint}</div>
    </div>
  );
}
