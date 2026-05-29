import { useNavigate } from 'react-router-dom';
import { Cat, Dog } from 'lucide-react';
import type { Animal } from '../types';

interface LanguageOption {
  animal: Animal;
  name: string;
  speakers: string;
  Icon: typeof Cat;
}

const OPTIONS: LanguageOption[] = [
  { animal: 'cat', name: 'Feline Linguistics', speakers: '600M speakers', Icon: Cat },
  { animal: 'dog', name: 'Canine Linguistics', speakers: '900M speakers', Icon: Dog },
];

export function LanguageSelectPage() {
  const navigate = useNavigate();

  const handleSelect = (animal: Animal) => {
    try {
      localStorage.setItem('biolingo_language', animal);
    } catch {
      // ignore storage errors
    }
    navigate('/');
  };

  return (
    <div className="lang-select">
      <header className="lang-select-brand">
        <span className="lang-select-wordmark">biolingo</span>
      </header>

      <main className="lang-select-main">
        <h1 className="lang-select-title">I want to learn...</h1>

        <div className="lang-select-grid">
          {OPTIONS.map(({ animal, name, speakers, Icon }, i) => (
            <button
              key={animal}
              className={`lang-card ${animal} fade-up`}
              style={{ animationDelay: `${0.08 + i * 0.08}s` }}
              onClick={() => handleSelect(animal)}
            >
              <span className="lang-card-icon">
                <Icon size={40} strokeWidth={2} />
              </span>
              <span className="lang-card-name">{name}</span>
              <span className="lang-card-speakers">{speakers}</span>
            </button>
          ))}
        </div>
      </main>

      <footer className="lang-select-footer">
        <p className="lang-select-disclaimer">For entertainment &amp; education only.</p>
      </footer>
    </div>
  );
}
