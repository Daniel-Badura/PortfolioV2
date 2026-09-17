import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium', ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) } }],
  webServer: {
    command: 'node backend/server.js',
    url: 'http://127.0.0.1:4173/api/health',
    env: { NODE_ENV: 'production', PORT: '4173', DATA_SOURCE: 'file' },
    reuseExistingServer: !process.env.CI,
  },
});
