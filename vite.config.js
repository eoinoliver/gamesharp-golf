import { defineConfig } from 'vite';
export default defineConfig({
  root: 'next',
  build: { outDir: '../dist', emptyOutDir: true, sourcemap: false, chunkSizeWarningLimit: 650 },
});
