import { blockExternalTiles, expect, test } from './browserTest';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`global shell keeps short-page footers useful at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }) => {
    const context = await browser.newContext({
      hasTouch: viewport.width < 600,
      viewport
    });
    await blockExternalTiles(context);
    const page = await context.newPage();

    for (const path of ['/', '/tools/gpx-file-viewer']) {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer).toBeInViewport({ ratio: 1 });
      await expect(footer.getByRole('link')).toHaveCount(3);
      expect(
        await footer.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            bottomGap: window.innerHeight - box.bottom,
            height: box.height,
            position: getComputedStyle(element).position,
            pageOverflows: document.documentElement.scrollWidth > innerWidth
          };
        })
      ).toEqual({
        bottomGap: 0,
        height: 53,
        pageOverflows: false,
        position: 'relative'
      });
    }

    await context.close();
  });
}
