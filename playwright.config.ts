import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'pnpm preview',
    port: 4173
  },
  testDir: 'tests',
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  workers: '100%',
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome']
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox']
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari']
    },
    {
      name: 'Mobile Chrome',
      use: devices['Pixel 5']
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 12']
    }
  ]
})
