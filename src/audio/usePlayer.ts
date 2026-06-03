import { useCallback, useEffect, useRef, useState } from 'react';
import type { DeckPhrase } from '../phrases';

export type Mode = 'normal' | 'slow' | 'drill';

interface Segment {
  kind: 'audio' | 'gap';
  src?: 'normal' | 'slow';
  ms?: number;
}

// Per-mode cadence. Mirrors the design's timing model, but each "audio"
// segment plays a real S3 recording (its length governs the segment) and each
// "gap" is a fixed silent pause.
const SEQUENCES: Record<Mode, Segment[]> = {
  normal: [{ kind: 'audio', src: 'normal' }, { kind: 'gap', ms: 1400 }],
  slow: [{ kind: 'audio', src: 'slow' }, { kind: 'gap', ms: 1400 }],
  drill: [
    { kind: 'audio', src: 'normal' },
    { kind: 'gap', ms: 650 },
    { kind: 'audio', src: 'slow' },
    { kind: 'gap', ms: 650 },
    { kind: 'audio', src: 'normal' },
    { kind: 'gap', ms: 1400 },
  ],
};

const HISTORY_CAP = 6;

export interface PlayerApi {
  current: number;
  phrase: DeckPhrase;
  playing: boolean;
  staying: boolean;
  mode: Mode;
  loop: number;
  progress: number;
  learned: Set<number>;
  history: number[];
  setMode: (m: Mode) => void;
  togglePlay: () => void;
  toggleStay: () => void;
  gotIt: () => void;
  jumpTo: (idx: number) => void;
}

export function usePlayer(deck: DeckPhrase[]): PlayerApi {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [staying, setStaying] = useState(false);
  const [mode, setModeState] = useState<Mode>('drill');
  const [loop, setLoop] = useState(1);
  const [learned, setLearned] = useState<Set<number>>(() => new Set());
  const [history, setHistory] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  // Refs mirror state so the imperative engine never reads stale values.
  const S = useRef({ current, playing, staying, mode });
  S.current = { current, playing, staying, mode };
  const deckRef = useRef(deck);
  deckRef.current = deck;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segIdxRef = useRef(0);
  const gapElapsedRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Mutually-recursive engine functions live in refs, reassigned every render,
  // so callbacks always close over the latest state without stale captures.
  const startSegmentRef = useRef<(i: number) => void>(() => {});
  const advanceRef = useRef<() => void>(() => {});
  const frameRef = useRef<(ts: number) => void>(() => {});

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'auto';
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const clearRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const scheduleFrame = () => {
    if (!S.current.playing || rafRef.current != null) return;
    rafRef.current = requestAnimationFrame((ts) => {
      rafRef.current = null;
      frameRef.current(ts);
    });
  };

  frameRef.current = (ts: number) => {
    const seq = SEQUENCES[S.current.mode];
    const i = segIdxRef.current;
    const seg = seq[i];
    if (!seg) return;

    let intra = 0;
    if (seg.kind === 'audio') {
      const a = audioRef.current;
      intra = a && a.duration && isFinite(a.duration) ? a.currentTime / a.duration : 0;
    } else {
      if (lastTsRef.current != null) gapElapsedRef.current += ts - lastTsRef.current;
      lastTsRef.current = ts;
      const total = seg.ms ?? 0;
      intra = total ? gapElapsedRef.current / total : 1;
      if (intra >= 1) {
        setProgress(Math.min(1, (i + 1) / seq.length));
        startSegmentRef.current(i + 1);
        return;
      }
    }
    setProgress(Math.min(1, (i + Math.min(1, Math.max(0, intra))) / seq.length));
    scheduleFrame();
  };

  startSegmentRef.current = (i: number) => {
    const seq = SEQUENCES[S.current.mode];
    if (i >= seq.length) {
      // Cycle complete: loop in place when STAY is engaged, else advance.
      if (S.current.staying) {
        setLoop((n) => n + 1);
        segIdxRef.current = 0;
        startSegmentRef.current(0);
      } else {
        advanceRef.current();
      }
      return;
    }
    segIdxRef.current = i;
    const seg = seq[i];
    const phrase = deckRef.current[S.current.current];
    if (!phrase) return;

    if (seg.kind === 'audio') {
      const a = getAudio();
      const url = seg.src === 'slow' ? phrase.slowUrl : phrase.normalUrl;
      if (a.src !== url) a.src = url;
      try {
        a.currentTime = 0;
      } catch {
        /* not yet seekable — a fresh src already starts at 0 */
      }
      a.playbackRate = 1;
      if (S.current.playing) {
        a.play().catch(() => setPlaying(false));
      }
    } else {
      gapElapsedRef.current = 0;
      lastTsRef.current = null;
    }
    scheduleFrame();
  };

  advanceRef.current = () => {
    const cur = S.current.current;
    setHistory((h) => [cur, ...h.filter((x) => x !== cur)].slice(0, HISTORY_CAP));
    const next = deckRef.current.length ? (cur + 1) % deckRef.current.length : 0;
    S.current.current = next;
    setCurrent(next);
    setLoop(1);
    segIdxRef.current = 0;
    startSegmentRef.current(0);
  };

  // Engine lifecycle: (re)start whenever a new deck (session) arrives.
  useEffect(() => {
    const a = getAudio();
    const onEnded = () => startSegmentRef.current(segIdxRef.current + 1);
    // Treat a load/decode failure like the segment ending so playback never
    // stalls on a missing recording; the small delay avoids a tight loop.
    const onError = () => window.setTimeout(() => startSegmentRef.current(segIdxRef.current + 1), 150);
    a.addEventListener('ended', onEnded);
    a.addEventListener('error', onError);

    segIdxRef.current = 0;
    gapElapsedRef.current = 0;
    lastTsRef.current = null;
    setCurrent(0);
    S.current.current = 0;
    startSegmentRef.current(0);

    return () => {
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('error', onError);
      a.pause();
      clearRaf();
      lastTsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, getAudio]);

  // Pause/resume: stop or restart the clock and the underlying audio element.
  useEffect(() => {
    const a = audioRef.current;
    if (playing) {
      lastTsRef.current = null;
      const seg = SEQUENCES[S.current.mode][segIdxRef.current];
      if (seg?.kind === 'audio' && a) {
        a.play().catch(() => setPlaying(false));
      }
      scheduleFrame();
    } else {
      if (a) a.pause();
      clearRaf();
      lastTsRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const setMode = (m: Mode) => {
    S.current.mode = m;
    setModeState(m);
    segIdxRef.current = 0;
    gapElapsedRef.current = 0;
    lastTsRef.current = null;
    startSegmentRef.current(0);
  };

  const togglePlay = () => setPlaying((p) => !p);

  const toggleStay = () =>
    setStaying((s) => {
      S.current.staying = !s;
      return !s;
    });

  const gotIt = () => {
    setLearned((l) => new Set(l).add(S.current.current));
    S.current.staying = false;
    setStaying(false);
    S.current.playing = true;
    setPlaying(true);
    advanceRef.current();
  };

  const jumpTo = (idx: number) => {
    S.current.current = idx;
    setCurrent(idx);
    S.current.staying = false;
    setStaying(false);
    S.current.playing = true;
    setPlaying(true);
    setLoop(1);
    segIdxRef.current = 0;
    gapElapsedRef.current = 0;
    lastTsRef.current = null;
    startSegmentRef.current(0);
  };

  return {
    current,
    phrase: deck[current],
    playing,
    staying,
    mode,
    loop,
    progress,
    learned,
    history,
    setMode,
    togglePlay,
    toggleStay,
    gotIt,
    jumpTo,
  };
}
