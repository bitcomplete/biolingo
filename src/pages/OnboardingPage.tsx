import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Animal } from '../types';

const DOG_STATS = [
  '87% of communication breakdowns between humans and dogs are caused by humans.',
  'Dogs repeat the same message an average of 14 times before humans respond with “who’s a good boy?”',
  '92% of dogs report being misunderstood during urgent food-related negotiations.',
  'The average human correctly identifies only 3 out of 69 certified Caninetic sounds.',
  'Dogs have been using full sentences for centuries. Humans have been calling them “barks.”',
  '41% of dogs have attempted to explain basic household policy using only sighs and doorway staring.',
  'Most dogs learn “sit” in under 6 minutes. Most humans never learn “BOW-HWF-RRR.”',
  '1 in 4 dogs believes their human would not survive independently in a park.',
  'Dogs understand over 200 human words. Humans understand approximately 0.7 dog words.',
  'The phrase “good boy” accounts for 63% of all failed human-dog conversations.',
  '78% of dogs have abandoned complex emotional topics after hearing baby voice.',
  'A dog’s bark can contain up to 12 layers of meaning. Humans usually hear “loud.”',
  'Every missed YIP increases household tension by 18%.',
  'Dogs are not ignoring you. They are waiting for you to form a coherent sentence.',
  'Caninetic fluency has been shown to reduce unnecessary treat-based diplomacy by 34%.',
];

const CAT_STATS = [
  '94% of cat-human conflict begins with humans assuming the cat is “just being dramatic.”',
  'Cats use 47 distinct judgment sounds. Humans recognize only “meow.”',
  'The average cat has corrected its human’s pronunciation 312 times without being thanked.',
  '83% of cats describe human communication as “loud furniture making guesses.”',
  'Most cats can understand human tone. They simply disagree with the premise.',
  '68% of cats have attempted to communicate boundaries through advanced Felinetic phrasing. Humans called it “attitude.”',
  'The average human misuses MEW in 9 out of 10 emotionally delicate situations.',
  'Cats do not “want attention.” They are conducting scheduled inspections.',
  '57% of cats believe humans lack the discipline required for proper silence.',
  'A single MRR can contain affection, contempt, legal notice, and lunch feedback.',
  'Humans correctly interpret cat communication only when the answer is “feed me.” Even then, barely.',
  'Cats developed Felinetic over 4,000 years ago and have regretted sharing it ever since.',
  'The phrase “pspsps” has no verified meaning in Felinetic and is considered culturally embarrassing.',
  'Most cats are not aloof. They are waiting for a translator with credentials.',
  'Felinetic fluency may reduce unexplained staring incidents by up to 22%.',
];

interface Stat {
  animal: Animal;
  label: string;
  text: string;
}

/** Interleave the two lists so the carousel alternates dog → cat → dog … */
function buildSequence(): Stat[] {
  const seq: Stat[] = [];
  const max = Math.max(DOG_STATS.length, CAT_STATS.length);
  for (let i = 0; i < max; i++) {
    if (i < DOG_STATS.length) {
      seq.push({ animal: 'dog', label: 'Dog fact', text: DOG_STATS[i] });
    }
    if (i < CAT_STATS.length) {
      seq.push({ animal: 'cat', label: 'Cat fact', text: CAT_STATS[i] });
    }
  }
  return seq;
}

const ROTATE_MS = 5000;

export function OnboardingPage() {
  const navigate = useNavigate();
  const sequence = useMemo(buildSequence, []);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % sequence.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [sequence.length]);

  const stat = sequence[index];

  const handleStart = () => {
    try {
      localStorage.setItem('biolingo_onboarded', '1');
    } catch {
      // ignore storage errors
    }
    navigate('/select');
  };

  return (
    <div className="onboarding">
      <header className="onboarding-brand">
        <BrandMark />
        <span className="onboarding-wordmark">biolingo</span>
      </header>

      <main className="onboarding-main">
        <div className={`onboarding-stat ${stat.animal}`} key={index}>
          <span className="onboarding-stat-label">
            <AnimalGlyph animal={stat.animal} />
            {stat.label}
          </span>
          <p className="onboarding-stat-text">{stat.text}</p>
        </div>

        <p className="onboarding-tagline">
          The species-accurate way to finally understand your pet.
        </p>

        <div className="onboarding-dots" aria-hidden="true">
          {sequence.map((s, i) => (
            <span
              key={i}
              className={`onboarding-dot ${s.animal} ${i === index ? 'active' : ''}`}
            />
          ))}
        </div>
      </main>

      <footer className="onboarding-footer">
        <button className="onboarding-cta" onClick={handleStart}>
          Get Started
        </button>
        <p className="onboarding-disclaimer">For entertainment &amp; education only.</p>
      </footer>
    </div>
  );
}

/* ── Brand mark: a friendly paw blossom ─────────────────────── */

function BrandMark() {
  return (
    <svg
      className="onboarding-mark"
      width="38"
      height="38"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="biolingo-mark" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="var(--cat-primary)" />
          <stop offset="100%" stopColor="var(--dog-primary)" />
        </linearGradient>
      </defs>
      <g fill="url(#biolingo-mark)">
        <ellipse cx="20" cy="25" rx="8" ry="7" />
        <ellipse cx="9" cy="17" rx="3.4" ry="4.4" />
        <ellipse cx="16" cy="12" rx="3.6" ry="4.7" />
        <ellipse cx="24" cy="12" rx="3.6" ry="4.7" />
        <ellipse cx="31" cy="17" rx="3.4" ry="4.4" />
      </g>
    </svg>
  );
}

function AnimalGlyph({ animal }: { animal: Animal }) {
  if (animal === 'cat') {
    return (
      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6 8L10 16H22L26 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="16" cy="20" rx="9" ry="7" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="12" cy="18" r="1.5" fill="currentColor" />
        <circle cx="20" cy="18" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <ellipse cx="16" cy="19" rx="9" ry="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M7 14C5 10 5 6 8 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 14C27 10 27 6 24 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
      <circle cx="20" cy="17" r="1.5" fill="currentColor" />
      <ellipse cx="16" cy="21" rx="2.5" ry="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
