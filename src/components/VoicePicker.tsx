import { VOICE_OPTIONS, type Voice } from '../types';

interface Props {
  value: Voice;
  disabled: boolean;
  onChange: (voice: Voice) => void;
}

export function VoicePicker({ value, disabled, onChange }: Props) {
  const current = VOICE_OPTIONS.find((v) => v.id === value);
  return (
    <div className="voice-picker">
      <label className="voice-picker-label" htmlFor="voice-select">Judge's voice</label>
      <select
        id="voice-select"
        className="voice-picker-select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Voice)}
      >
        {VOICE_OPTIONS.map((v) => (
          <option key={v.id} value={v.id}>{v.label}</option>
        ))}
      </select>
      {current && <span className="voice-picker-hint">{current.hint}</span>}
    </div>
  );
}
