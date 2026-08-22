import { defineConfig } from 'vite';

export default defineConfig({
  // `public/assets` is served untouched so the font, video and image URLs baked
  // into the markup and stylesheet resolve identically in dev and in the build.
  publicDir: 'public',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'build/assets',
  },
});
