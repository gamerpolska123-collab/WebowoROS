import { defineConfig, devices } from '@playwright/test';

/**
 * WebowoROS — Playwright E2E Configuration
 * All tests run inside Docker containers.
 * See: docker-compose.test.yml
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e-report' }],
  ],
  outputDir: 'e2e-results',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://web:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'echo "Servers managed by docker-compose"',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://web:3000',
    reuseExistingServer: true,
  },
});
