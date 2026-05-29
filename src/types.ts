export type Animal = 'cat' | 'dog';

export type Phase =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'recording'
  | 'evaluating'
  | 'speaking'
  | 'result';

export type RatingCategory =
  | 'masterpiece'
  | 'solid'
  | 'passable'
  | 'too_quiet'
  | 'too_loud'
  | 'wrong_phoneme'
  | 'wrong_duration'
  | 'threat_display'
  | 'silence'
  | 'total_failure';

export interface Rating {
  score: number;
  comment: string;
  category: RatingCategory;
  passed: boolean;
  heard?: string;
}

// --- Lesson System ---

export interface LessonTargets {
  volume_rms_db: [number, number];
  pitch_hz: [number, number];
  duration_ms: [number, number];
  attack_ms?: [number, number];
  burst_count?: [number, number];
  burst_spacing_ms?: [number, number];
}

export interface Lesson {
  id: string;
  animal: Animal;
  unit: 1 | 2 | 3 | 4 | 5;
  unitTitle: string;
  title: string;
  description: string;
  icon: string;
  instruction: string;
  targets: LessonTargets;
  xpReward: number;
  aiContext: string;
  phonemes: string[];
  meaning: string;
  commonFailure?: string;
  animalHears?: string;
}

export interface MeasuredMetrics {
  volume_rms_db: number;
  peak_db: number;
  pitch_hz: number;
  duration_ms: number;
  attack_ms: number;
  burst_count: number;
  burst_spacing_ms: number;
  silence_ratio: number;
}

export type FailReason =
  | 'too_loud'
  | 'too_quiet'
  | 'wrong_pitch'
  | 'too_short'
  | 'too_long'
  | 'silence';

export interface ScoreBreakdown {
  volume: number;
  pitch: number;
  cadence: number;
  duration: number;
  overall: number;
}

export interface GateResult {
  passed: boolean;
  failReasons: FailReason[];
  breakdown: ScoreBreakdown;
}

export interface AggregatedProfile {
  attempts: number;
  topBreed: string;
  breedVotes: Record<string, number>;
  topMood: string;
  moodVotes: Record<string, number>;
  sexVotes: { male: number; female: number };
  avgConfidence: number;
}

export type ProficiencyLevel = 'A1' | 'A2' | 'B1';

export interface CertificateRecord {
  key: string;
  animal: Animal;
  unit: 1 | 2 | 3;
  proficiency: ProficiencyLevel;
  proficiencyLabel: string;
  breedDialect: string;
  breedKey: string;
  topMood: string;
  issuedAt: string;
  imageDataUrl?: string;
  flavorLine?: string;
  averageScore: number;
}

export interface UserProgress {
  xp: number;
  completedLessons: string[];
  bestScores: Record<string, number>;
  streakDays: number;
  lastPracticeDate: string;
  ownerName?: string;
  petNames?: { cat?: string; dog?: string };
  personalityProfile?: { cat?: AggregatedProfile; dog?: AggregatedProfile };
  certificates?: Record<string, CertificateRecord>;
}

export interface AudioFrame {
  volume: number;
  pitch: number;
}

export type Voice =
  | 'alloy'
  | 'ash'
  | 'ballad'
  | 'cedar'
  | 'coral'
  | 'echo'
  | 'marin'
  | 'sage'
  | 'shimmer'
  | 'verse';

export interface VoiceOption {
  id: Voice;
  label: string;
  hint: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'ballad', label: 'Ballad', hint: 'Theatrical, expressive (default)' },
  { id: 'ash', label: 'Ash', hint: 'Deeper, gravelly' },
  { id: 'verse', label: 'Verse', hint: 'Dramatic, varied' },
  { id: 'sage', label: 'Sage', hint: 'Calm, measured' },
  { id: 'cedar', label: 'Cedar', hint: 'Warm, steady' },
  { id: 'marin', label: 'Marin', hint: 'Soft, lyrical' },
  { id: 'coral', label: 'Coral', hint: 'Bright, upbeat' },
  { id: 'shimmer', label: 'Shimmer', hint: 'Lighter, airy' },
  { id: 'echo', label: 'Echo', hint: 'Even, neutral' },
  { id: 'alloy', label: 'Alloy', hint: 'Classic, balanced' },
];

export const DEFAULT_VOICE: Voice = 'ballad';
