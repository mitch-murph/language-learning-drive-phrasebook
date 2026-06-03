import { useCallback, useEffect, useMemo, useState } from 'react';
import { listPhrases, type Phrase } from './api/client';
import { groupByLanguage, type DeckPhrase } from './phrases';
import { Home } from './screens/Home';
import { Player } from './screens/Player';
import { SessionComplete } from './screens/SessionComplete';

type View = 'home' | 'drive' | 'complete';
type Theme = 'theme-dark' | 'theme-cozy';

const THEME_KEY = 'phrasebook-theme';

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'theme-cozy' || saved === 'theme-dark' ? saved : 'theme-dark';
  });
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'theme-dark' ? 'theme-cozy' : 'theme-dark')), []);
  return [theme, toggle];
}

export function App() {
  const [theme, toggleTheme] = useTheme();

  const [phrases, setPhrases] = useState<Phrase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<View>('home');
  const [deck, setDeck] = useState<DeckPhrase[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionStart, setSessionStart] = useState(0);
  const [summary, setSummary] = useState({ learned: 0, driveMs: 0 });

  const load = useCallback(() => {
    setError(null);
    setPhrases(null);
    listPhrases()
      .then(setPhrases)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => (phrases ? groupByLanguage(phrases) : []), [phrases]);

  const startSession = (d: DeckPhrase[]) => {
    setDeck(d);
    setSessionStart(Date.now());
    setSessionKey((k) => k + 1);
    setView('drive');
  };

  const leavePlayer = (learnedCount: number) => {
    setSummary({ learned: learnedCount, driveMs: Date.now() - sessionStart });
    setView('complete');
  };

  return (
    <div className={`app-root ${theme}`}>
      <div className="app-frame">
        {view === 'home' && (
          <>
            {error && <Status message={`Couldn't load phrases — ${error}`} onRetry={load} />}
            {!error && !phrases && <Status message="Loading phrases…" spinner />}
            {!error && phrases && phrases.length === 0 && (
              <Status message="No phrases yet. Add some in the phrasebook app, then come back." />
            )}
            {!error && phrases && phrases.length > 0 && (
              <Home groups={groups} theme={theme} onToggleTheme={toggleTheme} onStart={startSession} />
            )}
          </>
        )}

        {view === 'drive' && (
          <Player key={sessionKey} deck={deck} theme={theme} onToggleTheme={toggleTheme} onBack={leavePlayer} />
        )}

        {view === 'complete' && (
          <SessionComplete
            total={deck.length}
            learnedCount={summary.learned}
            driveMs={summary.driveMs}
            onHome={() => setView('home')}
            onAgain={() => startSession(deck)}
          />
        )}
      </div>
    </div>
  );
}

function Status({ message, onRetry, spinner }: { message: string; onRetry?: () => void; spinner?: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 40px', textAlign: 'center' }}>
      {spinner && (
        <div
          style={{ width: 28, height: 28, borderRadius: 28, border: '3px solid var(--line)', borderTopColor: 'var(--green)', animation: 'spin 0.8s linear infinite' }}
        />
      )}
      <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted)', lineHeight: 1.5 }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ height: 48, padding: '0 26px', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'var(--green)', color: 'var(--bg)', fontSize: 15, fontWeight: 700 }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
