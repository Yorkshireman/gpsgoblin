import { expect, test } from './browserTest';

const fixture = {
  name: 'private-route-name.gpx',
  mimeType: 'application/gpx+xml',
  buffer: Buffer.from(`<gpx version="1.1"><trk><name>Private route</name><trkseg>
    <trkpt lat="53.958" lon="-1.083"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt>
    <trkpt lat="53.960" lon="-1.080"><ele>20</ele><time>2026-01-01T00:01:00Z</time></trkpt>
    <trkpt lat="53.962" lon="-1.078"><ele>30</ele><time>2026-01-01T00:02:00Z</time></trkpt>
    </trkseg></trk></gpx>`)
};

// Synthetic image: automated checks never fetch or harvest public OSM tiles.
const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADfklEQVR4nO3OMQ3AMAAEseePsmOGgCiMG2LJALxzP3jW8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxBaPoDQ8gGElg8gtHwAoeUDCC0fQGj5AELLBxD6AdlMKI2RpHUbAAAAAElFTkSuQmCC', 'base64');

test('attribution stays visible and failed tiles preserve the map and chart selection', async ({ page }, testInfo) => {
  let failTiles = false;
  const requests: string[] = [];
  const outbound: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (request) => {
    outbound.push({ url: request.url(), method: request.method(), body: request.postData() });
    return;
  });
  await page.route('https://tile.openstreetmap.org/**', async (route) => {
    requests.push(route.request().url());
    await route.fulfill(failTiles
      ? { status: 429, body: 'Quota limited' }
      : { status: 200, contentType: 'image/png', body: tile });
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(fixture);
  await page.getByRole('slider', { name: 'Position on route' }).press('End');
  const viewMap = page.getByRole('button', { name: 'View on map' });
  const phone = await viewMap.isVisible();
  if (phone) {
    await viewMap.click();
  }
  const attribution = page.getByRole('link', { name: '© OpenStreetMap contributors', exact: true });
  await expect(attribution).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Loading background map' })).toHaveCount(0);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => { return /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(url); })).toBe(true);
  await expect(page.getByRole('img', { name: 'Selected map position: 53.962, -1.078', exact: true })).toBeVisible();
  await page.screenshot({ path: `/tmp/basemap-${testInfo.project.name}-ready.png` });
  failTiles = true;
  await page.locator('canvas.maplibregl-canvas').focus();
  await page.keyboard.press('+');
  await expect(page.getByRole('status').filter({ hasText: 'Background map unavailable' })).toBeVisible();
  await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Selected map position: 53.962, -1.078', exact: true })).toBeVisible();
  await page.screenshot({ path: `/tmp/basemap-${testInfo.project.name}-failed.png` });
  if (phone) {
    await page.getByRole('button', { name: 'Back to chart' }).click();
    await expect(viewMap).toBeFocused();
  }
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('00:02:00 UTC');
  expect(outbound.every(({ url, method, body }) => {
    return (url.startsWith('http://127.0.0.1:') || url.startsWith('https://tile.openstreetmap.org/'))
      && (method === 'GET' || method === 'HEAD') && body === null
      && !url.includes('private-route-name') && !url.includes('Private%20route');
  })).toBe(true);
});

test('operator disabled build makes no tile requests and retains route selection', async ({ page }) => {
  test.skip(process.env.NEXT_PUBLIC_BASEMAP_DISABLED !== 'true', 'Requires a disabled-basemap build');
  const requests: string[] = [];
  await page.route('https://tile.openstreetmap.org/**', async (route) => {
    requests.push(route.request().url());
    await route.abort();
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(fixture);
  await page.getByRole('slider', { name: 'Position on route' }).press('End');
  const viewMap = page.getByRole('button', { name: 'View on map' });
  if (await viewMap.isVisible()) {
    await viewMap.click();
  }
  await expect(page.getByRole('status').filter({ hasText: 'Background map is turned off' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Selected map position: 53.962, -1.078', exact: true })).toBeVisible();
  expect(requests).toEqual([]);
});
