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

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the three VITE_ values
npm run dev
```

Open the **`http://localhost`** URL Vite prints — `localhost` is a secure
context, so the Web Crypto API (token generation) works without TLS.

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
  audio/      usePlayer.ts (normal/slow/drill playback engine)
  components/ icons.tsx · Waveform.tsx
  screens/    Home.tsx · Player.tsx · SessionComplete.tsx
  phrases.ts  Phrase → DeckPhrase mapping, language grouping, fonts
  App.tsx     view orchestration, fetch, theme
```
