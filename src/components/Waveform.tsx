import { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  progress: number; // 0..1 — fraction colored in the accent
  playing: boolean;
  color: string;
  dim: string;
  analyser?: AnalyserNode | null; // when present, bars reflect the real signal
  bars?: number;
  height?: number;
}

// When an AnalyserNode is supplied, bar heights come from the live audio
// spectrum; otherwise they fall back to a decorative sine pattern with a
// moving shimmer. The played fraction is always colored in the accent.
export function Waveform({ progress, playing, color, dim, analyser, bars = 40, height = 30 }: WaveformProps) {
  const [levels, setLevels] = useState<number[]>(() => new Array(bars).fill(0));
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const freqRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!playing) return;
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      if (analyser) {
        const binCount = analyser.frequencyBinCount;
        if (!freqRef.current || freqRef.current.length !== binCount) {
          freqRef.current = new Uint8Array(new ArrayBuffer(binCount));
        }
        const data = freqRef.current;
        analyser.getByteFrequencyData(data);
        // Spread `bars` buckets across the lower ~75% of the spectrum, where
        // most speech energy lives, averaging the bins in each bucket.
        const usable = Math.max(bars, Math.floor(binCount * 0.75));
        const next = new Array<number>(bars);
        for (let i = 0; i < bars; i++) {
          const start = Math.floor((i / bars) * usable);
          const end = Math.max(start + 1, Math.floor(((i + 1) / bars) * usable));
          let sum = 0;
          for (let j = start; j < end; j++) sum += data[j];
          next[i] = sum / (end - start) / 255;
        }
        setLevels(next);
      } else {
        setPhase((p) => p + 0.16);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, analyser, bars]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {Array.from({ length: bars }, (_, i) => {
        let h: number;
        if (analyser) {
          // Small floor so quiet/silent moments still read as a thin line.
          h = Math.max(0.08, Math.min(1, levels[i] * 1.15 + 0.05));
        } else {
          const base = 0.32 + Math.abs(Math.sin(i * 0.55)) * 0.5;
          const shimmer = playing ? Math.sin(i * 0.5 + phase) * 0.22 : 0;
          h = Math.max(0.14, Math.min(1, base + shimmer));
        }
        const on = i / bars <= progress;
        return (
          <div
            key={i}
            style={{ flex: 1, height: `${h * 100}%`, borderRadius: 4, background: on ? color : dim, transition: 'background .15s' }}
          />
        );
      })}
    </div>
  );
}
