import {
  createUXContext,
  expect,
  test,
  uxBaselineViewports
} from './browserTest';

for (const viewport of uxBaselineViewports) {
  test(`global shell keeps short-page footers useful at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await createUXContext(browser, viewport);
    const page = await context.newPage();

    for (const path of ['/', '/tools/gpx-file-viewer']) {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer.getByRole('link')).toHaveCount(5);
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeInViewport({ ratio: 0.99 });
      const footerLayout = await footer.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return {
          bottomGap: window.innerHeight - box.bottom,
          height: box.height,
          pageOverflows: document.documentElement.scrollWidth > innerWidth,
          position: getComputedStyle(element).position
        };
      });
      expect(footerLayout).toEqual(
        expect.objectContaining({
          bottomGap: 0,
          pageOverflows: false,
          position: 'relative'
        })
      );
      expect(footerLayout.height).toBeGreaterThanOrEqual(53);
      await page.screenshot({
        path: testInfo.outputPath(
          `${path === '/' ? 'homepage' : path.slice(1).replaceAll('/', '-')}-${viewport.width}x${viewport.height}.png`
        )
      });
    }

    for (const [path, heading] of [
      ['/privacy', 'Privacy'],
      ['/limitations', 'Support and limitations'],
      ['/help/how-to-get-a-gpx-file', 'How to get and open a GPX file'],
      [
        '/help/gpx-file-empty-or-missing-data',
        'Why a GPX file is empty or missing data'
      ]
    ]) {
      await page.goto(path);
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
          `${path.slice(1)}-initial-${viewport.width}x${viewport.height}.png`
        )
      });
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect(page.locator('footer')).toBeInViewport({ ratio: 0.99 });
      await page.screenshot({
        path: testInfo.outputPath(
          `${path.slice(1)}-footer-${viewport.width}x${viewport.height}.png`
        )
      });
    }

    await context.close();
  });
}
