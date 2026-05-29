import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getLessonsForAnimal,
  getLessonsByUnit,
  UNITS_FOR_ANIMAL,
  UNIT_TITLE_FOR_ANIMAL,
} from '../data/lessons';
import {
  getCompletionStats,
  getLessonStatus,
  getXPLevel,
  loadProgress,
  saveProgress,
} from '../lib/progress';
import {
  certificateKey,
  getCertificate,
  isUnitComplete,
  issueCertificate,
  LESSONS_REQUIRED_FOR_CERTIFICATE,
} from '../lib/certificates';
import { LessonIcon } from '../components/LessonIcon';
import { CertificateModal } from '../components/CertificateModal';
import { NameCaptureModal } from '../components/NameCaptureModal';
import type { Animal, CertificateRecord, Lesson, UserProgress } from '../types';

const UNIT_COLORS: Record<Animal, Record<number, string>> = {
  cat: {
    1: '#E85D75',
    2: '#C03A5A',
    3: '#8B1A3A',
  },
  dog: {
    1: '#E8941A',
    2: '#CC7A0E',
    3: '#A85D00',
  },
};

const UNIT_DESCRIPTIONS: Record<Animal, Record<number, string>> = {
  cat: {
    1: 'Master the essential feline phrases',
    2: 'Express complex cat emotions',
    3: 'Advanced diplomatic cat protocols',
  },
  dog: {
    1: 'Master the essential canine phrases',
    2: 'Express complex dog emotions',
    3: 'Advanced pack communication',
  },
};

function getSelectedLanguage(): Animal | null {
  try {
    const saved = localStorage.getItem('biolingo_language');
    return saved === 'cat' || saved === 'dog' ? saved : null;
  } catch {
    return null;
  }
}

function getPathOffset(index: number): number {
  return Math.sin(index * 0.85) * 68;
}

/* ── Bezier helpers for the paw-print trail ──────────────────── */

const TRAIL_W = 200;
const TRAIL_H = 48;

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function cubicTangent(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

type TrailStatus = 'locked' | 'available' | 'completed' | 'claimed';

function PawShape({ animal, color }: { animal: Animal; color: string }) {
  if (animal === 'cat') {
    return (
      <g fill={color}>
        <ellipse cx="0" cy="3.6" rx="4" ry="3.6" />
        <ellipse cx="-4.6" cy="-2" rx="1.7" ry="2.2" />
        <ellipse cx="-1.5" cy="-4.6" rx="1.8" ry="2.3" />
        <ellipse cx="1.7" cy="-4.6" rx="1.8" ry="2.3" />
        <ellipse cx="4.8" cy="-2" rx="1.7" ry="2.2" />
      </g>
    );
  }
  return (
    <g fill={color}>
      <ellipse cx="0" cy="3.8" rx="4.6" ry="4" />
      <ellipse cx="-5" cy="-1.7" rx="1.9" ry="2.4" />
      <ellipse cx="-1.7" cy="-4.8" rx="2" ry="2.5" />
      <ellipse cx="1.9" cy="-4.8" rx="2" ry="2.5" />
      <ellipse cx="5" cy="-1.7" rx="1.9" ry="2.4" />
    </g>
  );
}

function PathTrail({
  prevOffset,
  offset,
  status,
  unitColor,
  animal,
}: {
  prevOffset: number;
  offset: number;
  status: TrailStatus;
  unitColor: string;
  animal: Animal;
}) {
  const startX = 100 + (prevOffset - offset);
  const endX = 100;
  const startY = 0;
  const endY = TRAIL_H;

  // Soft S-curve: control points pulled toward the midline vertically.
  const c1x = startX;
  const c1y = TRAIL_H * 0.58;
  const c2x = endX;
  const c2y = TRAIL_H * 0.42;

  const trailColor =
    status === 'locked'
      ? '#3a3247'
      : status === 'completed'
      ? '#58CC02'
      : status === 'claimed'
      ? '#d6a13a'
      : unitColor;

  // 4 paws marching along the curve, alternating left/right of the path.
  const tValues = [0.16, 0.4, 0.64, 0.88];
  const paws = tValues.map((t, i) => {
    const px = cubicBezier(t, startX, c1x, c2x, endX);
    const py = cubicBezier(t, startY, c1y, c2y, endY);
    const dx = cubicTangent(t, startX, c1x, c2x, endX);
    const dy = cubicTangent(t, startY, c1y, c2y, endY);
    const tang = Math.atan2(dy, dx);
    const angleDeg = (tang * 180) / Math.PI + 90;
    const perpX = -Math.sin(tang);
    const perpY = Math.cos(tang);
    const side = i % 2 === 0 ? 1 : -1;
    const sideDist = 5.5;
    return {
      x: px + perpX * sideDist * side,
      y: py + perpY * sideDist * side,
      angle: angleDeg,
      i,
    };
  });

  return (
    <svg
      className={`path-trail ${status}`}
      viewBox={`0 0 ${TRAIL_W} ${TRAIL_H}`}
      width={TRAIL_W}
      height={TRAIL_H}
      aria-hidden="true"
    >
      {paws.map((paw) => (
        <g
          key={paw.i}
          transform={`translate(${paw.x} ${paw.y}) rotate(${paw.angle})`}
        >
          <g
            className="paw-print"
            style={{ animationDelay: `${0.05 + paw.i * 0.09}s` }}
          >
            <PawShape animal={animal} color={trailColor} />
          </g>
        </g>
      ))}
    </svg>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | { openCert?: { animal: Animal; unit: 1 | 2 | 3 } }
    | null
    | undefined;
  const initialAnimal: Animal =
    locationState?.openCert?.animal ?? getSelectedLanguage() ?? 'cat';
  const [animal, setAnimal] = useState<Animal>(initialAnimal);
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [pendingCert, setPendingCert] = useState<{ animal: Animal; unit: 1 | 2 | 3 } | null>(null);
  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const certAutoOpenedRef = useRef(false);

  const { level, xpInLevel, xpToNext } = getXPLevel(progress.xp);
  const xpPct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));
  const stats = getCompletionStats(animal, progress);
  const allLessons = getLessonsForAnimal(animal);

  const firstAvailableId = allLessons.find(
    (l) => getLessonStatus(l.id, progress) === 'available',
  )?.id;

  const openCertificate = useCallback(
    (targetAnimal: Animal, unit: 1 | 2 | 3) => {
      const current = loadProgress();
      if (!current.ownerName) {
        setPendingCert({ animal: targetAnimal, unit });
        return;
      }
      const existing = getCertificate(current, targetAnimal, unit);
      const { progress: next, record } = issueCertificate(current, targetAnimal, unit);
      saveProgress(next);
      setProgress(next);
      setCelebrate(!existing);
      setActiveCert(record);
    },
    [],
  );

  const handleNameCapture = useCallback(
    ({ ownerName }: { ownerName: string }) => {
      if (!pendingCert) return;
      const current = loadProgress();
      const existing = getCertificate(current, pendingCert.animal, pendingCert.unit);
      const withNames: UserProgress = {
        ...current,
        ownerName,
      };
      const { progress: next, record } = issueCertificate(
        withNames,
        pendingCert.animal,
        pendingCert.unit,
      );
      saveProgress(next);
      setProgress(next);
      setPendingCert(null);
      setCelebrate(!existing);
      setActiveCert(record);
    },
    [pendingCert],
  );

  // When the lesson page completes a unit it navigates here with
  // `state: { openCert: { animal, unit } }`. Pop the cert flow once.
  useEffect(() => {
    const target = locationState?.openCert;
    if (!target || certAutoOpenedRef.current) return;
    certAutoOpenedRef.current = true;
    setAnimal(target.animal);
    openCertificate(target.animal, target.unit);
    navigate(location.pathname, { replace: true, state: null });
  }, [locationState, openCertificate, navigate, location.pathname]);

  let globalIndex = 0;

  return (
    <div className="home-page">
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="topbar">
        <button
          className={`topbar-flag ${animal}`}
          onClick={() => setAnimal(animal === 'cat' ? 'dog' : 'cat')}
          aria-label="Switch animal"
        >
          <AnimalFace animal={animal} />
        </button>

        <div className="topbar-stat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9600" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 21c-4.4 0-8-1.8-8-4V7" /><path d="M4 7c0-2.2 3.6-4 8-4s8 1.8 8 4" />
            <path d="M20 7v10c0 2.2-3.6 4-8 4" /><ellipse cx="12" cy="7" rx="8" ry="4" />
          </svg>
          <span>{progress.xp}</span>
        </div>

        {progress.streakDays > 0 && (
          <div className="topbar-stat streak">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF4B4B" stroke="none">
              <path d="M12 23c-4.4 0-8-3.1-8-7.5 0-3.5 2.5-6.4 4-8 .3-.3.8-.1.8.3v3.7c0 .3.4.5.6.3l5.3-5.3c.2-.2.5-.2.7 0C18 9 20 12 20 15.5c0 4.4-3.6 7.5-8 7.5z" />
            </svg>
            <span>{progress.streakDays}</span>
          </div>
        )}

        <div className="topbar-stat hearts">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF4B4B" stroke="none">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          <span>5</span>
        </div>
      </header>

      {/* ── XP Level Bar ─────────────────────────────────────── */}
      <div className="level-bar">
        <span className="level-badge">Lv {level}</span>
        <div className="level-track">
          <div className="level-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      {/* ── Animal Tabs ──────────────────────────────────────── */}
      <div className="animal-tabs">
        <button
          className={`animal-tab ${animal === 'cat' ? 'active cat' : ''}`}
          onClick={() => setAnimal('cat')}
        >
          <AnimalFace animal="cat" size={22} />
          <span>Felinetics</span>
        </button>
        <button
          className={`animal-tab ${animal === 'dog' ? 'active dog' : ''}`}
          onClick={() => setAnimal('dog')}
        >
          <AnimalFace animal="dog" size={22} />
          <span>Caninetics</span>
        </button>
      </div>

      {/* ── Unit Path ────────────────────────────────────────── */}
      <div className="unit-path">
        {UNITS_FOR_ANIMAL[animal].map((unitNum) => {
          const lessons = getLessonsByUnit(animal, unitNum);
          const unitTitle = UNIT_TITLE_FOR_ANIMAL[animal][unitNum];
          const unitDesc = UNIT_DESCRIPTIONS[animal][unitNum];
          const unitColor = UNIT_COLORS[animal][unitNum];
          const unitStats = stats.units[unitNum];
          const allDone = unitStats.completed === unitStats.total;
          const firstInUnit = lessons[0];
          const unitLocked = firstInUnit
            ? getLessonStatus(firstInUnit.id, progress) === 'locked'
            : false;

          return (
            <div key={unitNum} className="unit-section fade-up" style={{ animationDelay: `${unitNum * 0.08}s` }}>
              {/* Unit Banner */}
              <div
                className={`unit-banner ${unitLocked ? 'locked' : ''}`}
                style={{ '--unit-color': unitColor } as React.CSSProperties}
              >
                <div className="unit-banner-left">
                  <span className="unit-banner-num">Unit {unitNum}</span>
                  <span className="unit-banner-title">{unitTitle}</span>
                  <span className="unit-banner-desc">{unitDesc}</span>
                </div>
                <div className="unit-banner-right">
                  {allDone ? (
                    <div className="unit-badge-done">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  ) : (
                    <span className="unit-progress-label">
                      {unitStats.completed}/{unitStats.total}
                    </span>
                  )}
                </div>
              </div>

              {/* Lesson Trail */}
              <div className="lesson-trail">
                {(() => {
                  // The certificate sits right after the lessons that unlock it
                  // (e.g. in the 4th slot, just after the 3rd lesson).
                  const certAfterIndex =
                    Math.min(LESSONS_REQUIRED_FOR_CERTIFICATE, lessons.length) - 1;

                  const renderCertNode = () => {
                    const certIndex = globalIndex++;
                    const certOffset = getPathOffset(certIndex);
                    const prevOffset = getPathOffset(certIndex - 1);
                    const unitComplete = isUnitComplete(animal, unitNum, progress);
                    const existing = getCertificate(progress, animal, unitNum as 1 | 2 | 3);
                    const certStatus: 'locked' | 'available' | 'claimed' = !unitComplete
                      ? 'locked'
                      : existing
                      ? 'claimed'
                      : 'available';
                    return (
                      <CertificateNode
                        key={`cert-${unitNum}`}
                        unit={unitNum}
                        animal={animal}
                        status={certStatus}
                        offset={certOffset}
                        prevOffset={prevOffset}
                        unitColor={unitColor}
                        onClick={() => {
                          if (existing) {
                            setCelebrate(false);
                            setActiveCert(existing);
                          } else {
                            openCertificate(animal, unitNum as 1 | 2 | 3);
                          }
                        }}
                      />
                    );
                  };

                  return lessons.map((lesson, i) => {
                    const pathIndex = globalIndex++;
                    const offset = getPathOffset(pathIndex);
                    const status = getLessonStatus(lesson.id, progress);
                    const isNext = lesson.id === firstAvailableId;
                    const best = progress.bestScores[lesson.id];
                    return (
                      <Fragment key={lesson.id}>
                        <PathNode
                          lesson={lesson}
                          animal={animal}
                          offset={offset}
                          status={status}
                          isNext={isNext}
                          bestScore={best}
                          unitColor={unitColor}
                          onClick={() => navigate(`/lesson/${animal}/${lesson.id}`)}
                          showConnector={i > 0}
                          prevOffset={i > 0 ? getPathOffset(pathIndex - 1) : 0}
                        />
                        {i === certAfterIndex && renderCertNode()}
                      </Fragment>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="home-footer">
        <button className="home-footer-link" onClick={() => navigate('/roadmap')}>
          View Roadmap
        </button>
        <div className="home-disclaimer">
          For entertainment & education only.
        </div>
      </footer>

      <NameCaptureModal
        open={!!pendingCert}
        animal={pendingCert?.animal ?? animal}
        initialOwner={progress.ownerName}
        onSubmit={handleNameCapture}
        onCancel={() => setPendingCert(null)}
      />

      {activeCert && (
        <CertificateModal
          open={!!activeCert}
          record={activeCert}
          progress={progress}
          celebrate={celebrate}
          onClose={() => setActiveCert(null)}
          onProgressChange={(next) => {
            setProgress(next);
            const key = certificateKey(activeCert.animal, activeCert.unit);
            const updated = next.certificates?.[key];
            if (updated) setActiveCert(updated);
          }}
        />
      )}
    </div>
  );
}

/* ── Path Node ─────────────────────────────────────────── */

function PathNode({
  lesson,
  animal,
  offset,
  status,
  isNext,
  bestScore,
  unitColor,
  onClick,
  showConnector,
  prevOffset,
}: {
  lesson: Lesson;
  animal: Animal;
  offset: number;
  status: 'locked' | 'available' | 'completed';
  isNext: boolean;
  bestScore?: number;
  unitColor: string;
  onClick: () => void;
  showConnector: boolean;
  prevOffset: number;
}) {
  return (
    <div className="path-node-wrapper" style={{ '--offset': `${offset}px` } as React.CSSProperties}>
      {showConnector && (
        <PathTrail
          prevOffset={prevOffset}
          offset={offset}
          status={status}
          unitColor={unitColor}
          animal={animal}
        />
      )}

      <button
        className={`path-node ${status} ${animal} ${isNext ? 'is-next' : ''}`}
        disabled={status === 'locked'}
        onClick={onClick}
        aria-label={`${lesson.title} — ${status}`}
        style={{ '--unit-color': unitColor } as React.CSSProperties}
      >
        {/* Glow ring for active/next */}
        {isNext && <div className="path-node-glow" style={{ background: unitColor }} />}

        <div className="path-node-circle">
          {status === 'locked' ? (
            <LessonIcon icon="lock" size={20} />
          ) : status === 'completed' ? (
            <LessonIcon icon={lesson.icon} size={22} />
          ) : (
            <LessonIcon icon={lesson.icon} size={22} />
          )}

          {status === 'completed' && (
            <div className="path-node-check">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* START label for next lesson */}
        {isNext && (
          <div className="path-start-label" style={{ background: unitColor }}>
            START
          </div>
        )}

        {/* Title below */}
        <span className="path-node-title">{lesson.title}</span>

        {/* Best score */}
        {status === 'completed' && bestScore !== undefined && (
          <span className="path-node-score">{Math.round(bestScore * 100)}%</span>
        )}
      </button>
    </div>
  );
}

/* ── Certificate Node ──────────────────────────────────── */

function CertificateNode({
  unit,
  animal,
  status,
  offset,
  prevOffset,
  unitColor,
  onClick,
}: {
  unit: number;
  animal: Animal;
  status: 'locked' | 'available' | 'claimed';
  offset: number;
  prevOffset: number;
  unitColor: string;
  onClick: () => void;
}) {
  return (
    <div
      className="path-node-wrapper"
      style={{ '--offset': `${offset}px` } as React.CSSProperties}
    >
      <PathTrail
        prevOffset={prevOffset}
        offset={offset}
        status={status}
        unitColor={unitColor}
        animal={animal}
      />

      <button
        className={`path-node cert-node ${status} ${animal}`}
        disabled={status === 'locked'}
        onClick={onClick}
        aria-label={`Unit ${unit} certificate — ${status}`}
        style={{ '--unit-color': unitColor } as React.CSSProperties}
      >
        {status === 'available' && (
          <div className="path-node-glow" style={{ background: '#FFD24A' }} />
        )}

        <div className="path-node-circle cert-node-circle">
          {status === 'locked' ? (
            <LessonIcon icon="lock" size={22} />
          ) : (
            <LessonIcon icon="medal" size={26} />
          )}

          {status === 'claimed' && (
            <div className="path-node-check">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {status === 'available' && (
          <div className="path-start-label cert-claim-label">CLAIM</div>
        )}

        <span className="path-node-title">Certificate</span>

        {status === 'claimed' && (
          <span className="path-node-score cert-issued-label">Issued</span>
        )}
      </button>
    </div>
  );
}

/* ── Animal Face SVG ───────────────────────────────────── */

function AnimalFace({ animal, size = 28 }: { animal: Animal; size?: number }) {
  return (
    <span
      role="img"
      aria-label={animal === 'cat' ? 'Cat' : 'Dog'}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {animal === 'cat' ? '🐱' : '🐶'}
    </span>
  );
}
