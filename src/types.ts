export type Animal = 'cat' | 'dog';

export type PersonaMode = 'ramsay' | 'corporate';

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
  | 'wrong_species'
  | 'silence'
  | 'chaos';

export interface Rating {
  score: number;
  comment: string;
  category: RatingCategory;
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
