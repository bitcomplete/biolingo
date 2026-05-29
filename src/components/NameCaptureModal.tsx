import { useEffect, useRef, useState } from 'react';
import type { Animal } from '../types';

interface Props {
  open: boolean;
  animal: Animal;
  initialOwner?: string;
  onSubmit: (values: { ownerName: string }) => void;
  onCancel: () => void;
}

export function NameCaptureModal({
  open,
  initialOwner,
  onSubmit,
  onCancel,
}: Props) {
  const [owner, setOwner] = useState(initialOwner ?? '');
  const ownerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setOwner(initialOwner ?? '');
      setTimeout(() => ownerRef.current?.focus(), 50);
    }
  }, [open, initialOwner]);

  if (!open) return null;

  const submit = () => {
    const ownerTrim = owner.trim();
    if (!ownerTrim) return;
    onSubmit({ ownerName: ownerTrim });
  };

  return (
    <div className="key-modal">
      <div className="key-modal-inner name-capture-modal">
        <h2>Congratulations! You've earned your first certificate.</h2>
        <p>
          Add your name and we'll print it on the diploma, then generate your
          one-of-a-kind portrait.
        </p>
        <label className="name-capture-label">Your name</label>
        <input
          ref={ownerRef}
          type="text"
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <div className="name-capture-actions">
          <button className="name-capture-secondary" onClick={onCancel} type="button">
            Not now
          </button>
          <button onClick={submit} type="button" disabled={!owner.trim()}>
            Issue certificate
          </button>
        </div>
      </div>
    </div>
  );
}
