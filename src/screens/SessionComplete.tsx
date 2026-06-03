import { Check, Play } from '../components/icons';

interface SessionCompleteProps {
  total: number; // phrases in the session
  learnedCount: number; // marked "got it" this session
  driveMs: number; // session duration
  onHome: () => void;
  onAgain: () => void;
}

function Bar({ value, total, color = 'var(--green)' }: { value: number; total: number; color?: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ height: 6, borderRadius: 6, background: 'color-mix(in oklch, var(--fg) 9%, transparent)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ flex: 1, padding: '16px 8px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px' }}>{n}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.4px', color: 'var(--muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 1) return '<1m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

export function SessionComplete({ total, learnedCount, driveMs, onHome, onAgain }: SessionCompleteProps) {
  const remaining = Math.max(0, total - learnedCount);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--ui)' }}>
      <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 5, borderRadius: 5, background: 'var(--line)' }} />
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflow: 'auto', padding: '20px 24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 64, height: 64, borderRadius: 64, background: 'var(--green)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
          <Check size={34} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-.5px', marginTop: 22 }}>Nice drive!</div>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--muted)', marginTop: 6 }}>
          {learnedCount > 0 ? `You locked in ${learnedCount} ${learnedCount === 1 ? 'phrase' : 'phrases'}. Here's how it went.` : "Here's how that session went."}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
          <Stat n={String(total)} label="PRACTICED" />
          <Stat n={`+${learnedCount}`} label="LEARNED" />
          <Stat n={formatDuration(driveMs)} label="DRIVE TIME" />
        </div>

        <div style={{ marginTop: 22, padding: '18px 20px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fg)', whiteSpace: 'nowrap' }}>Session progress</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>{learnedCount} / {total} learned</span>
          </div>
          <Bar value={learnedCount} total={total} />
        </div>

        {remaining > 0 && (
          <div style={{ marginTop: 22, fontSize: 13, fontWeight: 600, color: 'var(--muted2)', lineHeight: 1.5 }}>
            {remaining} {remaining === 1 ? 'phrase' : 'phrases'} still need work — keep them in your next session.
          </div>
        )}
      </div>

      <div style={{ padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 22px)', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <button
          onClick={onHome}
          style={{ height: 72, borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'var(--green)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>BACK TO HOME</span>
        </button>
        <button
          onClick={onAgain}
          style={{ height: 56, borderRadius: 18, border: '1.5px solid var(--line)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: 'var(--fg)' }}
        >
          <Play size={18} />
          <span style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>Drive again</span>
        </button>
      </div>
    </div>
  );
}
