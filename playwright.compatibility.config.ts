import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Opt-in engine coverage; ordinary browser checks keep their existing Chrome projects.
export default defineConfig({
  ...base,
  use: { baseURL: 'http://127.0.0.1:4173', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chrome-desktop', use: { browserName: 'chromium', channel: 'chrome', viewport: { width: 1280, height: 720 } } },
    { name: 'chrome-phone', use: { browserName: 'chromium', channel: 'chrome', viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'firefox-desktop', use: { browserName: 'firefox', viewport: { width: 1280, height: 720 } } },
    { name: 'firefox-phone', use: { browserName: 'firefox', viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1280, height: 720 } } },
    { name: 'webkit-phone', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, hasTouch: true } }
  ],
  workers: 1
});
