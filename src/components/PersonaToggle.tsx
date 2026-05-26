import type { PersonaMode } from '../types';

interface Props {
  value: PersonaMode;
  disabled: boolean;
  onChange: (next: PersonaMode) => void;
}

export function PersonaToggle({ value, disabled, onChange }: Props) {
  const isCorporate = value === 'corporate';
  return (
    <div className="persona-toggle">
      <span className="persona-toggle-label">Corporate Mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={isCorporate}
        disabled={disabled}
        className={`persona-toggle-switch ${isCorporate ? 'on' : ''}`}
        onClick={() => onChange(isCorporate ? 'ramsay' : 'corporate')}
      >
        <span className="persona-toggle-thumb" />
      </button>
      <span className="persona-toggle-hint">
        {isCorporate ? 'performance review mode' : 'theatrical Ramsay mode'}
      </span>
    </div>
  );
}
