import { getLessonsByPhase, getLessonsForAnimal, PHASES_FOR_ANIMAL } from '../data/lessons';
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
  } catch (e) {
    console.warn('[progress] Failed to load from localStorage:', e);
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('biolingo-progress-updated'));
  } catch (e) {
    console.warn('[progress] Failed to save to localStorage:', e);
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

export function isPhaseComplete(
  animal: 'cat' | 'dog',
  phase: number,
  progress: UserProgress,
): boolean {
  const phaseLessons = getLessonsByPhase(animal, phase);
  return (
    phaseLessons.length > 0 &&
    phaseLessons.every((l) => progress.completedLessons.includes(l.id))
  );
}

export function isLessonUnlocked(lessonId: string, progress: UserProgress): boolean {
  for (const animal of ['cat', 'dog'] as const) {
    const lesson = getLessonsForAnimal(animal).find((l) => l.id === lessonId);
    if (!lesson) continue;
    if (lesson.phase === 1) return true;
    return isPhaseComplete(animal, lesson.phase - 1, progress);
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
): { completed: number; total: number; phases: Record<number, { completed: number; total: number }> } {
  const lessons = getLessonsForAnimal(animal);
  const phases: Record<number, { completed: number; total: number }> = {};
  for (const phase of PHASES_FOR_ANIMAL[animal]) {
    const phaseLessons = lessons.filter((l) => l.phase === phase);
    const completedCount = phaseLessons.filter((l) =>
      progress.completedLessons.includes(l.id),
    ).length;
    phases[phase] = { completed: completedCount, total: phaseLessons.length };
  }
  const completed = lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  return { completed, total: lessons.length, phases };
}
