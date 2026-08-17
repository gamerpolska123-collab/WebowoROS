import { defineConfig, devices } from '@playwright/test';

/**
 * WebowoROS Playwright Configuration
 * 
 * ⚠️  ALL TESTS RUN INSIDE DOCKER CONTAINERS
 * Do NOT run `npx playwright test` locally — use `./start.sh e2e` instead.
 * 
 * The e2e service connects to the web container (http://web:3000) 
 * and api container (http://api:4000) inside the Docker network.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://web:3000';
const API_URL = process.env.PLAYWRIGHT_API_URL || 'http://api:4000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: '/app/e2e-report', open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 15000,
    // Container-to-container communication
    extraHTTPHeaders: {
      'X-Test-Origin': 'playwright-e2e',
    },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  // NO webServer — everything runs inside Docker containers
  // The web and api services are started by docker-compose
  outputDir: '/app/e2e-results',
});
