export type Animal = 'cat' | 'dog';

export type Phase =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'recording'
  | 'evaluating'
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
