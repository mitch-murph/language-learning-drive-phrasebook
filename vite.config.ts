import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Deployed to GitHub Pages at https://mitch-murph.github.io/language-learning-drive-phrasebook/
// so assets must be served from that sub-path.
//
// The HMAC token uses the Web Crypto API, which is only available in a secure
// context. `http://localhost` qualifies, but a phone hitting the dev server
// over the LAN IP (http://192.168.x.x) does NOT — so the dev server runs over
// HTTPS (self-signed) and binds to all interfaces for on-device testing.
export default defineConfig({
  base: '/language-learning-drive-phrasebook/',
  plugins: [react(), basicSsl()],
  server: {
    host: true,
  },
});
