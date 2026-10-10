import { defineConfig } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';
const origin = 'http://127.0.0.1:4173';

// Headless Chromium with software WebGL so the 3D views render on a machine
// with no GPU (CI runners, cloud sessions).
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: origin + base,
    viewport: { width: 1280, height: 800 },
    launchOptions: {
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
      ],
    },
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: origin + base,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
