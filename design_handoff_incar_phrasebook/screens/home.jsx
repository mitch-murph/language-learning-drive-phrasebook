// Functional home: "Build a session" — pick phrases across languages, hit
// START to hand a custom deck to the player.

const HLANGS = [
  { lang: 'Japanese', native: '日本語', font: 'var(--jp)', code: 'ja-JP', items: [
    { en: 'Where is the station?',   jp: '駅はどこですか？',     ro: 'Eki wa doko desu ka?' },
    { en: "I'll take this, please.", jp: 'これをください。',     ro: 'Kore o kudasai.' },
    { en: 'Could I get some water?', jp: '水をもらえますか？',   ro: 'Mizu o moraemasu ka?' },
    { en: 'Thank you very much.',    jp: 'ありがとうございます。', ro: 'Arigatō gozaimasu.' },
  ] },
  { lang: 'Korean', native: '한국어', font: 'var(--kr)', code: 'ko-KR', items: [
    { en: 'Where is the bathroom?',  jp: '화장실이 어디예요?',  ro: 'Hwajangsil-i eodiyeyo?' },
    { en: 'How much is it?',         jp: '얼마예요?',           ro: 'Eolmayeyo?' },
    { en: 'Thank you very much.',    jp: '감사합니다.',         ro: 'Gamsahamnida.' },
  ] },
  { lang: 'Spanish', native: 'Español', font: 'var(--ui)', code: 'es-ES', items: [
    { en: 'The check, please.',      jp: 'La cuenta, por favor.',     ro: '' },
    { en: 'One coffee, please.',     jp: 'Un café, por favor.',       ro: '' },
    { en: 'Where is the station?',   jp: '¿Dónde está la estación?',  ro: '' },
  ] },
];

const HI = {
  check: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
  play: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>,
  sun: (s = 19) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z"/></svg>,
};

function Home({ theme, setTheme, onStart, radius = 38 }) {
  const key = (li, ii) => `${li}-${ii}`;
  const [sel, setSel] = React.useState(() => new Set(['0-0', '0-2', '1-0', '2-0', '2-1']));
  const toggle = (li, ii) => setSel((prev) => { const n = new Set(prev); const k = key(li, ii); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleLang = (li) => setSel((prev) => {
    const n = new Set(prev); const on = HLANGS[li].items.every((_, ii) => n.has(key(li, ii)));
    HLANGS[li].items.forEach((_, ii) => (on ? n.delete(key(li, ii)) : n.add(key(li, ii)))); return n;
  });
  const count = sel.size;
  const langsUsed = HLANGS.filter((l, li) => l.items.some((_, ii) => sel.has(key(li, ii)))).length;
  const buildDeck = () => {
    const out = [];
    HLANGS.forEach((l, li) => l.items.forEach((it, ii) => { if (sel.has(key(li, ii))) out.push({ en: it.en, jp: it.jp, ro: it.ro, font: l.font, code: l.code }); }));
    return out;
  };

  return (
    <div className={theme} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--ui)', borderRadius: radius, overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 22px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px', whiteSpace: 'nowrap' }}>Build a session</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap' }}>Mix &amp; match across languages</div>
        </div>
        <button onClick={() => setTheme(theme === 'theme-dark' ? 'theme-cozy' : 'theme-dark')} title="Light / dark"
          style={{ width: 40, height: 40, flex: '0 0 auto', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--surface)',
            color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {theme === 'theme-dark' ? HI.sun(19) : HI.moon(18)}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 6px' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>{count} selected · {langsUsed} languages</span>
        <button onClick={() => setSel(new Set())} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: 'var(--muted)' }}>Clear</button>
      </div>

      {/* sections */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {HLANGS.map((l, li) => (
          <div key={l.lang}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flex: '0 0 auto' }}>
                <span style={{ fontFamily: l.font, fontSize: 16, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>{l.native}</span>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.2px', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{l.lang}</span>
              </div>
              <button onClick={() => toggleLang(li)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: 'var(--amber)' }}>Select all</button>
            </div>
            {l.items.map((it, ii) => {
              const on = sel.has(key(li, ii));
              return (
                <button key={ii} onClick={() => toggle(li, ii)} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '7px 22px', fontFamily: 'inherit' }}>
                  <span style={{ width: 25, height: 25, flex: '0 0 auto', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: on ? 'var(--green)' : 'transparent', border: on ? 'none' : '2px solid var(--line)', color: 'var(--bg)' }}>
                    {on && HI.check(14)}
                  </span>
                  <span style={{ minWidth: 0, opacity: on ? 1 : 0.62 }}>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.en}</span>
                    <span style={{ display: 'block', fontFamily: l.font, fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.jp}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <div style={{ height: 8 }} />
      </div>

      {/* start */}
      <div style={{ padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)', borderTop: '1px solid var(--line)' }}>
        <button onClick={() => count > 0 && onStart(buildDeck())} disabled={count === 0}
          style={{ width: '100%', height: 72, borderRadius: 20, border: 'none', cursor: count ? 'pointer' : 'default', fontFamily: 'inherit',
            background: count ? 'var(--green)' : 'var(--surface)', color: count ? 'var(--bg)' : 'var(--muted2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, opacity: count ? 1 : 0.7 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{HI.play(22)}<span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>START DRIVING</span></span>
          <span style={{ fontSize: 12.5, fontWeight: 600, opacity: .8, whiteSpace: 'nowrap' }}>{count} phrases · {langsUsed} languages</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Home });
