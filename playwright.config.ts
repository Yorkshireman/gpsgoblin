import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:4173', channel: 'chrome' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1 --directory out',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI
  }
});
