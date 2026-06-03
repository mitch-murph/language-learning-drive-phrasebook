// Static screen designs for the in-car phrasebook: home / start, deck picker,
// phrase selector. Not interactive — these are layout mockups.

const DECKS = [
  { name: 'Travel Basics',        n: 12, learned: 5,  hue: 'var(--amber)' },
  { name: 'At a Restaurant',      n: 18, learned: 2,  hue: 'var(--green)' },
  { name: 'Directions & Transit', n: 16, learned: 0,  hue: 'var(--amber)' },
  { name: 'Shopping & Numbers',   n: 20, learned: 8,  hue: 'var(--green)' },
  { name: 'Small Talk',           n: 14, learned: 14, hue: 'var(--amber)' },
];

const SEL = [
  { en: 'Excuse me, where is the station?', jp: 'すみません、駅はどこですか？', on: true },
  { en: "I'll take this, please.",          jp: 'これをください。',           on: true },
  { en: 'Could I get some water?',          jp: '水をもらえますか？',         on: true },
  { en: 'How much is it?',                  jp: 'いくらですか？',             on: false },
  { en: 'Thank you very much.',             jp: 'ありがとうございます。',     on: true },
  { en: 'One more time, please.',           jp: 'もう一度お願いします。',     on: false },
  { en: 'Is there a good restaurant near here?', jp: 'この近くにおすすめのレストランはありますか？', on: true },
];

const G = {
  back: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>,
  gear: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 00.4 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2v.2a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.9.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1.1 1.7 1.7 0 00-.4-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.4H13a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.4l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.4 1.9V11a1.7 1.7 0 001.6 1h.2a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z"/></svg>,
  play: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>,
  check: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
};

const screen = (theme) => ({ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
  background: 'var(--bg)', fontFamily: 'var(--ui)', borderRadius: 38, overflow: 'hidden', position: 'relative' });

function Bar({ value, total, color = 'var(--amber)' }) {
  return (
    <div style={{ height: 6, borderRadius: 6, background: 'color-mix(in oklch, var(--fg) 9%, transparent)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.round((value / total) * 100)}%`, height: '100%', background: color, borderRadius: 6 }} />
    </div>
  );
}

function Primary({ label, sub }) {
  return (
    <div style={{ height: 72, borderRadius: 20, background: 'var(--green)', color: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {G.play(22)}
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      {sub && <span style={{ fontSize: 12.5, fontWeight: 600, opacity: .78, whiteSpace: 'nowrap' }}>{sub}</span>}
    </div>
  );
}

// ── HOME / START ────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div style={screen()}>
      <div style={{ flex: 1, overflow: 'hidden', padding: '26px 22px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.2px', color: 'var(--fg)' }}>ことば<span style={{ color: 'var(--muted)', fontWeight: 700 }}> · phrasebook</span></span>
          <span style={{ color: 'var(--muted)' }}>{G.gear}</span>
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.3px', color: 'var(--muted)' }}>Good morning</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px', marginTop: 4 }}>Ready to drive?</div>
        </div>

        {/* continue card */}
        <div style={{ marginTop: 22, padding: '20px 20px 22px', borderRadius: 24, background: 'var(--surface)', border: '2px solid var(--amber)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '1.5px', color: 'var(--amber)' }}>CONTINUE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)', marginTop: 6 }}>Travel Basics</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 8px', fontSize: 13.5, fontWeight: 600, color: 'var(--muted)' }}>
            <span>5 of 12 learned</span><span>Drill mode</span>
          </div>
          <Bar value={5} total={12} />
          <div style={{ marginTop: 18 }}><Primary label="START DRIVING" sub="Resume where you left off" /></div>
        </div>

        {/* decks */}
        <div style={{ marginTop: 24, marginBottom: 10, fontSize: 11.5, fontWeight: 800, letterSpacing: '1.5px', color: 'var(--muted)' }}>YOUR DECKS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DECKS.slice(1, 4).map((d) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>{d.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginTop: 4 }}>{d.learned} / {d.n} learned</div>
              </div>
              <div style={{ width: 64 }}><Bar value={d.learned || 0.001} total={d.n} color={d.hue} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DECK PICKER ─────────────────────────────────────────────────
function DeckPicker() {
  const selected = 'Travel Basics';
  return (
    <div style={screen()}>
      <div style={{ padding: '26px 22px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--fg)' }}>{G.back}</span>
        <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.3px', whiteSpace: 'nowrap' }}>Choose a deck</span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DECKS.map((d) => {
          const on = d.name === selected;
          return (
            <div key={d.name} style={{ flex: '0 0 auto', padding: '16px 18px', borderRadius: 18, background: 'var(--surface)',
              border: on ? '2px solid var(--amber)' : '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>{d.name}</span>
                {on
                  ? <span style={{ width: 26, height: 26, borderRadius: 26, background: 'var(--amber)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{G.check(15)}</span>
                  : <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)' }}>{d.n}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0 7px', fontSize: 12.5, fontWeight: 600, color: 'var(--muted)' }}>
                <span>{d.learned} / {d.n} learned</span>
                {d.learned === d.n && <span style={{ color: 'var(--green)', fontWeight: 700 }}>Complete</span>}
              </div>
              <Bar value={d.learned || 0.001} total={d.n} color={d.hue} />
            </div>
          );
        })}
      </div>

      <div style={{ padding: '14px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {['Normal', 'Slow', 'Drill'].map((m) => (
            <div key={m} style={{ flex: 1, padding: '9px 0', borderRadius: 11, textAlign: 'center', fontSize: 12.5, fontWeight: 700,
              background: m === 'Drill' ? 'var(--fg)' : 'var(--surface)', color: m === 'Drill' ? 'var(--bg)' : 'var(--muted)',
              border: m === 'Drill' ? 'none' : '1px solid var(--line)' }}>{m}</div>
          ))}
        </div>
        <Primary label="START DRIVING" sub="Travel Basics · 12 phrases" />
      </div>
    </div>
  );
}

// ── PHRASE SELECTOR ─────────────────────────────────────────────
function PhraseSelect() {
  const count = SEL.filter((s) => s.on).length;
  return (
    <div style={screen()}>
      <div style={{ padding: '26px 22px 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--fg)' }}>{G.back}</span>
        <div>
          <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.3px' }}>Travel Basics</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginTop: 1 }}>Choose what to practice</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 8px' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--muted)' }}>{count} of {SEL.length} selected</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--amber)' }}>Select all</span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 14px', display: 'flex', flexDirection: 'column' }}>
        {SEL.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 10px', borderBottom: i < SEL.length - 1 ? '1px solid color-mix(in oklch, var(--line) 60%, transparent)' : 'none' }}>
            <span style={{ width: 26, height: 26, flex: '0 0 auto', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: s.on ? 'var(--green)' : 'transparent', border: s.on ? 'none' : '2px solid var(--line)', color: 'var(--bg)' }}>
              {s.on && G.check(15)}
            </span>
            <div style={{ minWidth: 0, opacity: s.on ? 1 : 0.55 }}>
              <div style={{ fontSize: 16.5, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.en}</div>
              <div style={{ fontFamily: 'var(--jp)', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.jp}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)', borderTop: '1px solid var(--line)' }}>
        <Primary label="START DRIVING" sub={`${count} phrases selected`} />
      </div>
    </div>
  );
}

// ── LANGUAGE LIBRARY (cross-language phrase picker) ─────────────
const LANGS = [
  { lang: 'Japanese', native: '日本語', font: 'var(--jp)', items: [
    { en: 'Where is the station?',     na: '駅はどこですか？',   on: true },
    { en: "I'll take this, please.",   na: 'これをください。',   on: false },
    { en: 'Could I get some water?',   na: '水をもらえますか？', on: true },
  ] },
  { lang: 'Korean', native: '한국어', font: 'var(--kr)', items: [
    { en: 'Where is the bathroom?',    na: '화장실이 어디예요?', on: true },
    { en: 'How much is it?',           na: '얼마예요?',          on: false },
    { en: 'Thank you very much.',      na: '감사합니다.',        on: false },
  ] },
  { lang: 'Spanish', native: 'Español', font: 'var(--ui)', items: [
    { en: 'The check, please.',        na: 'La cuenta, por favor.',      on: true },
    { en: 'One coffee, please.',       na: 'Un café, por favor.',        on: true },
    { en: 'Where is the station?',     na: '¿Dónde está la estación?',   on: false },
  ] },
];

function LanguageLibrary() {
  const all = LANGS.flatMap((l) => l.items);
  const sel = all.filter((i) => i.on).length;
  const langsUsed = LANGS.filter((l) => l.items.some((i) => i.on)).length;
  return (
    <div style={screen()}>
      {/* header */}
      <div style={{ padding: '26px 22px 12px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px' }}>Build a session</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginTop: 3 }}>Mix &amp; match phrases across languages</div>
      </div>

      {/* selected summary chip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 8px' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>{sel} selected · {langsUsed} languages</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--muted)' }}>Clear</span>
      </div>

      {/* sections by language */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {LANGS.map((l) => (
          <div key={l.lang}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 22px 4px', position: 'sticky', top: 0, background: 'var(--bg)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flex: '0 0 auto' }}>
                <span style={{ fontFamily: l.font, fontSize: 16, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>{l.native}</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.2px', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{l.lang}</span>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--amber)' }}>Select all</span>
            </div>
            {l.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '7px 22px' }}>
                <span style={{ width: 25, height: 25, flex: '0 0 auto', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: it.on ? 'var(--green)' : 'transparent', border: it.on ? 'none' : '2px solid var(--line)', color: 'var(--bg)' }}>
                  {it.on && G.check(14)}
                </span>
                <div style={{ minWidth: 0, opacity: it.on ? 1 : 0.6 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.en}</div>
                  <div style={{ fontFamily: l.font, fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.na}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* start */}
      <div style={{ padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)', borderTop: '1px solid var(--line)' }}>
        <Primary label="START DRIVING" sub={`${sel} phrases · ${langsUsed} languages`} />
      </div>
    </div>
  );
}

// ── SESSION COMPLETE (shown when leaving / all learned) ─────────
function SessionComplete() {
  const Stat = ({ n, label }) => (
    <div style={{ flex: 1, padding: '16px 8px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px' }}>{n}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.4px', color: 'var(--muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
  return (
    <div style={screen()}>
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 5, borderRadius: 5, background: 'var(--line)' }} />
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '20px 24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 64, height: 64, borderRadius: 64, background: 'var(--green)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
          {G.check(34)}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px', marginTop: 22 }}>Nice drive!</div>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted)', marginTop: 6 }}>You ran through Travel Basics. Here's how it went.</div>

        <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
          <Stat n="12" label="PRACTICED" />
          <Stat n="+3" label="NEW" />
          <Stat n="22m" label="DRIVE TIME" />
        </div>

        <div style={{ marginTop: 22, padding: '18px 20px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>Deck progress</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>8 / 12 learned</span>
          </div>
          <Bar value={8} total={12} color="var(--green)" />
        </div>

        <div style={{ marginTop: 22, fontSize: 13, fontWeight: 600, color: 'var(--muted2)', lineHeight: 1.5 }}>
          4 phrases still need work — they'll lead your next session.
        </div>
      </div>

      <div style={{ padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 22px)', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <Primary label="BACK TO HOME" />
        <div style={{ height: 56, borderRadius: 18, border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: 'var(--fg)' }}>
          {G.play(18)}<span style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>Drive again</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, DeckPicker, PhraseSelect, LanguageLibrary, SessionComplete });
