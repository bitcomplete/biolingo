import type { Animal } from '../types';
import { extractMfccFeatures } from './mfcc';
import { getCatTranslation, getDogTranslation, getNotBarkLine, getNotMeowLine } from './translations';
import {
  CAT_CONTEXT_LABELS,
  DOG_BREED_LABELS,
  type AnalysisResult,
  type CatManifest,
  type CatManifestEntry,
  type CatContext,
  type DogBreed,
  type DogManifest,
  type DogManifestEntry,
  type BreedScore,
} from './types';

let catManifest: CatManifest | null = null;
let dogManifest: DogManifest | null = null;

async function loadCatManifest(): Promise<CatManifest | null> {
  if (catManifest) return catManifest;
  try {
    const resp = await fetch('/manifests/cat-manifest.json');
    if (!resp.ok) return null;
    catManifest = await resp.json();
    return catManifest;
  } catch {
    return null;
  }
}

async function loadDogManifest(): Promise<DogManifest | null> {
  if (dogManifest) return dogManifest;
  try {
    const resp = await fetch('/manifests/dog-manifest.json');
    if (!resp.ok) return null;
    dogManifest = await resp.json();
    return dogManifest;
  } catch {
    return null;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

const BARK_THRESHOLD = 0.35;
const MEOW_THRESHOLD = 0.30;

function analyzeCat(
  features: number[],
  manifest: CatManifest,
): AnalysisResult {
  const scored = manifest.entries.map((entry) => ({
    entry,
    sim: cosineSimilarity(features, entry.features),
  }));
  scored.sort((a, b) => b.sim - a.sim);

  const topSim = scored[0]?.sim ?? 0;
  const confidence = Math.max(0, Math.min(100, Math.round(topSim * 100)));

  if (topSim < MEOW_THRESHOLD) {
    return {
      animal: 'cat',
      confidence,
      context: 'food',
      contextLabel: 'Unknown',
      breed: scored[0]?.entry.breed ?? 'european_shorthair',
      sex: null,
      nearestId: scored[0]?.entry.id ?? '',
      translation: getNotMeowLine(),
    };
  }

  const topK = scored.slice(0, 7);
  const contextVotes: Record<string, number> = {};
  const sexVotes: Record<string, number> = {};
  for (const { entry, sim } of topK) {
    const e = entry as CatManifestEntry;
    contextVotes[e.context] = (contextVotes[e.context] ?? 0) + sim;
    if (e.sex) {
      sexVotes[e.sex] = (sexVotes[e.sex] ?? 0) + sim;
    }
  }

  const winnerCtx = Object.entries(contextVotes).sort(
    (a, b) => b[1] - a[1],
  )[0][0] as CatContext;

  const winnerSex = Object.entries(sexVotes).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] as 'male' | 'female' | undefined;

  const nearest = scored[0].entry as CatManifestEntry;

  return {
    animal: 'cat',
    confidence,
    context: winnerCtx,
    contextLabel: CAT_CONTEXT_LABELS[winnerCtx],
    breed: nearest.breed,
    sex: winnerSex ?? null,
    nearestId: nearest.id,
    translation: getCatTranslation(winnerCtx),
  };
}

function analyzeDog(
  features: number[],
  manifest: DogManifest,
): AnalysisResult {
  const scored = manifest.entries.map((entry) => ({
    entry,
    sim: cosineSimilarity(features, entry.features),
  }));
  scored.sort((a, b) => b.sim - a.sim);

  const topSim = scored[0]?.sim ?? 0;
  const confidence = Math.max(0, Math.min(100, Math.round(topSim * 100)));
  const isAuthentic = topSim >= BARK_THRESHOLD;

  if (!isAuthentic) {
    return {
      animal: 'dog',
      confidence,
      isAuthentic: false,
      breeds: [],
      sex: null,
      translation: getNotBarkLine(),
    };
  }

  const topK = scored.slice(0, 10);
  const breedSims: Record<string, number[]> = {};
  const sexVotes: Record<string, number> = {};
  for (const { entry, sim } of topK) {
    const e = entry as DogManifestEntry;
    if (!breedSims[e.breed]) breedSims[e.breed] = [];
    breedSims[e.breed].push(sim);
    if (e.sex) {
      sexVotes[e.sex] = (sexVotes[e.sex] ?? 0) + sim;
    }
  }

  const total = Object.values(breedSims).reduce(
    (sum, arr) => sum + arr.reduce((s, v) => s + v, 0),
    0,
  );

  const breeds: BreedScore[] = Object.entries(breedSims)
    .map(([breed, sims]) => ({
      breed: breed as DogBreed,
      label: DOG_BREED_LABELS[breed as DogBreed] ?? breed,
      pct: Math.round((sims.reduce((s, v) => s + v, 0) / total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  const topBreed = breeds[0]?.breed ?? 'shiba';
  const winnerSex = Object.entries(sexVotes).sort((a, b) => b[1] - a[1])[0]?.[0] as
    | 'male'
    | 'female'
    | undefined;

  return {
    animal: 'dog',
    confidence,
    isAuthentic: true,
    breeds,
    sex: winnerSex ?? null,
    translation: getDogTranslation(topBreed),
  };
}

export async function analyzeAudio(
  samples: Float32Array,
  animal: Animal,
): Promise<AnalysisResult | null> {
  const features = extractMfccFeatures(samples);

  if (animal === 'cat') {
    const manifest = await loadCatManifest();
    if (!manifest || manifest.entries.length === 0) return null;
    return analyzeCat(features, manifest);
  } else {
    const manifest = await loadDogManifest();
    if (!manifest || manifest.entries.length === 0) return null;
    return analyzeDog(features, manifest);
  }
}
