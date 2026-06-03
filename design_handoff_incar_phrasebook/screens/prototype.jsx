// Interactive in-car phrasebook prototype — the refined queue screen, live.
// Real playback engine (normal / slow / drill), STAY loop, PAUSE, GOT IT,
// tappable recently-played, optional ja-JP speech synthesis.

const DECK = [
  { jp: 'すみません、駅はどこですか？', ro: 'Sumimasen, eki wa doko desu ka?', en: 'Excuse me, where is the station?' },
  { jp: 'これをください。',             ro: 'Kore o kudasai.',                en: "I'll take this, please." },
  { jp: '水をもらえますか？',           ro: 'Mizu o moraemasu ka?',           en: 'Could I get some water?' },
  { jp: 'いくらですか？',               ro: 'Ikura desu ka?',                 en: 'How much is it?' },
  { jp: 'ありがとうございます。',       ro: 'Arigatō gozaimasu.',             en: 'Thank you very much.' },
  { jp: 'もう一度お願いします。',       ro: 'Mō ichido onegaishimasu.',       en: 'One more time, please.' },
  { jp: 'この近くにおすすめのレストランはありますか？', ro: 'Kono chikaku ni osusume no resutoran wa arimasu ka?', en: 'Is there a good restaurant near here?' },
  { jp: '空港へ行く電車はどれですか？', ro: 'Kūkō e iku densha wa dore desu ka?', en: 'Which train goes to the airport?' },
  { jp: 'もう少しゆっくり話してもらえますか？', ro: 'Mō sukoshi yukkuri hanashite moraemasu ka?', en: 'Could you speak a little more slowly, please?' },
  { jp: 'これの別のサイズはありますか？', ro: 'Kore no betsu no saizu wa arimasu ka?', en: 'Do you have this in a different size?' },
  { jp: 'クレジットカードは使えますか？', ro: 'Kurejitto kādo wa tsukaemasu ka?', en: 'Can I pay with a credit card?' },
  { jp: '大丈夫です。',                 ro: 'Daijōbu desu.',                  en: "It's all right." },
];

const MODES = {
  drill:  [{ say: 0.9, dur: 2600 }, { gap: 650 }, { say: 0.5, dur: 4200 }, { gap: 650 }, { say: 0.9, dur: 2600 }, { gap: 1400 }],
  normal: [{ say: 0.9, dur: 2600 }, { gap: 1400 }],
  slow:   [{ say: 0.5, dur: 4200 }, { gap: 1400 }],
};
const total = (segs) => segs.reduce((a, s) => a + (s.dur || s.gap), 0);

// icons
const I = {
  loop: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/></svg>,
  check: (s = 26) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
  pause: (s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.3"/><rect x="14" y="5" width="4" height="14" rx="1.3"/></svg>,
  play: (s = 24) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>,
  speaker: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>,
  muted: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>,
  sun: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z"/></svg>,
};

// Live waveform driven by progress + a moving phase.
function LiveWave({ progress, phase, playing, color, dim, bars = 40, height = 34 }) {
  const items = [];
  for (let i = 0; i < bars; i++) {
    const base = 0.32 + Math.abs(Math.sin(i * 0.55)) * 0.5;
    const shimmer = playing ? Math.sin(i * 0.5 + phase) * 0.22 : 0;
    const h = Math.max(0.14, Math.min(1, base + shimmer));
    const on = i / bars <= progress;
    items.push(<div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: 4,
      background: on ? color : dim, transition: 'background .15s' }} />);
  }
  return <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>{items}</div>;
}

function StatusBar() {
  return (
    <div style={{ height: 46, flex: '0 0 auto', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', padding: '0 24px 6px', fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg)' }}>
        <svg width="17" height="11" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity=".4"/></svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 21, height: 11, borderRadius: 3, border: '1px solid currentColor', padding: 1.5, display: 'flex' }}><div style={{ flex: 1, background: 'currentColor', borderRadius: 1 }} /></div>
          <div style={{ width: 1.5, height: 4, background: 'currentColor', borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function QueueRow({ p, done, onClick, size = 'sm', showIcon = true }) {
  const big = size === 'lg';
  return (
    <button onClick={onClick} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: big ? '8px 12px' : '5px 12px', borderRadius: 12,
      fontFamily: 'inherit' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in oklch, var(--fg) 6%, transparent)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      {showIcon && (
        <span style={{ width: 20, flex: '0 0 auto', display: 'flex', justifyContent: 'center', color: 'var(--green)' }}>
          {done ? I.check(big ? 18 : 16) : <span style={{ width: 7, height: 7, borderRadius: 7, background: 'var(--muted2)' }} />}
        </span>
      )}
      <span style={{ minWidth: 0, opacity: done ? 0.66 : 1 }}>
        <span style={{ display: 'block', fontSize: big ? 18 : 14.5, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.en}</span>
        <span style={{ display: 'block', fontFamily: p.font || 'var(--jp)', fontSize: big ? 14.5 : 12.5, fontWeight: 500, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.jp}</span>
      </span>
    </button>
  );
}

function Prototype({ theme, setTheme, radius = 38, deck = DECK, onBack }) {
  const [current, setCurrent] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [staying, setStaying] = React.useState(false);
  const [mode, setMode] = React.useState('drill');
  const [muted, setMuted] = React.useState(false);
  const [learned, setLearned] = React.useState(() => new Set());
  const [history, setHistory] = React.useState([]);
  const [progress, setProgress] = React.useState(0);
  const [loop, setLoop] = React.useState(1);
  const [tick, setTick] = React.useState(0); // forces waveform animation frames

  // refs mirror state for the stable interval
  const R = React.useRef({});
  R.current = { current, playing, staying, mode, muted };
  const deckRef = React.useRef(deck);
  deckRef.current = deck;
  const elapsed = React.useRef(0);
  const lastSeg = React.useRef(-1);
  const interacted = React.useRef(false);

  const speak = React.useCallback((idx, rate) => {
    if (R.current.muted || !interacted.current) return;
    const synth = window.speechSynthesis; if (!synth) return;
    try {
      synth.cancel();
      const ph = deckRef.current[idx]; if (!ph) return;
      const u = new SpeechSynthesisUtterance(ph.jp);
      const code = ph.code || 'ja-JP';
      u.lang = code; u.rate = rate; u.pitch = 1;
      const pre = code.slice(0, 2).toLowerCase();
      const v = synth.getVoices().find((x) => x.lang && x.lang.toLowerCase().slice(0, 2) === pre);
      if (v) u.voice = v;
      synth.speak(u);
    } catch (e) {}
  }, []);

  const restart = React.useCallback(() => { elapsed.current = 0; lastSeg.current = -1; }, []);

  const advance = React.useCallback(() => {
    const cur = R.current.current;
    setHistory((h) => [cur, ...h.filter((x) => x !== cur)].slice(0, 6));
    setCurrent((c) => (c + 1) % deckRef.current.length);
    setLoop(1); restart();
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }, [restart]);

  // master clock
  React.useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => (t + 1) % 100000);
      if (!R.current.playing) return;
      const segs = MODES[R.current.mode];
      const tot = total(segs);
      elapsed.current += 100;
      const el = elapsed.current;
      // which segment?
      let acc = 0, segIdx = 0;
      for (let i = 0; i < segs.length; i++) { const d = segs[i].dur || segs[i].gap; if (el < acc + d) { segIdx = i; break; } acc += d; segIdx = i; }
      if (segIdx !== lastSeg.current) {
        lastSeg.current = segIdx;
        if (segs[segIdx].say) speak(R.current.current, segs[segIdx].say);
      }
      setProgress(Math.min(1, el / tot));
      if (el >= tot) {
        if (R.current.staying) { elapsed.current = 0; lastSeg.current = -1; setLoop((n) => n + 1); }
        else advance();
      }
    }, 100);
    return () => clearInterval(id);
  }, [speak, advance]);

  const go = (fn) => { interacted.current = true; fn(); };
  const togglePlay = () => go(() => setPlaying((p) => { if (p) { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} } return !p; }));
  const toggleStay = () => go(() => setStaying((s) => !s));
  const gotIt = () => go(() => {
    setLearned((l) => new Set(l).add(R.current.current));
    setStaying(false); setPlaying(true); advance();
  });
  const jumpTo = (idx) => go(() => {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    setCurrent(idx); setStaying(false); setPlaying(true); setLoop(1); restart();
  });

  const p = deck[current];
  const accent = staying ? 'var(--green)' : 'var(--amber)';
  const phase = tick * 0.4;
  // up next: following phrases, skip learned, max 3
  const upNext = [];
  for (let k = 1; k <= deck.length && upNext.length < 3; k++) {
    const idx = (current + k) % deck.length;
    if (idx === current || learned.has(idx)) continue;
    upNext.push(idx);
  }
  const learnedCount = learned.size;
  const allDone = learnedCount >= deck.length;

  return (
    <div className={theme} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--ui)', borderRadius: radius, overflow: 'hidden', position: 'relative' }}>
      {/* grab handle — tap / swipe down to return to home */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
        <button title="Back to home" onClick={() => (onBack ? onBack() : go(() => {}))}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 28px 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'var(--muted)' }}>
          <div style={{ width: 40, height: 5, borderRadius: 5, background: 'var(--line)' }} />
          <svg width="20" height="14" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5l7 7 7-7"/></svg>
        </button>
      </div>
      {/* mode segmented + light/dark toggle */}
      <div style={{ display: 'flex', gap: 6, margin: '12px 18px 0', alignItems: 'stretch' }}>
        {['normal', 'slow', 'drill'].map((m) => (
          <button key={m} onClick={() => go(() => { setMode(m); restart(); })}
            style={{ flex: 1, padding: '8px 0', borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'capitalize',
              background: mode === m ? 'var(--fg)' : 'var(--surface)', color: mode === m ? 'var(--bg)' : 'var(--muted)',
              border: mode === m ? 'none' : '1px solid var(--line)' }}>{m}</button>
        ))}
        <button onClick={() => go(() => setTheme(theme === 'theme-dark' ? 'theme-cozy' : 'theme-dark'))}
          title="Light / dark"
          style={{ flex: '0 0 auto', width: 46, borderRadius: 11, border: '1px solid var(--line)', background: 'var(--surface)',
            color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {theme === 'theme-dark' ? I.sun(18) : I.moon(17)}
        </button>
      </div>

      {/* center region: stable, fixed heights so nothing jumps on phrase change */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {/* up next — single peek, no number */}
        <div style={{ padding: '0 22px 2px', fontSize: 11, fontWeight: 800, letterSpacing: '1.6px', color: allDone ? 'var(--green)' : 'var(--muted)' }}>{allDone ? 'LOOPING FOR REVIEW' : 'UP NEXT'}</div>
        <div style={{ padding: '0 10px' }}>
          {upNext.length === 0
            ? <div style={{ padding: '5px 12px', fontSize: 14, fontWeight: 600, color: 'var(--muted2)' }}>All phrases learned — replaying for review.</div>
            : upNext.slice(0, 1).map((idx) => <QueueRow key={idx} p={DECK[idx]} size="sm" showIcon={false} onClick={() => jumpTo(idx)} />)}
        </div>

        {/* now playing — FIXED height, English centered, wave pinned to bottom */}
        <div style={{ position: 'relative', margin: '10px 18px 0', height: 312, flex: '0 0 auto',
          padding: '16px 22px 18px', borderRadius: 24, background: 'var(--surface)',
          border: `2px solid ${staying ? 'var(--green)' : 'var(--amber)'}`, transition: 'border-color .2s',
          display: 'flex', flexDirection: 'column' }}>
          {staying && (
            <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 800, letterSpacing: '.5px', color: 'var(--green)' }}>{I.loop(15)}<span>×{loop}</span></div>
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 31, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.18, letterSpacing: '-.3px', textWrap: 'balance' }}>{p.en}</div>
            <div style={{ fontFamily: p.font || 'var(--jp)', fontSize: 22, fontWeight: 500, color: 'var(--muted)', lineHeight: 1.3, letterSpacing: '.5px', marginTop: 11 }}>{p.jp}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: accent, marginTop: 5 }}>{p.ro}</div>
          </div>
          <LiveWave progress={progress} phase={phase} playing={playing} color={accent} dim="var(--line)" height={30} />
        </div>

        {/* recently played — reserved height so it never shifts */}
        <div style={{ padding: '16px 22px 2px', fontSize: 11, fontWeight: 800, letterSpacing: '1.6px', color: 'var(--muted)' }}>RECENTLY PLAYED</div>
        <div style={{ padding: '0 10px', height: 120, overflow: 'hidden' }}>
          {history.length === 0
            ? <div style={{ padding: '8px 12px', fontSize: 14, color: 'var(--muted2)' }}>Nothing yet — it'll show here.</div>
            : history.slice(0, 2).map((idx) => <QueueRow key={idx} p={DECK[idx]} done={learned.has(idx)} size="lg" onClick={() => jumpTo(idx)} />)}
        </div>
      </div>

      {/* controls */}
      <div style={{ padding: '6px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={toggleStay} style={{ height: 54, borderRadius: 19, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          color: staying ? 'var(--bg)' : 'var(--green)', background: staying ? 'var(--green)' : 'color-mix(in oklch, var(--green) 14%, var(--bg))',
          border: '1.5px solid var(--green)', transition: 'all .18s' }}>
          {I.loop(21)}<span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '.5px', whiteSpace: 'nowrap' }}>{staying ? 'STAYING ON THIS' : 'STAY ON PHRASE'}</span>
        </button>
        <div style={{ display: 'flex', gap: 11, height: 78 }}>
          <button onClick={togglePlay} style={{ flex: 1, borderRadius: 19, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)' }}>
            {playing ? I.pause(26) : I.play(26)}
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.6px' }}>{playing ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button onClick={gotIt} style={{ flex: 1.7, borderRadius: 19, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            background: 'var(--green)', border: 'none', color: 'var(--bg)' }}>
            {I.check(27)}<span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>GOT IT</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Prototype });
