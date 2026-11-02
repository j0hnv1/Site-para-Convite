import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite hospedar em qualquer pasta/subdomínio (GitHub Pages, Netlify, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { assetsInlineLimit: 0 },
});
