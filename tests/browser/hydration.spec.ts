import { expect, test } from './browserTest';

// A fresh document must hydrate identically regardless of earlier route requests.
// The static export also exercises separate server renders during the build.
for (const paths of [
  ['/tools/gpx-file-viewer.html', '/'],
  ['/', '/tools/gpx-file-viewer.html']
]) {
  test(`pages hydrate after visiting ${paths.join(' then ')}`, async ({
    page
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydrat|server rendered|react\.dev\/errors\/(418|419|421|422|423|425)/i.test(
          message.text()
        )
      ) {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    for (const path of paths) {
      await page.goto(path);
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    }
  });
}
