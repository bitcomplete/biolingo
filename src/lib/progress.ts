import { getLessonsForAnimal, UNITS_FOR_ANIMAL } from '../data/lessons';
import type { UserProgress } from '../types';

const STORAGE_KEY = 'biolingo_progress';

const EMPTY_PROGRESS: UserProgress = {
  xp: 0,
  completedLessons: [],
  bestScores: {},
  streakDays: 0,
  lastPracticeDate: '',
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as Partial<UserProgress>) };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage errors
  }
}

export function awardXP(progress: UserProgress, xp: number): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  const wasYesterday =
    progress.lastPracticeDate
      ? new Date(progress.lastPracticeDate).getTime() === new Date(today).getTime() - 86400000
      : false;
  const streakDays = wasYesterday ? progress.streakDays + 1 : progress.lastPracticeDate === today ? progress.streakDays : 1;
  return { ...progress, xp: progress.xp + xp, streakDays, lastPracticeDate: today };
}

export function markLessonComplete(
  progress: UserProgress,
  lessonId: string,
  score: number,
): UserProgress {
  const completed = progress.completedLessons.includes(lessonId)
    ? progress.completedLessons
    : [...progress.completedLessons, lessonId];
  const bestScores = {
    ...progress.bestScores,
    [lessonId]: Math.max(progress.bestScores[lessonId] ?? 0, score),
  };
  return { ...progress, completedLessons: completed, bestScores };
}

export function isLessonUnlocked(lessonId: string, progress: UserProgress): boolean {
  for (const animal of ['cat', 'dog'] as const) {
    const lessons = getLessonsForAnimal(animal);
    const idx = lessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) continue;
    if (idx === 0) return true;
    return progress.completedLessons.includes(lessons[idx - 1].id);
  }
  return false;
}

export function getLessonStatus(
  lessonId: string,
  progress: UserProgress,
): 'locked' | 'available' | 'completed' {
  if (progress.completedLessons.includes(lessonId)) return 'completed';
  if (isLessonUnlocked(lessonId, progress)) return 'available';
  return 'locked';
}

export function getXPLevel(xp: number): { level: number; xpInLevel: number; xpToNext: number } {
  // Simple level formula: each level needs (level * 50) XP
  let level = 1;
  let accumulated = 0;
  while (accumulated + level * 50 <= xp) {
    accumulated += level * 50;
    level++;
  }
  const xpToNext = level * 50;
  const xpInLevel = xp - accumulated;
  return { level, xpInLevel, xpToNext };
}

export function getCompletionStats(
  animal: 'cat' | 'dog',
  progress: UserProgress,
): { completed: number; total: number; units: Record<number, { completed: number; total: number }> } {
  const lessons = getLessonsForAnimal(animal);
  const units: Record<number, { completed: number; total: number }> = {};
  for (const unit of UNITS_FOR_ANIMAL[animal]) {
    const unitLessons = lessons.filter((l) => l.unit === unit);
    const completedCount = unitLessons.filter((l) =>
      progress.completedLessons.includes(l.id),
    ).length;
    units[unit] = { completed: completedCount, total: unitLessons.length };
  }
  const completed = lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  return { completed, total: lessons.length, units };
}
