import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed to GitHub Pages at https://mitch-murph.github.io/language-learning-drive-phrasebook/
// so assets must be served from that sub-path. `http://localhost` is a secure
// context, so the Web Crypto API (used for the HMAC token) works in dev without
// extra TLS setup.
export default defineConfig({
  base: '/language-learning-drive-phrasebook/',
  plugins: [react()],
});
