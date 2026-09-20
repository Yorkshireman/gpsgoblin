import type { Locator } from '@playwright/test';
import { blockExternalTiles, expect, test } from './browserTest';

const expected = {
  light: {
    action: 'rgb(37, 78, 36)',
    clearBorder: 'rgb(113, 113, 122)',
    clearFocus: 'rgb(37, 78, 36)',
    controlBorder: 'rgb(72, 83, 59)',
    page: 'rgb(235, 238, 218)',
    panel: 'rgb(255, 254, 244)',
    muted: 'rgb(72, 83, 59)',
    selection: 'rgb(219, 234, 254)',
    selectionText: 'rgb(23, 61, 166)',
    infoBackground: 'rgb(219, 234, 254)',
    infoText: 'rgb(23, 61, 166)'
  },
  dark: {
    action: 'rgb(185, 217, 139)',
    clearBorder: 'rgb(212, 212, 216)',
    clearFocus: 'rgb(185, 217, 139)',
    controlBorder: 'rgb(203, 213, 191)',
    page: 'rgb(21, 29, 23)',
    panel: 'rgb(32, 43, 34)',
    muted: 'rgb(203, 213, 191)',
    selection: 'rgb(32, 52, 74)',
    selectionText: 'rgb(190, 219, 250)',
    infoBackground: 'rgb(32, 52, 74)',
    infoText: 'rgb(190, 219, 250)'
  }
} as const;

const fixture = {
  name: 'bramble-route.gpx',
  mimeType: 'application/gpx+xml',
  buffer: Buffer.from(`<gpx version="1.1"><trk><trkseg>
    <trkpt lat="53.958" lon="-1.083"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt>
    <trkpt lat="53.960" lon="-1.080"><ele>20</ele><time>2026-01-01T00:01:00Z</time></trkpt>
    <trkpt lat="53.962" lon="-1.077"><ele>30</ele><time>2026-01-01T00:02:00Z</time></trkpt>
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
    await blockExternalTiles(context);
    const page = await context.newPage();

    try {
      await page.goto('/');
      await expect(
        page.getByRole('heading', {
          name: 'Free tools for GPS and activity files'
        })
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
      await expect(
        page.getByRole('slider', { name: 'Position on route' })
      ).toBeVisible();
      const clearFile = page.getByRole('button', { name: 'Clear file' });
      await expect(clearFile).toHaveCSS(
        'border-color',
        expected[colorScheme].clearBorder
      );
      if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
        await clearFile.hover();
        await expect
          .poll(async () =>
            clearFile.evaluate((element) => element.matches(':hover'))
          )
          .toBe(true);
        await expect(clearFile).toHaveCSS(
          'background-color',
          expected[colorScheme].panel
        );
        await expect(clearFile).toHaveCSS(
          'border-color',
          expected[colorScheme].clearBorder
        );
      }
      await clearFile.focus();
      await expect(clearFile).toBeFocused();
      await expect(clearFile).toHaveCSS(
        'outline-color',
        expected[colorScheme].clearFocus
      );
      await expect(clearFile).toHaveCSS('outline-style', 'solid');
      for (const name of ['Smoothing', 'Position on route']) {
        const slider = page.getByRole('slider', { name });
        const root = slider.locator(
          'xpath=ancestor::*[@data-scope="slider" and @data-part="root"]'
        );
        await expect(root.locator('[data-part="track"]')).toHaveCSS(
          'border-color',
          expected[colorScheme].controlBorder
        );
        await expect(root.locator('[data-part="range"]')).toHaveCSS(
          'background-color',
          expected[colorScheme].action
        );
        await expect(root.locator('[data-part="thumb"]')).toHaveCSS(
          'border-color',
          expected[colorScheme].action
        );
        await slider.focus();
        await expect(root.locator('[data-part="thumb"]')).toHaveCSS(
          'outline-color',
          expected[colorScheme].action
        );
        await expect(root.locator('[data-part="thumb"]')).toHaveCSS(
          'outline-style',
          'solid'
        );
        await slider.press('Home');
        await expect(slider).toHaveAttribute('aria-valuenow', '0');
        if (name === 'Position on route') {
          await slider.press('ArrowRight');
          await expect(slider).toHaveAttribute('aria-valuenow', '1');
        }
        await slider.press('End');
        await expect(slider).toHaveAttribute(
          'aria-valuenow',
          (await slider.getAttribute('aria-valuemax')) ?? ''
        );
      }
      await page
        .getByRole('slider', { name: 'Position on route' })
        .press('End');
      await expect(
        page.getByLabel('Selected measurement', { exact: true })
      ).toHaveCSS('background-color', expected[colorScheme].selection);
      await expect(
        page.getByLabel('Selected measurement', { exact: true })
      ).toHaveCSS('color', expected[colorScheme].selectionText);

      await page.getByLabel('GPX file', { exact: true }).setInputFiles({
        name: 'one-point.gpx',
        mimeType: 'application/gpx+xml',
        buffer: Buffer.from(
          '<gpx version="1.1"><trk><trkseg><trkpt lat="53.958" lon="-1.083" /></trkseg></trk></gpx>'
        )
      });
      await expect(
        page.getByText('one-point.gpx', { exact: true })
      ).toBeVisible();
      const viewOnMap = page.getByRole('button', { name: 'View on map' });
      if (await viewOnMap.isVisible()) {
        await viewOnMap.click();
      }
      const information = page.locator('.chakra-alert__root').filter({
        has: page.getByText('No line to display', { exact: true })
      });
      await expect(information).toHaveCSS(
        'background-color',
        expected[colorScheme].infoBackground
      );
      await expect(information).toHaveCSS(
        'color',
        expected[colorScheme].infoText
      );
    } finally {
      await context.close();
    }
  });
}
