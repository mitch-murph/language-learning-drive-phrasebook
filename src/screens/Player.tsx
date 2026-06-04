import type { DeckPhrase } from '../phrases';
import { usePlayer, type Mode } from '../audio/usePlayer';
import { Waveform } from '../components/Waveform';
import { Check, Play, Pause, Loop, Sun, Moon, ChevronDown } from '../components/icons';

interface PlayerProps {
  deck: DeckPhrase[];
  initialMode: Mode;
  theme: string;
  onToggleTheme: () => void;
  onBack: (learnedCount: number) => void;
}

const MODES: Mode[] = ['normal', 'slow', 'drill', 'recall'];

function QueueRow({
  p,
  done,
  onClick,
  size = 'sm',
  showIcon = true,
}: {
  p: DeckPhrase;
  done?: boolean;
  onClick: () => void;
  size?: 'sm' | 'lg';
  showIcon?: boolean;
}) {
  const big = size === 'lg';
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12, padding: big ? '8px 12px' : '5px 12px', borderRadius: 12, fontFamily: 'inherit',
      }}
    >
      {showIcon && (
        <span style={{ width: 20, flex: '0 0 auto', display: 'flex', justifyContent: 'center', color: 'var(--green)' }}>
          {done ? <Check size={big ? 18 : 16} /> : <span style={{ width: 7, height: 7, borderRadius: 7, background: 'var(--muted2)' }} />}
        </span>
      )}
      <span style={{ minWidth: 0, opacity: done ? 0.66 : 1 }}>
        <span style={{ display: 'block', fontSize: big ? 18 : 14.5, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.en}</span>
        <span style={{ display: 'block', fontFamily: p.font, fontSize: big ? 14.5 : 12.5, fontWeight: 500, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.native}</span>
      </span>
    </button>
  );
}

export function Player({ deck, initialMode, theme, onToggleTheme, onBack }: PlayerProps) {
  const player = usePlayer(deck, initialMode);
  const { phrase: p, playing, staying, mode, loop, progress, learned, history, segIdx } = player;
  const revealed = mode !== 'recall' || segIdx >= 2;

  const accent = staying ? 'var(--green)' : 'var(--amber)';

  // Up next: following phrases, skipping learned ones.
  const upNext: number[] = [];
  for (let k = 1; k <= deck.length && upNext.length < 3; k++) {
    const idx = (player.current + k) % deck.length;
    if (idx === player.current || learned.has(idx)) continue;
    upNext.push(idx);
  }
  const allDone = learned.size >= deck.length;

  if (!p) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--ui)', position: 'relative' }}>
      {/* grab handle — tap to return home */}
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
        <button
          title="Back to home"
          onClick={() => onBack(learned.size)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'var(--muted)' }}
        >
          <div style={{ width: 40, height: 5, borderRadius: 5, background: 'var(--line)' }} />
          <ChevronDown size={20} />
        </button>
      </div>

      {/* mode segmented + light/dark toggle */}
      <div style={{ display: 'flex', gap: 6, margin: '12px 18px 0', alignItems: 'stretch' }}>
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => player.setMode(m)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 700, letterSpacing: '.5px', textTransform: 'capitalize',
              background: mode === m ? 'var(--fg)' : 'var(--surface)', color: mode === m ? 'var(--bg)' : 'var(--muted)',
              border: mode === m ? 'none' : '1px solid var(--line)',
            }}
          >
            {m}
          </button>
        ))}
        <button
          onClick={onToggleTheme}
          title="Light / dark"
          style={{ flex: '0 0 auto', width: 46, borderRadius: 11, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'theme-dark' ? <Sun size={18} /> : <Moon size={17} />}
        </button>
      </div>

      {/* center region — fixed heights so nothing jumps on phrase change */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ padding: '0 22px 2px', fontSize: 11, fontWeight: 800, letterSpacing: '1.6px', color: allDone ? 'var(--green)' : 'var(--muted)' }}>
          {allDone ? 'LOOPING FOR REVIEW' : 'UP NEXT'}
        </div>
        <div style={{ padding: '0 10px' }}>
          {upNext.length === 0 ? (
            <div style={{ padding: '5px 12px', fontSize: 14, fontWeight: 600, color: 'var(--muted2)' }}>All phrases learned — replaying for review.</div>
          ) : (
            <QueueRow p={deck[upNext[0]]} size="sm" showIcon={false} onClick={() => player.jumpTo(upNext[0])} />
          )}
        </div>

        {/* now playing — fixed height, English centered, wave pinned to bottom */}
        <div
          style={{
            position: 'relative', margin: '10px 18px 0', height: 312, flex: '0 0 auto', padding: '16px 22px 18px', borderRadius: 24,
            background: 'var(--surface)', border: `2px solid ${staying ? 'var(--green)' : 'var(--amber)'}`, transition: 'border-color .2s',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {staying && (
            <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '.5px', color: 'var(--green)' }}>
              <Loop size={15} />
              <span>×{loop}</span>
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 31, fontWeight: 700, color: 'var(--fg)', lineHeight: 1.18, letterSpacing: '-.3px', textWrap: 'balance' } as React.CSSProperties}>{p.en}</div>
            <div style={{ fontFamily: p.font, fontSize: 22, fontWeight: 500, color: 'var(--muted)', lineHeight: 1.3, letterSpacing: '.5px', marginTop: 11, opacity: revealed ? 1 : 0, transition: 'opacity .4s' }}>{p.native}</div>
            {p.nonLatin && p.ro && <div style={{ fontSize: 15, fontWeight: 600, color: accent, marginTop: 5, opacity: revealed ? 1 : 0, transition: 'opacity .4s' }}>{p.ro}</div>}
          </div>
          <Waveform progress={progress} playing={playing} color={accent} dim="var(--line)" height={30} />
        </div>

        {/* recently played — reserved height so it never shifts */}
        <div style={{ padding: '16px 22px 2px', fontSize: 11, fontWeight: 800, letterSpacing: '1.6px', color: 'var(--muted)' }}>RECENTLY PLAYED</div>
        <div className="no-scrollbar" style={{ padding: '0 10px', height: 120, overflow: 'hidden' }}>
          {history.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: 14, color: 'var(--muted2)' }}>Nothing yet — it'll show here.</div>
          ) : (
            history.slice(0, 2).map((idx) => <QueueRow key={idx} p={deck[idx]} done={learned.has(idx)} size="lg" onClick={() => player.jumpTo(idx)} />)
          )}
        </div>
      </div>

      {/* controls */}
      <div style={{ padding: '6px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={player.toggleStay}
          style={{
            height: 54, borderRadius: 19, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            color: staying ? 'var(--bg)' : 'var(--green)', background: staying ? 'var(--green)' : 'color-mix(in oklch, var(--green) 14%, var(--bg))',
            border: '1.5px solid var(--green)', transition: 'all .18s',
          }}
        >
          <Loop size={21} />
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '.5px', whiteSpace: 'nowrap' }}>{staying ? 'STAYING ON THIS' : 'STAY ON PHRASE'}</span>
        </button>
        <div style={{ display: 'flex', gap: 11, height: 78 }}>
          <button
            onClick={player.togglePlay}
            style={{ flex: 1, borderRadius: 19, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)' }}
          >
            {playing ? <Pause size={26} /> : <Play size={26} />}
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.6px' }}>{playing ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button
            onClick={player.gotIt}
            style={{ flex: 1.7, borderRadius: 19, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--green)', border: 'none', color: 'var(--bg)' }}
          >
            <Check size={27} />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>GOT IT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
