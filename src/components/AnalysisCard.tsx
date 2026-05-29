import type { AnalysisResult, CatAnalysis, DogAnalysis } from '../analysis/types';

interface Props {
  result: AnalysisResult | null;
  visible: boolean;
}

function BreedBars({ breeds }: { breeds: DogAnalysis['breeds'] }) {
  const topBreeds = breeds.slice(0, 3);
  if (topBreeds.length === 0) return null;

  return (
    <div className="analysis-breeds">
      {topBreeds.map((b) => (
        <div key={b.breed} className="analysis-breed-row">
          <span className="analysis-breed-label">{b.label}</span>
          <div className="analysis-bar">
            <div
              className="analysis-bar-fill dog-fill"
              style={{ width: `${b.pct}%` }}
            />
          </div>
          <span className="analysis-breed-pct">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function CatBody({ result }: { result: CatAnalysis }) {
  return (
    <div className="analysis-body">
      <div className="analysis-row">
        <span className="analysis-row-label">Mood</span>
        <span className="analysis-row-value">
          {result.contextLabel}
          <span className="analysis-confidence">{result.confidence}% match</span>
        </span>
      </div>
      <div className="analysis-row">
        <span className="analysis-row-label">Inner breed</span>
        <span className="analysis-row-value analysis-mono">
          {result.breed === 'maine_coon' ? 'Maine Coon' : 'European Shorthair'}
        </span>
      </div>
      {result.sex && (
        <div className="analysis-row">
          <span className="analysis-row-label">Energy</span>
          <span className="analysis-row-value analysis-mono">
            {result.sex === 'male' ? '♂ Tom energy' : '♀ Queen energy'}
          </span>
        </div>
      )}
    </div>
  );
}

export function AnalysisCard({ result, visible }: Props) {
  if (!result || !visible) return null;

  const isCat = result.animal === 'cat';
  return (
    <div className={`analysis-card fade-up ${isCat ? 'cat-accent' : 'dog-accent'}`}>
      <div className="analysis-header">
        <span className="analysis-icon">{isCat ? '🐱' : '🐶'}</span>
        <span className="analysis-title">
          {isCat ? 'Your Catsonality' : 'Your Dogsonality'}
        </span>
      </div>

      {isCat && result.animal === 'cat' && (
        <CatBody result={result} />
      )}

      {!isCat && result.animal === 'dog' && (
        <div className="analysis-body">
          <div className="analysis-row">
            <span className="analysis-row-label">Authenticity</span>
            <span className={`analysis-row-value ${result.isAuthentic ? 'authentic' : 'not-authentic'}`}>
              {result.isAuthentic ? `${result.confidence}% real bark` : `${result.confidence}% — not a real bark`}
            </span>
          </div>
          {result.isAuthentic && result.sex && (
            <div className="analysis-row">
              <span className="analysis-row-label">Energy</span>
              <span className="analysis-row-value analysis-mono">
                {result.sex === 'male' ? '♂ Good boy energy' : '♀ Good girl energy'}
              </span>
            </div>
          )}
          {result.isAuthentic && <BreedBars breeds={result.breeds} />}
        </div>
      )}

    </div>
  );
}
