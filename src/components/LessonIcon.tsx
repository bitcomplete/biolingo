interface LessonIconProps {
  icon: string;
  size?: number;
  className?: string;
}

const EMOJI: Record<string, string> = {
  wave: '👋',
  bowl: '🍽️',
  chat: '💬',
  target: '🎯',
  megaphone: '📢',
  heart: '❤️',
  shield: '🛡️',
  help: '❓',
  siren: '🚨',
  flag: '🚩',
  handshake: '🤝',
  search: '🔍',
  crown: '👑',
  check: '✅',
  moon: '🌙',
  bolt: '⚡',
  alert: '⚠️',
  door: '🚪',
  ball: '🎾',
  cloud: '☁️',
  bandaid: '🩹',
  scroll: '📜',
  footprints: '🐾',
  howl: '🐺',
  lock: '🔒',
  star: '⭐',
  medal: '🏅',
  award: '🏆',
};

export function LessonIcon({ icon, size = 24, className }: LessonIconProps) {
  const emoji = EMOJI[icon] ?? '🐾';
  return (
    <span
      role="img"
      aria-hidden="true"
      className={className}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {emoji}
    </span>
  );
}
