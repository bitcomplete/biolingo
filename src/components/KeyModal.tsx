import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onSubmit: (key: string) => void;
}

export function KeyModal({ open, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="key-modal">
      <div className="key-modal-inner">
        <h2>Drop in your OpenAI key</h2>
        <p>Stored in this tab's sessionStorage only — wiped when you close it. Never written to disk.</p>
        <input
          ref={inputRef}
          type="password"
          placeholder="sk-..."
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button onClick={submit}>Let me cook</button>
      </div>
    </div>
  );
}
