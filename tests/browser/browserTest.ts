import { test as base, expect, type BrowserContext } from '@playwright/test';

// Default to local geometry in automated runs. Individual basemap tests can
// override this at page level with synthetic tiles or explicit failure responses.
export const blockExternalTiles = async (context: BrowserContext) => {
  await context.route('https://tile.openstreetmap.org/**', async (route) => {
    await route.abort();
    return;
  });
  return;
};

export const test = base.extend({
  context: async ({ context }, provideContext) => {
    await blockExternalTiles(context);
    await provideContext(context);
    return;
  }
});

export { expect };
