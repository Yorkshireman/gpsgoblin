import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4186);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  ...base,
  testMatch: ['releaseSecurity.spec.ts', 'hydration.spec.ts'],
  use: { ...base.use, baseURL },
  webServer: {
    command: `pnpm exec wrangler dev --local --ip 127.0.0.1 --port ${port}`,
    env: { WRANGLER_SEND_METRICS: 'false' },
    url: baseURL,
    reuseExistingServer: false
  }
});
