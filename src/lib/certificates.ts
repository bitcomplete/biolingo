import { getLessonsByUnit, UNIT_TITLE_FOR_ANIMAL } from '../data/lessons';
import { DOG_BREED_LABELS, CAT_CONTEXT_LABELS } from '../analysis/types';
import type {
  AggregatedProfile,
  Animal,
  CertificateRecord,
  ProficiencyLevel,
  UserProgress,
} from '../types';

export interface StandardsBoard {
  acronym: 'ICCSB' | 'IFCSB';
  fullName: string;
  examinerName: string;
  examinerTitle: string;
  hashtag: string;
}

export const ICCSB: StandardsBoard = {
  acronym: 'ICCSB',
  fullName: 'International Canine Communication Standards Board',
  examinerName: 'Dr. R. Biscuit',
  examinerTitle: 'Chair of Applied Canine Linguistics, ICCSB',
  hashtag: '#CanineLinguistics',
};

export const IFCSB: StandardsBoard = {
  acronym: 'IFCSB',
  fullName: 'International Feline Communication Standards Board',
  examinerName: 'Dr. M. Whiskers',
  examinerTitle: 'Chair of Applied Feline Linguistics, IFCSB',
  hashtag: '#FelineLinguistics',
};

export function getBoard(animal: Animal): StandardsBoard {
  return animal === 'dog' ? ICCSB : IFCSB;
}

const PROFICIENCY_FOR_UNIT: Record<number, { level: ProficiencyLevel; label: string }> = {
  1: { level: 'A1', label: 'A1 Beginner' },
  2: { level: 'A2', label: 'A2 Elementary' },
  3: { level: 'B1', label: 'B1 Intermediate' },
};

export function proficiencyForUnit(unit: number): {
  level: ProficiencyLevel;
  label: string;
} {
  return PROFICIENCY_FOR_UNIT[unit] ?? PROFICIENCY_FOR_UNIT[1];
}

const DOG_BREED_DIALECTS: Record<string, string> = {
  chihuahua: 'Chihuahua, Mesoamerican dialect',
  german_shepherd: 'German Shepherd, Central European dialect',
  husky: 'Siberian Husky, Northern Tundra dialect',
  pitbull: 'American Pitbull Terrier, North American dialect',
  shiba: 'Shiba Inu, Honshu dialect',
};

const CAT_BREED_DIALECTS: Record<string, string> = {
  maine_coon: 'Maine Coon, Northeast Atlantic dialect',
  european_shorthair: 'European Shorthair, Continental dialect',
};

export function breedDialect(animal: Animal, breedKey: string | undefined): string {
  if (!breedKey) {
    return animal === 'dog'
      ? 'Mixed-Breed Vernacular, North American dialect'
      : 'Mixed-Breed Vernacular, Continental dialect';
  }
  if (animal === 'dog') {
    if (DOG_BREED_DIALECTS[breedKey]) return DOG_BREED_DIALECTS[breedKey];
    const label = DOG_BREED_LABELS[breedKey as keyof typeof DOG_BREED_LABELS];
    return label ? `${label}, North American dialect` : `${breedKey}, North American dialect`;
  }
  if (CAT_BREED_DIALECTS[breedKey]) return CAT_BREED_DIALECTS[breedKey];
  return `${breedKey}, Continental dialect`;
}

export function breedLabel(animal: Animal, breedKey: string | undefined): string {
  if (!breedKey) return 'Mixed-Breed';
  if (animal === 'dog') {
    return DOG_BREED_LABELS[breedKey as keyof typeof DOG_BREED_LABELS] ?? breedKey;
  }
  if (breedKey === 'maine_coon') return 'Maine Coon';
  if (breedKey === 'european_shorthair') return 'European Shorthair';
  return breedKey;
}

export function moodLabel(animal: Animal, moodKey: string | undefined): string {
  if (!moodKey) return '';
  if (animal === 'cat') {
    return (
      CAT_CONTEXT_LABELS[moodKey as keyof typeof CAT_CONTEXT_LABELS] ?? moodKey
    );
  }
  return breedLabel('dog', moodKey);
}

export function certificateKey(animal: Animal, unit: number): string {
  return `${animal}_unit_${unit}`;
}

// A certificate unlocks once the learner finishes the first lessons of a unit,
// rather than every lesson in it.
export const LESSONS_REQUIRED_FOR_CERTIFICATE = 3;

export function certificateLessons(animal: Animal, unit: number) {
  return getLessonsByUnit(animal, unit).slice(0, LESSONS_REQUIRED_FOR_CERTIFICATE);
}

export function isUnitComplete(
  animal: Animal,
  unit: number,
  progress: UserProgress,
): boolean {
  const lessons = certificateLessons(animal, unit);
  if (lessons.length === 0) return false;
  return lessons.every((l) => progress.completedLessons.includes(l.id));
}

export function getCertificate(
  progress: UserProgress,
  animal: Animal,
  unit: number,
): CertificateRecord | undefined {
  return progress.certificates?.[certificateKey(animal, unit)];
}

function unitAverageScore(
  animal: Animal,
  unit: number,
  progress: UserProgress,
): number {
  const lessons = certificateLessons(animal, unit);
  if (lessons.length === 0) return 0;
  const sum = lessons.reduce(
    (acc, l) => acc + (progress.bestScores[l.id] ?? 0),
    0,
  );
  return sum / lessons.length;
}

export function issueCertificate(
  progress: UserProgress,
  animal: Animal,
  unit: 1 | 2 | 3,
): { progress: UserProgress; record: CertificateRecord } {
  const key = certificateKey(animal, unit);
  const existing = progress.certificates?.[key];
  if (existing) return { progress, record: existing };

  const profile = progress.personalityProfile?.[animal];
  const breedKey = profile?.topBreed || '';
  const topMood = profile?.topMood || '';
  const prof = proficiencyForUnit(unit);

  const record: CertificateRecord = {
    key,
    animal,
    unit,
    proficiency: prof.level,
    proficiencyLabel: prof.label,
    breedDialect: breedDialect(animal, breedKey),
    breedKey,
    topMood,
    issuedAt: new Date().toISOString(),
    averageScore: unitAverageScore(animal, unit, progress),
  };

  const nextProgress: UserProgress = {
    ...progress,
    certificates: {
      ...(progress.certificates ?? {}),
      [key]: record,
    },
  };
  return { progress: nextProgress, record };
}

export function updateCertificateImage(
  progress: UserProgress,
  key: string,
  imageDataUrl: string,
): UserProgress {
  const existing = progress.certificates?.[key];
  if (!existing) return progress;
  return {
    ...progress,
    certificates: {
      ...progress.certificates,
      [key]: { ...existing, imageDataUrl },
    },
  };
}

export function updateCertificateCopy(
  progress: UserProgress,
  key: string,
  patch: { imageDataUrl?: string; flavorLine?: string },
): UserProgress {
  const existing = progress.certificates?.[key];
  if (!existing) return progress;
  const next: CertificateRecord = { ...existing };
  if (patch.imageDataUrl !== undefined) next.imageDataUrl = patch.imageDataUrl;
  if (patch.flavorLine !== undefined) next.flavorLine = patch.flavorLine;
  return {
    ...progress,
    certificates: {
      ...progress.certificates,
      [key]: next,
    },
  };
}

export function unitTitleFor(animal: Animal, unit: number): string {
  return UNIT_TITLE_FOR_ANIMAL[animal][unit] ?? `Unit ${unit}`;
}

export function linkedInCaption(record: CertificateRecord): string {
  const board = getBoard(record.animal);
  const unitTitle = unitTitleFor(record.animal, record.unit);
  return [
    `I'm proud to share that I've just earned my "${unitTitle}" certificate! 🎓`,
    '',
    `After completing the coursework, I'm now ${record.proficiencyLabel} certified in ${record.breedDialect} by the ${board.fullName} (${board.acronym}) through Biolingo.`,
    '',
    'Grateful for the journey and excited to keep building on these skills, professionally and personally. Onward and upward!',
    '',
    `${board.hashtag} #Certified #Interspecies #LifelongLearning`,
  ].join('\n');
}

export function statementOfRecognition(animal: Animal): string {
  const board = getBoard(animal);
  return `This certification is recognized by the ${board.fullName} and its 0 member institutions worldwide.`;
}

export function formatIssueDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function describePersonality(
  animal: Animal,
  profile: AggregatedProfile | undefined,
): string {
  if (!profile || profile.attempts === 0) {
    return animal === 'dog'
      ? 'an enthusiastic, expressive vocalist'
      : 'a discerning, articulate vocalist';
  }
  const breed = breedLabel(animal, profile.topBreed);
  const mood = moodLabel(animal, profile.topMood);
  if (animal === 'cat') {
    return `a ${breed}-leaning vocalist with a "${mood}" temperament`;
  }
  return `a ${breed}-leaning vocalist with strong ${mood ? breedLabel('dog', profile.topMood) : breed} energy`;
}
