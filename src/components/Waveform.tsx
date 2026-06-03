import { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  progress: number; // 0..1 — cursor position
  playing: boolean;
  color: string;
  dim: string;
  bars?: number;
  height?: number;
}

export function Waveform({ progress, playing, color, dim, bars = 40, height = 30 }: WaveformProps) {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setPhase((p) => p + 0.1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  return (
    <div style={{ position: 'relative', height }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: '100%' }}>
        {Array.from({ length: bars }, (_, i) => {
          const base = 0.32 + Math.abs(Math.sin(i * 0.55)) * 0.5;
          const shimmer = playing ? Math.sin(i * 0.5 + phase) * 0.22 : 0;
          const h = Math.max(0.14, Math.min(1, base + shimmer));
          const on = i / bars <= progress;
          return (
            <div
              key={i}
              style={{ flex: 1, height: `${h * 100}%`, borderRadius: 4, background: on ? color : dim, transition: 'background .15s' }}
            />
          );
        })}
      </div>
      {/* playhead cursor */}
      <div
        style={{
          position: 'absolute',
          top: -2, bottom: -2,
          left: `${progress * 100}%`,
          width: 2,
          borderRadius: 2,
          background: color,
          transform: 'translateX(-50%)',
          boxShadow: `0 0 6px ${color}`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
