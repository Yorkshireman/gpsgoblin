import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL, channel: 'chrome' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: `python3 scripts/serveStaticExport.py --port ${port}`,
    url: baseURL,
    reuseExistingServer: false
  }
});
