import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getLessonsByPhase,
  PHASES_FOR_ANIMAL,
  PHASE_TITLE_FOR_ANIMAL,
} from '../data/lessons';
import {
  getCompletionStats,
  getLessonStatus,
  getXPLevel,
  loadProgress,
} from '../lib/progress';
import type { Animal } from '../types';

export function HomePage() {
  const [animal, setAnimal] = useState<Animal>('cat');
  const navigate = useNavigate();
  const progress = loadProgress();
  const { level, xpInLevel, xpToNext } = getXPLevel(progress.xp);
  const xpPct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));

  const stats = getCompletionStats(animal, progress);

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header fade-up">
        <div className="home-logo">Biolingo</div>
        <div className="home-meta">
          <div className="xp-badge">
            <span className="xp-level">Lv {level}</span>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <span className="xp-total">{progress.xp} XP</span>
          </div>
          {progress.streakDays > 0 && (
            <div className="streak-badge">🔥 {progress.streakDays}d</div>
          )}
        </div>
      </header>

      {/* Animal tab switcher */}
      <div className="animal-tabs">
        <button
          className={`animal-tab ${animal === 'cat' ? 'active cat' : ''}`}
          onClick={() => setAnimal('cat')}
        >
          <span>🐱</span>
          <span>Cat</span>
        </button>
        <button
          className={`animal-tab ${animal === 'dog' ? 'active dog' : ''}`}
          onClick={() => setAnimal('dog')}
        >
          <span>🐶</span>
          <span>Dog</span>
        </button>
      </div>

      {/* Progress summary */}
      <div className="progress-summary fade-up" style={{ animationDelay: '0.05s' }}>
        <span className="progress-summary-text">
          {stats.completed}/{stats.total} lessons complete
        </span>
        <div className="progress-summary-bar">
          <div
            className={`progress-summary-fill ${animal === 'cat' ? 'cat' : 'dog'}`}
            style={{ width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Skill tree */}
      <div className="skill-tree fade-up" style={{ animationDelay: '0.1s' }}>
        {PHASES_FOR_ANIMAL[animal].map((phase) => {
          const lessons = getLessonsByPhase(animal, phase);
          const phaseTitle = PHASE_TITLE_FOR_ANIMAL[animal][phase];
          const phaseStats = stats.phases[phase];
          const phaseAllComplete = phaseStats.completed === phaseStats.total;
          const phaseStarted = phaseStats.completed > 0;
          const firstLessonStatus = getLessonStatus(lessons[0]?.id ?? '', progress);
          const phaseLocked = firstLessonStatus === 'locked';

          return (
            <div
              key={phase}
              className={`phase-section ${phaseLocked ? 'locked' : ''}`}
            >
              <div className="phase-header">
                <div className="phase-header-left">
                  <span className="phase-number">Phase {phase}</span>
                  <span className="phase-title">{phaseTitle}</span>
                </div>
                <div className="phase-header-right">
                  {phaseLocked ? (
                    <span className="phase-badge locked-badge">🔒 Locked</span>
                  ) : phaseAllComplete ? (
                    <span className="phase-badge done-badge">✓ Done</span>
                  ) : phaseStarted ? (
                    <span className="phase-badge active-badge">In Progress</span>
                  ) : null}
                </div>
              </div>

              <div className="lesson-grid">
                {lessons.map((lesson) => {
                  const status = getLessonStatus(lesson.id, progress);
                  const best = progress.bestScores[lesson.id];
                  return (
                    <button
                      key={lesson.id}
                      className={`lesson-node ${status} ${animal}`}
                      disabled={status === 'locked'}
                      onClick={() => navigate(`/lesson/${animal}/${lesson.id}`)}
                      aria-label={`${lesson.title} — ${status}`}
                    >
                      <div className="lesson-node-inner">
                        <span className="lesson-node-emoji">{lesson.emoji}</span>
                        {status === 'locked' && (
                          <span className="lesson-lock-icon">🔒</span>
                        )}
                        {status === 'completed' && (
                          <span className="lesson-check-icon">✓</span>
                        )}
                      </div>
                      <span className="lesson-node-title">{lesson.title}</span>
                      {status === 'completed' && best !== undefined && (
                        <span className="lesson-node-score">{Math.round(best * 100)}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <button className="home-footer-link" onClick={() => navigate('/roadmap')}>
          View Roadmap →
        </button>
        <div className="home-disclaimer">
          For entertainment & education only. Not scientifically validated interspecies communication.
        </div>
      </footer>
    </div>
  );
}
