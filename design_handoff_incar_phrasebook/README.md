# Handoff: In-Car Phrasebook (hands-free language drilling)

## Overview
A mobile app for practicing foreign-language phrases **while driving**. The user builds a
session by selecting phrases (across multiple languages), then hits START. A glanceable
"player" screen reads each phrase aloud (normal / slow / drill cadence), shows the English
translation large with the native script + romanization beneath, and exposes a few oversized,
low-attention controls: **STAY** (loop the current phrase), **PAUSE**, and **GOT IT**
(mark learned + advance). It builds on an existing backend that stores per-phrase audio (MP3 in
S3) and metadata (DynamoDB); this design covers the **client** experience.

## About the Design Files
The files in this bundle are **design references built in HTML/React-via-Babel** — runnable
prototypes that show the intended look and behavior. They are **not production code to copy
directly**. The task is to **recreate these designs in the target codebase's environment**
(e.g. React Native / Swift / Kotlin / Flutter for a real mobile app) using that platform's
established patterns. If no codebase exists yet, pick the most appropriate mobile framework and
implement there. The HTML uses inline styles and a single in-file component tree purely for
prototyping convenience.

## Fidelity
**High-fidelity.** Colors, typography, spacing, sizing, copy, and interactions are final and
intentional. Recreate the UI to match. The two color themes (Light "Cozy" + Dark) and the
exact tokens below are the source of truth.

## Screens / Views

### 1. Home — "Build a session" (functional)
- **Purpose:** Pick which phrases to drill. Phrases are grouped by language; selection works
  **across languages** to form one mixed deck.
- **Layout (top→bottom):** Header (title "Build a session" + subtitle "Mix & match across
  languages"; a round 40px light/dark toggle button top-right). A summary row ("N selected · M
  languages" in green, + a "Clear" text button right). A scrollable list of language sections.
  A bottom bar (1px top border) with a full-width green **START DRIVING** button (label +
  "N phrases · M languages" subtitle).
- **Language section:** header row = native name (e.g. 日本語, in that language's font) + uppercase
  English name (muted, letter-spacing 1.2px) on the left; "Select all" (amber text button) right.
  Then phrase rows.
- **Phrase row (tap toggles):** 25×25 checkbox (radius 8; checked = solid `--green` w/ white
  check icon; unchecked = 2px `--line` border, transparent). English (16px / 600 / `--fg`) on
  line 1; native script (12.5px / 500 / `--muted`, in language font) on line 2. Unselected rows
  render at 0.62 opacity. Text truncates with ellipsis (nowrap).
- **START disabled** when 0 selected (surface bg, muted text).

### 2. Driving player (functional) — the core screen
- **Purpose:** Hands-free playback. Fixed-position layout so **nothing moves** when the phrase
  changes (critical for glanceability).
- **Layout (top→bottom):**
  1. **Grab handle** (top, centered): a 40×5 rounded pill + a small chevron-down (⌄, `--muted`).
     Tap (or swipe-down, when built) returns to Home. ~20px tall, not a control row.
  2. **Mode row:** segmented control [Normal | Slow | Drill] (each flex:1; active = `--fg`
     bg / `--bg` text) + a fixed 46px-wide light/dark toggle button at the end.
  3. **Center region** (`flex:1`, `justify-content:center`) holding three stacked blocks:
     - **UP NEXT**: small label + one peek row (English 14.5/600, native 12.5/500, no checkbox).
       When every phrase is learned, the label turns green and reads **"LOOPING FOR REVIEW"**
       with body "All phrases learned — replaying for review."
     - **NOW PLAYING card** — **fixed height 312px**, radius 24, 2px border (`--amber`, or
       `--green` while STAY is engaged). Content vertically centered; waveform pinned to the
       card's bottom. English is the hero: **31px / 700 / `--fg`**. Native script: 22px / 500 /
       `--muted` (in phrase's font). Romanization: 15px / 600 / accent. A live waveform
       (40 bars, played portion in accent, the rest `--line`). While STAY is on, a compact
       "↻ ×N" loop badge sits absolutely top-right.
     - **RECENTLY PLAYED**: label + a fixed 120px-tall area (reserves 2 rows so it never
       shifts) listing the last played phrases, English-led, learned ones marked with a green
       check (others a muted dot), tappable to jump back.
  4. **Controls** (bottom): full-width **STAY ON PHRASE** toggle (54px; idle = green-tinted
     outline, active = solid `--green` reading "STAYING ON THIS"); then a 78px row of
     **PAUSE** (1 unit; surface; toggles to PLAY) + **GOT IT** (1.7 units; solid `--green`).

### 3. Session complete (static design — see Start Screens file)
- Shown when the user taps the handle to leave (or once all phrases are learned). Green check
  circle, "Nice drive!", three stat cards (PRACTICED / NEW / DRIVE TIME), a deck-progress bar,
  a "needs work" note, and **BACK TO HOME** (primary) + **Drive again** (outline) buttons.

### 4. Alternate home directions (static designs — see Start Screens file)
Provided as options, not the chosen path: a deck-based **Home** (Continue card + "Your decks"),
a **Choose a deck** picker, and a **Select phrases** checklist. The **language-grouped Home
(#1) is the chosen direction.**

## Interactions & Behavior
- **Build a session:** tapping a row or "Select all" toggles selection; "Clear" empties it.
  START hands the selected phrases (in list order) to the player and resets session state.
- **Playback engine:** a 100ms clock drives a per-phrase segment list based on mode:
  - `drill`: say@0.9×(2.6s) → gap 0.65s → say@0.5×(4.2s) → gap 0.65s → say@0.9×(2.6s) → gap 1.4s
  - `normal`: say@0.9×(2.6s) → gap 1.4s
  - `slow`: say@0.5×(4.2s) → gap 1.4s
  Progress fills the waveform across the total. On segment entry, audio is (re)spoken at that
  rate. At the end of the cycle: if STAY → restart same phrase, increment loop count; else →
  push current to history and advance.
- **Speech:** prototype uses the Web Speech API (`SpeechSynthesisUtterance`) with `lang` set
  per phrase (`ja-JP`, `ko-KR`, `es-ES`) and `rate` per segment. **In production, replace this
  with the real S3 MP3 audio** (you already have normal/slow recordings); keep the same
  segment timing/cadence model.
- **STAY:** locks the current phrase on an endless loop (card border → green, "↻ ×N" badge,
  STAY button active). **GOT IT** while staying: marks learned, turns STAY off, advances.
- **GOT IT:** adds current to a `learned` set, advances to next. **Recommended:** auto-advance
  (current behavior). Open question for product: on later laps, drop learned phrases vs. replay
  the full set (currently replays full set).
- **PAUSE/PLAY:** stops/resumes the clock and cancels in-flight speech.
- **Queue:** advancing wraps continuously (never goes silent). UP NEXT shows the next
  not-yet-learned phrase; RECENTLY PLAYED shows history (tap to jump back).
- **Back:** the grab handle returns to Home (and would present Session Complete in the full app).
- **Themes:** light/dark toggle is instant; persists per session (persist to storage in prod).

## State Management
- **App:** `view` ('home' | 'drive'), `deck` (array of selected phrases), `session` (id used to
  remount the player on a fresh start), `theme`.
- **Home:** `selected` set of phrase keys.
- **Player:** `current` index, `playing`, `staying`, `mode`, `learned` (Set), `history` (array,
  most-recent-first, deduped, capped ~6), `progress` (0–1), `loop` count. Internal refs mirror
  state for the stable interval clock; `elapsed`/`lastSegment` track the segment cursor; an
  `interacted` flag gates speech until first user gesture (browser autoplay policy — N/A on
  native, where you control an audio player directly).
- **Phrase shape:** `{ en, jp (native text), ro (romanization), font, code (BCP-47 lang) }`.

## Design Tokens

**Fonts**
- UI / Latin: **Hanken Grotesk** (400/500/600/700/800)
- Japanese: **Zen Kaku Gothic New** (400/500/700)
- Korean: **Noto Sans KR** (400/500/700)
- Spanish/Latin uses the UI font.

**Theme — Light ("Cozy")** (CSS oklch)
- bg `oklch(0.93 0.026 72)` · surface `oklch(0.965 0.022 72)` · line `oklch(0.83 0.034 65)`
- fg `oklch(0.31 0.045 48)` · muted `oklch(0.5 0.042 52)` · muted2 `oklch(0.62 0.036 58)`
- amber (accent/now-playing) `oklch(0.54 0.14 42)` · green (go/stay/learned) `oklch(0.5 0.075 128)`

**Theme — Dark**
- bg `oklch(0.17 0.008 250)` · surface `oklch(0.225 0.011 250)` · line `oklch(0.32 0.012 250)`
- fg `oklch(0.96 0.004 250)` · muted `oklch(0.67 0.013 250)` · muted2 `oklch(0.52 0.013 250)`
- amber `oklch(0.83 0.15 75)` · green `oklch(0.85 0.17 145)`

(Two more palettes — "Daylight" and "Night HUD" — exist in the earlier exploration if you want
them, but Light + Dark are the shipped set.)

**Sizing / spacing**
- Phone frame radius 38; safe-area insets respected top & bottom.
- Now-playing card: height **312**, radius 24, border 2px, padding 16/22/18.
- Recently-played reserved area: height **120** (≈2 rows).
- Controls: STAY 54px, PAUSE/GOT IT row 78px, START 72px; button radius 18–20.
- Section labels: 11px / 800 / letter-spacing 1.6px / uppercase / `--muted`.
- Type scale (player): hero English 31/700; native 22/500; romaji 15/600; list English 14.5–18.
- Checkbox 25×25 radius 8; round icon buttons 40px.

**Waveform:** 40 bars, 3px gap, radius 4; bar height from `sin` + a moving phase while playing;
played fraction colored in the accent, remainder `--line`.

## Assets
- No raster images. All icons are inline SVGs (play, pause, loop/repeat, check, chevron, sun,
  moon, gear, back). Recreate with your icon library (Lucide/SF Symbols/Material equivalents).
- Fonts via Google Fonts (links in the HTML `<head>`); swap to bundled fonts in production.
- **Audio:** production should use the existing S3 MP3s (normal + slow per phrase) instead of
  device TTS.

## Files (in this bundle)
- `In-Car Phrasebook — Prototype.html` — the **connected, functional** prototype (Home → player
  → back). Open this first.
  - `screens/home.jsx` — functional "Build a session" home (cross-language selection).
  - `screens/prototype.jsx` — the driving player (playback engine, STAY/PAUSE/GOT IT, history,
    looping, end-of-session state, themes).
- `In-Car Phrasebook — Start Screens.html` — static screen designs: language home, deck picker,
  phrase select, **session complete**, in Light + Dark.
  - `screens/start-screens.jsx` — those screens.
  - `design-canvas.jsx` — the canvas wrapper used to present the static screens (presentation
    only; not part of the product).

To run a file locally: serve the folder over http (e.g. `npx serve`) and open the HTML — the
JSX is transpiled in-browser via Babel.
