import type { Animal } from '../types';

interface Props {
  animal: Animal;
  disabled: boolean;
  onChange: (animal: Animal) => void;
}

export function AnimalSelector({ animal, disabled, onChange }: Props) {
  return (
    <div className="selector fade-up" style={{ animationDelay: '.1s' }}>
      <button
        className={`animal-btn cat ${animal === 'cat' ? 'active' : ''}`}
        disabled={disabled}
        onClick={() => onChange('cat')}
      >
        <span className="animal-emoji">🐱</span>
        <span className="animal-label">Meow Coach</span>
        <span className="animal-sub">meee → owh</span>
      </button>
      <button
        className={`animal-btn dog ${animal === 'dog' ? 'active' : ''}`}
        disabled={disabled}
        onClick={() => onChange('dog')}
      >
        <span className="animal-emoji">🐶</span>
        <span className="animal-label">Bark Practice</span>
        <span className="animal-sub">short & sharp</span>
      </button>
    </div>
  );
}
