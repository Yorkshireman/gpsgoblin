import type { Locator } from '@playwright/test';
import { expect, test } from './browserTest';

const expected = {
  light: {
    page: 'rgb(235, 238, 218)',
    panel: 'rgb(255, 254, 244)',
    muted: 'rgb(72, 83, 59)',
    selection: 'rgb(240, 220, 232)'
  },
  dark: {
    page: 'rgb(21, 29, 23)',
    panel: 'rgb(32, 43, 34)',
    muted: 'rgb(203, 213, 191)',
    selection: 'rgb(32, 52, 74)'
  }
} as const;

const fixture = {
  name: 'bramble-route.gpx',
  mimeType: 'application/gpx+xml',
  buffer: Buffer.from(`<gpx version="1.1"><trk><trkseg>
    <trkpt lat="53.958" lon="-1.083"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt>
    <trkpt lat="53.960" lon="-1.080"><ele>20</ele><time>2026-01-01T00:01:00Z</time></trkpt>
    </trkseg></trk></gpx>`)
};

const background = async (locator: Locator) => {
  return locator.evaluate((element) => {
    return getComputedStyle(element).backgroundColor;
  });
};

for (const colorScheme of ['light', 'dark'] as const) {
  test(`uses Bramble surfaces and secondary text in ${colorScheme} mode`, async ({
    browser
  }) => {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();

    try {
      await page.goto('/');
      await expect(
        page.getByRole('heading', { name: 'GPSGoblin' })
      ).toBeVisible();
      await expect
        .poll(async () => background(page.locator('body')))
        .toBe(expected[colorScheme].page);
      await expect
        .poll(async () => {
          return page
            .getByRole('heading', { name: 'GPX File Viewer' })
            .locator('..')
            .evaluate((element) => getComputedStyle(element).backgroundColor);
        })
        .toBe(expected[colorScheme].panel);
      await expect(
        page.getByText(
          'Supports GPX 1.1. Free to use; your original file stays unchanged.'
        )
      ).toHaveCSS('color', expected[colorScheme].muted);

      await page.goto('/tools/gpx-file-viewer');
      await expect
        .poll(async () => background(page.locator('body')))
        .toBe(expected[colorScheme].page);
      await page.getByLabel('GPX file', { exact: true }).setInputFiles(fixture);
      await page
        .getByRole('slider', { name: 'Position on route' })
        .press('End');
      await expect(
        page.getByLabel('Selected measurement', { exact: true })
      ).toHaveCSS('background-color', expected[colorScheme].selection);
    } finally {
      await context.close();
    }
  });
}
