import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

/**
 * End-to-end tests against a production build and the real mock API. Random API failures are turned off
 * so runs are deterministic; failures are tested on purpose with ?__scenario=error.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries: a flaky test should fail loudly, not pass on its second attempt.
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/transactions`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { MOCK_FAILURE_RATE: '0' },
  },
})
