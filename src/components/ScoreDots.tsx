interface Props {
  filled: number;
  total?: number;
}

export function ScoreDots({ filled, total = 5 }: Props) {
  return (
    <div className="score-row">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`score-dot ${i < filled ? 'filled' : ''}`} />
      ))}
    </div>
  );
}
