import {
  test as base,
  expect,
  type Browser,
  type BrowserContext
} from '@playwright/test';

export const uxBaselineViewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
] as const;

type UXBaselineViewport = (typeof uxBaselineViewports)[number];

// Default to local geometry in automated runs. Individual basemap tests can
// override this at page level with synthetic tiles or explicit failure responses.
export const blockExternalTiles = async (context: BrowserContext) => {
  await context.route('https://tile.openstreetmap.org/**', async (route) => {
    await route.abort();
    return;
  });
  return;
};

export const createUXContext = async (
  browser: Browser,
  viewport: UXBaselineViewport
) => {
  const context = await browser.newContext({
    hasTouch: viewport.width < 600,
    viewport
  });
  await blockExternalTiles(context);
  return context;
};

export const test = base.extend({
  context: async ({ context }, provideContext) => {
    await blockExternalTiles(context);
    await provideContext(context);
    return;
  }
});

export { expect };
