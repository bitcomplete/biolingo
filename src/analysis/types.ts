export type CatContext = 'food' | 'isolation' | 'brushing';
export type CatBreed = 'maine_coon' | 'european_shorthair';

export type AnimalSex = 'male' | 'female';

export type DogBreed = 'chihuahua' | 'german_shepherd' | 'husky' | 'pitbull' | 'shiba';
export type DogSex = AnimalSex;

export interface CatManifestEntry {
  id: string;
  context: CatContext;
  breed: CatBreed;
  sex: AnimalSex;
  features: number[];
}

export interface DogManifestEntry {
  id: string;
  breed: DogBreed;
  sex: DogSex;
  features: number[];
}

export interface CatManifest {
  sampleRate: number;
  numMfcc: number;
  entries: CatManifestEntry[];
}

export interface DogManifest {
  sampleRate: number;
  numMfcc: number;
  entries: DogManifestEntry[];
}

export interface BreedScore {
  breed: DogBreed;
  label: string;
  pct: number;
}

export interface CatAnalysis {
  animal: 'cat';
  confidence: number;
  context: CatContext;
  contextLabel: string;
  breed: CatBreed;
  sex: AnimalSex | null;
  nearestId: string;
  translation: string;
}

export interface DogAnalysis {
  animal: 'dog';
  confidence: number;
  isAuthentic: boolean;
  breeds: BreedScore[];
  sex: DogSex | null;
  translation: string;
}

export type AnalysisResult = CatAnalysis | DogAnalysis;

export const DOG_BREED_LABELS: Record<DogBreed, string> = {
  chihuahua: 'Chihuahua',
  german_shepherd: 'German Shepherd',
  husky: 'Husky',
  pitbull: 'Pitbull',
  shiba: 'Shiba Inu',
};

export const CAT_CONTEXT_LABELS: Record<CatContext, string> = {
  food: 'Hungry & Demanding',
  isolation: 'Lonely & Calling Out',
  brushing: 'Content & Affectionate',
};

export const CAT_CONTEXT_LESSON_MATCH: Record<CatContext, string[]> = {
  food: ['cat_demand_1', 'cat_complaint_1'],
  isolation: ['cat_distress_2', 'cat_complaint_1', 'cat_territory_2'],
  brushing: ['cat_greeting_1', 'cat_ack_1', 'cat_affection_2', 'cat_question_2'],
};
