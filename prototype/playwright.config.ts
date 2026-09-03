import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Two projects: `mobile` renders the app full-bleed at the Figma frame size (393 × 852),
 * where every geometry assertion lives; `desktop-frame` renders it inside the iPhone
 * outline, which only the a11y sweep and a smoke test need.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 15 Pro'],
        browserName: 'chromium',
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'desktop-frame',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 960 } },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm exec vite preview --port ${String(PORT)} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
