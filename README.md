# In-Car Phrasebook

A hands-free language-drilling player for the car. It reads your saved phrases
from the TTS phrasebook backend, lets you build a mixed-language session, then
plays each phrase aloud (normal / slow / drill cadence) with an oversized,
glanceable player.

This app is **read-only** — phrases and their audio are created in the companion
[TTS phrasebook app](../language-learning-tts-phrasebook). Here we only:

- `GET /phrases` from the Lambda Function URL (HMAC-TOTP authenticated), and
- stream the per-phrase `normal` / `slow` MP3s from S3.

## Stack

- **Vite + React + TypeScript**, plain CSS using the design's `oklch` tokens.
- No router — three views (`home` → `drive` → `complete`) driven by state.
- Web Crypto API generates the short-lived `x-app-token` (see `src/api/crypto.ts`).
- The player's waveform is **real**: the audio routes through a Web Audio
  `AnalyserNode`, so the bars reflect the live signal (with a decorative
  fallback if analysis is unavailable).

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the three VITE_ values
npm run dev
```

The dev server runs over **HTTPS** (self-signed cert via
`@vitejs/plugin-basic-ssl`) and binds to all interfaces. This matters because
the Web Crypto API (token generation) only works in a **secure context**:

- On your machine, open the `https://localhost:5173` URL.
- **On a phone**, open the `https://<your-LAN-IP>:5173` URL Vite prints under
  "Network" and accept the self-signed certificate warning. A plain
  `http://<LAN-IP>` URL is **not** a secure context and will fail with
  "Web Crypto unavailable".

> The `VITE_*` values are baked into the client bundle at build time — that is
> inherent to this client-side HMAC design (the secret ships to the browser).
> `.env` / `.env.local` are git-ignored; CI injects the values from GitHub
> Secrets.

## Environment variables

| Variable             | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `VITE_HMAC_SECRET`   | Shared secret for the HMAC-TOTP token (matches Lambda) |
| `VITE_LAMBDA_URL`    | Lambda Function URL base                           |
| `VITE_AUDIO_BASE_URL`| S3 base URL for the audio files                    |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-frontend.yml`, which builds
and publishes to GitHub Pages. Two one-time setup steps in the GitHub repo:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions** — add `HMAC_SECRET`,
   `LAMBDA_URL`, and `AUDIO_BASE_URL`.

The site is served from the repo sub-path, so `vite.config.ts` sets
`base: '/language-learning-drive-phrasebook/'`.

## Project layout

```
src/
  api/        crypto.ts (HMAC token) · client.ts (listPhrases, getAudioUrl)
  audio/      usePlayer.ts (normal/slow/drill engine + Web Audio analyser)
  components/ icons.tsx · Waveform.tsx (live spectrum bars)
  screens/    Home.tsx · Player.tsx · SessionComplete.tsx
  phrases.ts  Phrase → DeckPhrase mapping, language grouping, fonts
  App.tsx     view orchestration, fetch, theme
```
