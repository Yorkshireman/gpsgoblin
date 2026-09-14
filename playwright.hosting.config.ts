import { defineConfig } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import base from './playwright.config';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4186);
const baseURL = `http://127.0.0.1:${port}`;
const hostingConfig = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const localConfigPath = path.resolve('.wrangler/hosting-test.json');

// Production routes make Wrangler replace incoming Host headers. Keep the asset
// configuration, but let these local checks simulate public and preview hosts.
mkdirSync(path.dirname(localConfigPath), { recursive: true });
writeFileSync(localConfigPath, JSON.stringify({
  ...hostingConfig,
  routes: [],
  assets: { ...hostingConfig.assets, directory: path.resolve(hostingConfig.assets.directory) }
}));

export default defineConfig({
  ...base,
  testMatch: ['releaseSecurity.spec.ts', 'hydration.spec.ts'],
  use: { ...base.use, baseURL },
  webServer: {
    command: `pnpm exec wrangler dev --config ${localConfigPath} --local --ip 127.0.0.1 --port ${port}`,
    env: { WRANGLER_SEND_METRICS: 'false' },
    url: baseURL,
    reuseExistingServer: false
  }
});
