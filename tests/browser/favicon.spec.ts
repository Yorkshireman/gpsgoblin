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
