import { useNavigate } from 'react-router-dom';

type PhaseStatus = 'live' | 'soon' | 'future';

interface RoadmapPhase {
  status: PhaseStatus;
  label: string;
  badge: string;
  badgeColor: string;
  description: string;
  items: { emoji: string; name: string; sound: string }[];
}

const phases: RoadmapPhase[] = [
  {
    status: 'live',
    label: 'Chapter 1',
    badge: 'Live Now',
    badgeColor: 'var(--success)',
    description: 'Master the classics. Cats and dogs are waiting for a worthy conversation partner.',
    items: [
      { emoji: '🐱', name: 'Cat', sound: 'Meow' },
      { emoji: '🐶', name: 'Dog', sound: 'Bark' },
    ],
  },
  {
    status: 'soon',
    label: 'Chapter 2',
    badge: 'Coming Soon',
    badgeColor: 'var(--warning)',
    description: 'Spread your wings. The sky and treetops are calling.',
    items: [
      { emoji: '🐦', name: 'Bird', sound: 'Chirp' },
      { emoji: '🐸', name: 'Frog', sound: 'Ribbit' },
      { emoji: '🐝', name: 'Bee', sound: 'Buzz' },
    ],
  },
  {
    status: 'future',
    label: 'Chapter 3',
    badge: 'The Dream',
    badgeColor: 'var(--cat-primary)',
    description: 'Talk to everything. Trees, rocks, rivers — all life on Earth speaks. You just need to learn the language.',
    items: [
      { emoji: '🌳', name: 'Tree', sound: 'Rustle' },
      { emoji: '🪨', name: 'Rock', sound: 'Rumble' },
      { emoji: '🦋', name: 'Butterfly', sound: 'Flutter' },
      { emoji: '🌊', name: 'Wave', sound: 'Roar' },
      { emoji: '🍄', name: 'Mushroom', sound: 'Spore' },
      { emoji: '🌺', name: 'Flower', sound: 'Bloom' },
    ],
  },
];

const statusDot: Record<PhaseStatus, string> = {
  live: 'var(--success)',
  soon: 'var(--warning)',
  future: 'var(--cat-primary)',
};

export function RoadmapPage() {
  const navigate = useNavigate();

  return (
    <div className="app" style={{ paddingBottom: 40 }}>
      <header className="header fade-up" style={{ paddingBottom: 16 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          ← Back
        </button>
        <div className="logo">Paws & Practice</div>
        <h1 className="title">Roadmap</h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          color: 'var(--text-dim)',
          marginTop: 6,
          lineHeight: 1.5,
        }}>
          Our journey to universal animal fluency
        </p>
      </header>

      <div style={{ padding: '8px 24px 0', position: 'relative' }}>
        {/* Vertical connecting line */}
        <div style={{
          position: 'absolute',
          left: 43,
          top: 28,
          bottom: 20,
          width: 2,
          background: 'linear-gradient(to bottom, var(--success), var(--warning), var(--cat-primary), transparent)',
          opacity: 0.3,
          borderRadius: 2,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {phases.map((phase, i) => (
            <PhaseBlock key={i} phase={phase} index={i} />
          ))}
        </div>

        {/* All biodiversity card */}
        <div style={{
          marginTop: 28,
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          border: '2px dashed var(--surface-2)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 100%, #ff6b9d08 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: 36, marginBottom: 10, lineHeight: 1 }}>🌍</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: 'var(--cat-primary)',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 8,
          }}>
            The End Goal
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
            background: 'linear-gradient(135deg, var(--cat-primary), var(--dog-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            All biodiversity on Earth
          </div>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: 'var(--text-dim)',
            lineHeight: 1.6,
            maxWidth: 280,
            margin: '0 auto',
          }}>
            8.7 million species. One app.
            Every bark, chirp, rustle, and roar — eventually, you'll speak them all.
          </p>
          <div style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}>
            {['🐘','🦭','🦜','🐙','🦎','🌿','🪸','🦠','🌲','🦚','🐳','🦕'].map((e, i) => (
              <span key={i} style={{
                fontSize: 18,
                opacity: 0.4 + (i % 3) * 0.15,
                display: 'inline-block',
                animation: `float ${2.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhaseBlock({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const isLive = phase.status === 'live';

  return (
    <div style={{ display: 'flex', gap: 16, animationDelay: `${index * 0.1}s` }} className="fade-up">
      {/* Timeline dot */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 4,
      }}>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: statusDot[phase.status],
          boxShadow: isLive ? `0 0 12px ${statusDot[phase.status]}` : 'none',
          border: `2px solid ${isLive ? statusDot[phase.status] : 'var(--surface-2)'}`,
          flexShrink: 0,
          ...(isLive ? { animation: 'pulse-green 2s ease infinite' } : {}),
        }} />
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: '18px 18px 16px',
        border: isLive ? `2px solid ${statusDot[phase.status]}33` : '2px solid transparent',
        boxShadow: isLive ? `0 4px 24px ${statusDot[phase.status]}18` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {isLive && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 100%, #69db7c06 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}>
            {phase.label}
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            color: phase.badgeColor,
            background: `${phase.badgeColor}18`,
            border: `1px solid ${phase.badgeColor}44`,
            borderRadius: 999,
            padding: '2px 8px',
            letterSpacing: 0.5,
          }}>
            {phase.badge}
          </span>
        </div>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: 'var(--text-dim)',
          lineHeight: 1.6,
          marginBottom: 14,
        }}>
          {phase.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {phase.items.map((item, j) => (
            <div key={j} style={{
              background: 'var(--bg)',
              borderRadius: 12,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: phase.status === 'future' ? 0.6 : 1,
              border: '1.5px solid var(--surface-2)',
            }}>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{item.name}</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  marginTop: 1,
                }}>
                  {item.sound}
                </div>
              </div>
              {phase.status !== 'live' && (
                <span style={{ fontSize: 10, marginLeft: 2, opacity: 0.5 }}>🔒</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
