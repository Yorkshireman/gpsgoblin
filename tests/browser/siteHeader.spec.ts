import {
  createUXContext,
  expect,
  test,
  uxBaselineViewports
} from './browserTest';

const fixture = {
  buffer: Buffer.from(
    '<gpx version="1.1"><trk><trkseg><trkpt lat="53" lon="-1"><time>2026-09-19T10:00:00Z</time></trkpt><trkpt lat="53.01" lon="-1"><time>2026-09-19T10:10:00Z</time></trkpt></trkseg></trk></gpx>'
  ),
  mimeType: 'application/gpx+xml',
  name: 'header-check.gpx'
};

const publishedPages = [
  ['/', 'Free tools for GPS and activity files'],
  ['/tools/gpx-file-viewer', 'GPX File Viewer'],
  ['/privacy', 'Privacy'],
  ['/limitations', 'Support and limitations']
] as const;

test('uses the shared home link across every published page', async ({
  page
}) => {
  for (const [path] of publishedPages) {
    await page.goto(path);
    await expect(
      page.locator('header').getByRole('link', { name: 'GPSGoblin home' })
    ).toHaveAttribute('href', '/');
  }
});

for (const viewport of uxBaselineViewports) {
  test(`header remains usable with 200% text at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await createUXContext(browser, viewport);
    const page = await context.newPage();

    for (const [path, heading] of publishedPages) {
      await page.goto(path);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '32px';
      });
      const homeLink = page
        .locator('header')
        .getByRole('link', { name: 'GPSGoblin home' });
      await expect(homeLink).toBeInViewport();
      await expect(
        page.getByRole('heading', { level: 1, name: heading })
      ).toBeInViewport();
      expect(
        await page.evaluate(() => {
          return document.documentElement.scrollWidth > innerWidth;
        })
      ).toBe(false);
      await page.screenshot({
        path: testInfo.outputPath(
          `${path === '/' ? 'homepage' : path.slice(1).replaceAll('/', '-')}-large-text-${viewport.width}x${viewport.height}.png`
        )
      });
    }

    await context.close();
  });
}

for (const viewport of uxBaselineViewports) {
  test(`header stays compact and usable at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await createUXContext(browser, viewport);
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
    await page.screenshot({
      path: testInfo.outputPath(
        `loaded-viewer-${viewport.width}x${viewport.height}.png`
      )
    });

    if (viewport.width < 600) await homeLink.tap();
    else await homeLink.press('Enter');
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', {
        name: 'Free tools for GPS and activity files'
      })
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(
        `homepage-${viewport.width}x${viewport.height}.png`
      )
    });

    await context.close();
  });
}
