import type { AggregatedProfile, Animal, UserProgress } from '../types';
import type { AnalysisResult } from '../analysis/types';

const EMPTY: AggregatedProfile = {
  attempts: 0,
  topBreed: '',
  breedVotes: {},
  topMood: '',
  moodVotes: {},
  sexVotes: { male: 0, female: 0 },
  avgConfidence: 0,
};

function topKey(votes: Record<string, number>): string {
  let best = '';
  let bestCount = -1;
  for (const [k, v] of Object.entries(votes)) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best;
}

export function getProfile(
  progress: UserProgress,
  animal: Animal,
): AggregatedProfile {
  const existing = progress.personalityProfile?.[animal];
  if (!existing) return { ...EMPTY, breedVotes: {}, moodVotes: {}, sexVotes: { male: 0, female: 0 } };
  return existing;
}

export function updatePersonalityProfile(
  progress: UserProgress,
  animal: Animal,
  analysis: AnalysisResult,
): UserProgress {
  const prev = getProfile(progress, animal);
  const breedVotes = { ...prev.breedVotes };
  const moodVotes = { ...prev.moodVotes };
  const sexVotes = { ...prev.sexVotes };

  if (analysis.animal === 'cat') {
    breedVotes[analysis.breed] = (breedVotes[analysis.breed] ?? 0) + 1;
    moodVotes[analysis.context] = (moodVotes[analysis.context] ?? 0) + 1;
  } else {
    // Dog: weight top-K breeds by their pct so a 60% husky counts more than a 10% chihuahua
    for (const b of analysis.breeds) {
      breedVotes[b.breed] = (breedVotes[b.breed] ?? 0) + b.pct / 100;
    }
    // Use dominant breed itself as a mood token so the dog has a personality signature
    const dominant = analysis.breeds[0]?.breed ?? 'unknown';
    moodVotes[dominant] = (moodVotes[dominant] ?? 0) + 1;
  }

  if (analysis.sex === 'male') sexVotes.male += 1;
  else if (analysis.sex === 'female') sexVotes.female += 1;

  const attempts = prev.attempts + 1;
  const avgConfidence =
    (prev.avgConfidence * prev.attempts + analysis.confidence) / attempts;

  const next: AggregatedProfile = {
    attempts,
    breedVotes,
    moodVotes,
    sexVotes,
    topBreed: topKey(breedVotes),
    topMood: topKey(moodVotes),
    avgConfidence,
  };

  return {
    ...progress,
    personalityProfile: {
      ...(progress.personalityProfile ?? {}),
      [animal]: next,
    },
  };
}
