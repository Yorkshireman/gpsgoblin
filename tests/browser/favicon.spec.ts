import { expect, test } from './browserTest';

test('serves the route-pin favicon from the static export', async ({
  page
}) => {
  await page.goto('/');

  const icon = page.locator('link[rel="icon"][type="image/svg+xml"]');
  await expect(icon).toHaveAttribute('sizes', 'any');

  const href = await icon.getAttribute('href');
  expect(href).toMatch(/^\/icon\.svg\?/);

  const response = await page.request.get(href!);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  expect(await response.text()).toContain('GPSGoblin grounded map-pin mark');
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`renders the favicon clearly at browser-tab sizes against ${colorScheme} chrome`, async ({
    page
  }, testInfo) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');

    const href = await page
      .locator('link[rel="icon"][type="image/svg+xml"]')
      .getAttribute('href');
    if (!href) throw new Error('Expected the favicon URL.');

    const faviconURL = new URL(href, page.url()).href;
    const chromeColor = colorScheme === 'dark' ? '#202124' : '#f1f3f4';
    await page.setContent(`
      <main style="background:${chromeColor}; display:flex; gap:16px; padding:16px">
        <img alt="GPSGoblin favicon at 16 pixels" height="16" src="${faviconURL}" width="16" />
        <img alt="GPSGoblin favicon at 32 pixels" height="32" src="${faviconURL}" width="32" />
      </main>
    `);

    for (const size of [16, 32]) {
      const favicon = page.getByRole('img', {
        name: `GPSGoblin favicon at ${size} pixels`
      });
      await expect(favicon).toBeVisible();
      await expect(favicon).toHaveJSProperty('complete', true);
      await expect(favicon).toHaveAttribute('height', `${size}`);
      await expect(favicon).toHaveAttribute('width', `${size}`);
    }
    await page.locator('main').screenshot({
      path: testInfo.outputPath(`favicon-${colorScheme}-chrome.png`)
    });
  });
}
