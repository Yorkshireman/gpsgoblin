import type { Page } from '@playwright/test';
import { blockExternalTiles, expect, test } from './browserTest';

type FontRoles = {
  body: string;
  control: string;
  heading: string;
  overflows: boolean;
};

const readHomepageTypography = async (page: Page): Promise<FontRoles> => {
  return page.evaluate(() => {
    const heading = document.querySelector('h1');
    const control = document.querySelector('a');

    if (!heading || !control)
      throw new Error('Expected homepage content is missing.');

    return {
      body: getComputedStyle(document.body).fontFamily,
      control: getComputedStyle(control).fontFamily,
      heading: getComputedStyle(heading).fontFamily,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    };
  });
};

test('homepage uses the selected local type roles without a font-service request', async ({
  page,
  baseURL
}) => {
  if (!baseURL) throw new Error('Expected the browser test server URL.');

  const fontRequests: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fontRequests.push(request.url());
  });

  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'Free tools for GPS and activity files'
    })
  ).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const roles = await readHomepageTypography(page);
  expect(roles.heading).toMatch(/^fraunces/i);
  expect(roles.body).toMatch(/^sourceSans3/i);
  expect(roles.control).toMatch(/^sourceSans3/i);
  expect(roles.overflows).toBe(false);
  expect(fontRequests).toHaveLength(2);
  expect(fontRequests.every((url) => new URL(url).origin === baseURL)).toBe(
    true
  );
});

test('keeps the homepage usable when both font downloads fail', async ({
  page
}, testInfo) => {
  await page.route('**/*.woff2', async (route) => {
    await route.abort();
  });

  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'Free tools for GPS and activity files'
    })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open GPX File Viewer' })
  ).toBeVisible();

  const roles = await readHomepageTypography(page);
  expect(roles.overflows).toBe(false);
  await page.screenshot({
    path: testInfo.outputPath('font-downloads-blocked.png')
  });
});

test('keeps the homepage usable while font downloads are slow', async ({
  page
}, testInfo) => {
  let releaseFonts: (() => void) | undefined;
  const pendingFonts = new Promise<void>((resolve) => {
    releaseFonts = resolve;
  });
  let delayedFontRequests = 0;

  await page.route('**/*.woff2', async (route) => {
    delayedFontRequests += 1;
    await pendingFonts;
    await route.continue();
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', {
      name: 'Free tools for GPS and activity files'
    })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open GPX File Viewer' })
  ).toBeVisible();
  await expect.poll(() => delayedFontRequests).toBe(2);

  const fallbackRoles = await readHomepageTypography(page);
  expect(fallbackRoles.overflows).toBe(false);

  if (!releaseFonts) throw new Error('Expected delayed font downloads.');
  releaseFonts();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const loadedRoles = await readHomepageTypography(page);
  expect(loadedRoles.overflows).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('slow-fonts-loaded.png') });
});

const typographyViewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
];

for (const colorScheme of ['light', 'dark'] as const) {
  for (const viewport of typographyViewports) {
    test(`keeps the homepage action usable at 200% text in ${colorScheme} mode at ${viewport.width} × ${viewport.height}`, async ({
      browser
    }, testInfo) => {
      const context = await browser.newContext({
        colorScheme,
        hasTouch: viewport.width < 600,
        viewport
      });
      await blockExternalTiles(context);
      const page = await context.newPage();

      try {
        await page.goto('/');
        await page.evaluate(async () => {
          await document.fonts.ready;
          document.documentElement.style.fontSize = '32px';
        });

        await expect(
          page.getByRole('heading', {
            name: 'Free tools for GPS and activity files'
          })
        ).toBeVisible();
        const viewerLink = page.getByRole('link', {
          name: 'Open GPX File Viewer'
        });
        await viewerLink.scrollIntoViewIfNeeded();
        await expect(viewerLink).toBeInViewport();

        const roles = await readHomepageTypography(page);
        expect(roles.overflows).toBe(false);
        await page.screenshot({
          path: testInfo.outputPath(
            `large-text-${colorScheme}-${viewport.width}x${viewport.height}-action.png`
          )
        });

        if (viewport.width < 600) await viewerLink.tap();
        else await viewerLink.click();
        await expect(
          page.getByRole('heading', {
            name: 'GPX File Viewer',
            exact: true
          })
        ).toBeVisible();
      } finally {
        await context.close();
      }
    });
  }
}
