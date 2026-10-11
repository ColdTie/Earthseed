import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// BASE_PATH is set by the GitHub Pages workflow to "/<repo>/".
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'preact' },
  },
  resolve: {
    alias: {
      '@sim': fileURLToPath(new URL('./src/sim', import.meta.url)),
      '@gen': fileURLToPath(new URL('./src/gen', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  worker: {
    format: 'es',
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
