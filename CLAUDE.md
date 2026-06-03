# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**In-Car Phrasebook** — a hands-free, glanceable language-drilling player for the
car. It is the **read-only consumer** of a phrasebook backend that already
exists. Phrases and their TTS audio are authored in a separate app
(`../language-learning-tts-phrasebook`); this app only **reads**.

- `GET /phrases` — list saved phrases (HMAC-TOTP authenticated).
- Streams per-phrase `normal` / `slow` MP3s from S3.

**Do not add write paths** (POST/PUT/DELETE) here — that is intentionally the
other app's job.

## Commands

```bash
npm install
npm run dev        # Vite dev server — open the http://localhost URL (secure context)
npm run build      # tsc -b (strict) + vite build → dist/
npm run preview     # serve the production build
npm run typecheck  # tsc -b --noEmit
```

`.env.local` holds the three `VITE_*` values for local dev (copy from
`.env.example`). It is git-ignored; CI injects them from GitHub Secrets.

## Architecture

```
src/
  api/
    crypto.ts     HMAC-TOTP token (Web Crypto). Must match the Lambda exactly:
                  HMAC-SHA256(secret, String(floor(Date.now()/30000))) hex.
    client.ts     listPhrases() + getAudioUrl(). Phrase interface = openapi.yaml.
  audio/
    usePlayer.ts  The playback engine (see below).
  components/
    icons.tsx     Inline SVG icons (currentColor).
    Waveform.tsx  Real spectrum bars from an AnalyserNode; decorative fallback.
  screens/
    Home.tsx           "Build a session" cross-language picker.
    Player.tsx         The driving player UI.
    SessionComplete.tsx Post-session summary.
  phrases.ts    Phrase → DeckPhrase mapping, language grouping, native fonts.
  App.tsx       View orchestration (home → drive → complete), fetch, theme.
  index.css     Design tokens (oklch), themes, app shell.
```

### Playback engine (`src/audio/usePlayer.ts`)

- Replaces the design prototype's Web Speech TTS with **real S3 audio**, keeping
  the normal/slow/drill cadence.
- A mode is a sequence of `audio` segments (play a recording, advance on the
  `ended` event) and `gap` segments (fixed silent pause, timed via rAF).
  - `normal`: normal → gap. `slow`: slow → gap.
  - `drill`: normal → gap → slow → gap → normal → gap.
- Mutually-recursive engine fns live in **refs reassigned every render**
  (`startSegmentRef` / `advanceRef` / `frameRef`) so they never read stale
  state. State is mirrored in `S.current` and updated imperatively inside
  control handlers (so the engine sees changes before React re-renders).
- STAY loops the current phrase (`loop++`); GOT IT marks learned + advances;
  the queue wraps forever (never goes silent).
- **Web Audio:** the `<audio>` element (`crossOrigin="anonymous"`) routes
  element → `AnalyserNode` → destination, built lazily on a play gesture
  (`ensureGraph`). The context is **closed on unmount** to avoid leaking
  contexts across sessions. If graph setup throws, `analyser` stays null and
  the waveform uses its decorative animation — audio still plays.

## Conventions

- Styling is **inline styles using CSS custom properties** (the design handoff's
  `oklch` tokens are the source of truth). Theme is a class on `.app-root`
  (`theme-cozy` light / `theme-dark`). Match the existing component style — do
  not introduce a CSS framework.
- The design source of truth is committed under `design_handoff_incar_phrasebook/`
  and `openapi.yaml` is the API contract. Consult them before changing UI or
  data shapes.
- TS is strict with `noUnusedLocals`/`noUnusedParameters` — the build fails on
  unused symbols.

## Gotchas / known facts

- **Colors are all `oklch()` / `color-mix(in oklch …)`** with no fallback —
  needs iOS 15.4+ / Chrome 111+. Intentional (design spec).
- **S3 CORS is confirmed** (`Access-Control-Allow-Origin: *`, `OPTIONS` 200),
  which is what makes the real analyser safe. The Lambda also returns `ACAO: *`.
- **`VITE_*` values are baked into the client bundle** — inherent to the
  client-side HMAC design (the secret ships to the browser). Not a leak to fix.
- **GitHub Pages base path**: `vite.config.ts` sets
  `base: '/language-learning-drive-phrasebook/'`. Keep it in sync with the repo
  name or assets 404 on Pages.
- Live data is **multi-language** (e.g. Spanish, Thai, …), ~42 phrases. Font
  mapping in `phrases.ts` handles JP/KR/TH/ZH and falls back to the UI font.
- **Known layout caveat:** the player uses fixed pixel heights from the design
  (312px card + ~200px controls) that assume a tall frame; on shorter phones in
  a browser the up-next / recently-played peeks (and on very short screens the
  card) can clip. Consider `100dvh` + a flexible card height if revisiting.

## Deploy

Push to `main` → `.github/workflows/deploy-frontend.yml` builds and publishes to
GitHub Pages. One-time repo setup: **Pages → Source: GitHub Actions**, and add
Actions secrets `HMAC_SECRET`, `LAMBDA_URL`, `AUDIO_BASE_URL`.
