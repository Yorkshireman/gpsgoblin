import { expect, test, blockExternalTiles } from './browserTest';

const fixture = {
  buffer: Buffer.from(
    '<gpx version="1.1"><trk><trkseg><trkpt lat="53" lon="-1"><time>2026-09-19T10:00:00Z</time></trkpt><trkpt lat="53.01" lon="-1"><time>2026-09-19T10:10:00Z</time></trkpt></trkseg></trk></gpx>'
  ),
  mimeType: 'application/gpx+xml',
  name: 'header-check.gpx'
};

test('uses the shared home link across every published page', async ({
  page
}) => {
  for (const path of [
    '/',
    '/tools/gpx-file-viewer',
    '/privacy',
    '/limitations'
  ]) {
    await page.goto(path);
    await expect(
      page.locator('header').getByRole('link', { name: 'GPSGoblin home' })
    ).toHaveAttribute('href', '/');
  }
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`header stays compact and usable at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }) => {
    const context = await browser.newContext({
      hasTouch: viewport.width < 600,
      viewport
    });
    await blockExternalTiles(context);
    const page = await context.newPage();

    await page.goto('/tools/gpx-file-viewer');
    const header = page.locator('header');
    const homeLink = header.getByRole('link', { name: 'GPSGoblin home' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveCSS('min-height', '44px');
    await expect(header.locator('img')).toHaveAttribute('alt', '');
    await expect(header.locator('img')).toHaveAttribute('aria-hidden', 'true');
    await expect(
      page.getByRole('heading', { name: 'GPX File Viewer' })
    ).toBeInViewport();

    await page.keyboard.press('Tab');
    await expect(homeLink).toBeFocused();
    await expect
      .poll(async () => {
        return homeLink.evaluate((element) => {
          const style = getComputedStyle(element);
          return `${style.outlineStyle} ${style.boxShadow}`;
        });
      })
      .not.toBe('none none');

    await page.getByLabel('GPX file', { exact: true }).setInputFiles(fixture);
    await expect(page.getByText('Calculated distance')).toBeVisible();
    await expect(homeLink).toBeInViewport();
    await expect(
      page.getByRole('button', { name: 'Change GPX file' })
    ).toBeInViewport();

    if (viewport.width < 600) await homeLink.tap();
    else await homeLink.press('Enter');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', {
        name: 'Free tools for GPS and activity files'
      })
    ).toBeVisible();

    await context.close();
  });
}
