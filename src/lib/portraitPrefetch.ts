import { generatePetPortrait } from './imageGen';
import type { AggregatedProfile, Animal } from '../types';

interface PrefetchOptions {
  animal: Animal;
  unit: number;
  profile?: AggregatedProfile;
  proficiencyLabel: string;
}

type PrefetchStatus = 'loading' | 'done' | 'error';

interface PrefetchEntry {
  status: PrefetchStatus;
  promise: ReturnType<typeof generatePetPortrait>;
  result?: Awaited<ReturnType<typeof generatePetPortrait>>;
}

const cache = new Map<string, PrefetchEntry>();

function cacheKey(animal: Animal, unit: number): string {
  return `${animal}_${unit}`;
}

export function prefetchPortrait(opts: PrefetchOptions): void {
  const key = cacheKey(opts.animal, opts.unit);
  if (cache.has(key)) return;

  const promise = generatePetPortrait({
    animal: opts.animal,
    profile: opts.profile,
    proficiencyLabel: opts.proficiencyLabel,
  });

  const entry: PrefetchEntry = { status: 'loading', promise };
  cache.set(key, entry);

  promise
    .then((result) => {
      entry.result = result;
      entry.status = result.error ? 'error' : 'done';
    })
    .catch(() => {
      entry.status = 'error';
    });
}

export function getPrefetched(animal: Animal, unit: number): PrefetchEntry | undefined {
  return cache.get(cacheKey(animal, unit));
}
