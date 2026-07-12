import { useMemo, useState } from 'react';
import type { DeckPhrase, LanguageGroup } from '../phrases';
import type { Mode } from '../audio/usePlayer';
import { Check, Play, Sun, Moon } from '../components/icons';

const MODE_KEY = 'phrasebook-mode';
const ALL_MODES: { mode: Mode; label: string; hint: string }[] = [
  { mode: 'normal', label: 'Normal', hint: 'Hear it once' },
  { mode: 'slow', label: 'Slow', hint: 'Slow playback' },
  { mode: 'drill', label: 'Drill', hint: 'Normal → slow → normal' },
  { mode: 'recall', label: 'Recall', hint: 'Translate then reveal' },
];

interface HomeProps {
  groups: LanguageGroup[];
  theme: string;
  onToggleTheme: () => void;
  onStart: (deck: DeckPhrase[], mode: Mode) => void;
}

export function Home({ groups, theme, onToggleTheme, onStart }: HomeProps) {
  const [filterLangs, setFilterLangs] = useState<Set<string>>(new Set());
  const [filterTags, setFilterTags] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    return (ALL_MODES.some((m) => m.mode === saved) ? saved : 'drill') as Mode;
  });
  const [sel, setSel] = useState<Set<string>>(() => new Set());

  const allTags = useMemo(() => {
    const s = new Set<string>();
    groups.forEach((g) => g.phrases.forEach((p) => p.tags.forEach((t) => s.add(t))));
    return [...s].sort();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    return groups
      .filter((g) => filterLangs.size === 0 || filterLangs.has(g.languageName))
      .map((g) => ({
        ...g,
        phrases:
          filterTags.size === 0
            ? g.phrases
            : g.phrases.filter((p) => p.tags.some((t) => filterTags.has(t))),
      }))
      .filter((g) => g.phrases.length > 0);
  }, [groups, filterLangs, filterTags]);

  const toggleLangFilter = (lang: string) =>
    setFilterLangs((prev) => {
      const n = new Set(prev);
      n.has(lang) ? n.delete(lang) : n.add(lang);
      return n;
    });

  const toggleTagFilter = (tag: string) =>
    setFilterTags((prev) => {
      const n = new Set(prev);
      n.has(tag) ? n.delete(tag) : n.add(tag);
      return n;
    });

  const toggle = (id: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleGroup = (phrases: DeckPhrase[]) =>
    setSel((prev) => {
      const n = new Set(prev);
      const allOn = phrases.every((p) => n.has(p.id));
      phrases.forEach((p) => (allOn ? n.delete(p.id) : n.add(p.id)));
      return n;
    });

  const count = sel.size;
  const langsUsed = useMemo(
    () => groups.filter((g) => g.phrases.some((p) => sel.has(p.id))).length,
    [groups, sel],
  );

  const buildDeck = (): DeckPhrase[] => {
    const seen = new Set<string>();
    const out: DeckPhrase[] = [];
    groups.forEach((g) =>
      g.phrases.forEach((p) => {
        if (sel.has(p.id) && !seen.has(p.id)) {
          seen.add(p.id);
          out.push(p);
        }
      }),
    );
    return out;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--ui)' }}>
      {/* header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 22px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px', whiteSpace: 'nowrap' }}>Build a session</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap' }}>Mix &amp; match across languages</div>
        </div>
        <button onClick={onToggleTheme} title="Light / dark" style={iconBtn}>
          {theme === 'theme-dark' ? <Sun size={19} /> : <Moon size={18} />}
        </button>
      </div>

      {/* language filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 22px 6px' }}>
        {groups.map((g) => (
          <button key={g.languageName} onClick={() => toggleLangFilter(g.languageName)} style={chip(filterLangs.has(g.languageName))}>
            <span style={{ fontFamily: g.font }}>{g.languageName}</span>
          </button>
        ))}
      </div>

      {/* tag filter chips — hidden if no phrases have tags */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 22px 6px', marginTop: 6 }}>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => toggleTagFilter(tag)} style={chip(filterTags.has(tag))}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* status + clear */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 22px 6px' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>
          {count} selected · {langsUsed} {langsUsed === 1 ? 'language' : 'languages'}
        </span>
        <button onClick={() => setSel(new Set())} style={textBtn('var(--muted)')}>Clear</button>
      </div>

      {/* phrase list */}
      <div className="no-scrollbar" style={{ flex: 1, overflow: 'auto' }}>
        {filteredGroups.length === 0 ? (
          <div style={{ padding: '40px 22px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
            No phrases match these filters
          </div>
        ) : (
          filteredGroups.map((g) => {
            const allOn = g.phrases.every((p) => sel.has(p.id));
            return (
              <div key={g.languageName}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, minWidth: 0 }}>
                    <span style={{ fontFamily: g.font, fontSize: 16, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>{g.languageName}</span>
                  </div>
                  <button onClick={() => toggleGroup(g.phrases)} style={textBtn('var(--amber)')}>
                    {allOn ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                {g.phrases.map((p) => {
                  const on = sel.has(p.id);
                  return (
                    <button key={p.id} onClick={() => toggle(p.id)} style={rowBtn}>
                      <span style={{ ...checkbox, background: on ? 'var(--green)' : 'transparent', border: on ? 'none' : '2px solid var(--line)' }}>
                        {on && <Check size={14} />}
                      </span>
                      <span style={{ minWidth: 0, opacity: on ? 1 : 0.62 }}>
                        <span style={{ display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.en}</span>
                        <span style={{ display: 'block', fontFamily: p.font, fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.native}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
        <div style={{ height: 8 }} />
      </div>

      {/* mode picker + start */}
      <div style={{ padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {ALL_MODES.map(({ mode: m, label, hint }) => (
            <button
              key={m}
              onClick={() => { setMode(m); localStorage.setItem(MODE_KEY, m); }}
              title={hint}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'capitalize',
                background: mode === m ? 'var(--fg)' : 'var(--surface)',
                color: mode === m ? 'var(--bg)' : 'var(--muted)',
                border: mode === m ? 'none' : '1px solid var(--line)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => count > 0 && onStart(buildDeck(), mode)}
          disabled={count === 0}
          style={{
            width: '100%', height: 72, borderRadius: 20, border: 'none', cursor: count ? 'pointer' : 'default', fontFamily: 'inherit',
            background: count ? 'var(--green)' : 'var(--surface)', color: count ? 'var(--bg)' : 'var(--muted2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, opacity: count ? 1 : 0.7,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Play size={22} />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>START DRIVING</span>
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.8, whiteSpace: 'nowrap' }}>
            {count} {count === 1 ? 'phrase' : 'phrases'} · {langsUsed} {langsUsed === 1 ? 'language' : 'languages'}
          </span>
        </button>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 40, height: 40, flex: '0 0 auto', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--surface)',
  color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const textBtn = (color: string): React.CSSProperties => ({
  border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color, flexShrink: 0,
});

const rowBtn: React.CSSProperties = {
  width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 14, padding: '7px 22px', fontFamily: 'inherit',
};

const checkbox: React.CSSProperties = {
  width: 25, height: 25, flex: '0 0 auto', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)',
};

const chip = (active: boolean): React.CSSProperties => ({
  flexShrink: 0, border: active ? 'none' : '1px solid var(--line)',
  borderRadius: 20, padding: '5px 13px', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 13, fontWeight: 700,
  background: active ? 'var(--green)' : 'var(--surface)',
  color: active ? 'var(--bg)' : 'var(--fg)',
});
