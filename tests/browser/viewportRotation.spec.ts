import { test, expect } from './browserTest';

test('loaded view stays within the viewport across rotation with long track names', async ({ page }) => {
  const trackName = 'Long route name '.repeat(20);
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto('/tools/gpx-file-viewer');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'rotation.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx version="1.1">
      <trk><name>${trackName}</name><trkseg>
        <trkpt lat="0" lon="0"><time>2026-01-01T00:00:00Z</time></trkpt>
        <trkpt lat="0" lon="0.01"><time>2026-01-01T00:01:00Z</time></trkpt>
      </trkseg></trk>
      <wpt lat="0" lon="0"><name>Start</name></wpt>
    </gpx>`)
  });
  const position = page.getByRole('slider', { name: 'Position on route' });
  await position.press('End');
  await expect(position).toHaveValue('1');

  for (const viewport of [
    { width: 956, height: 440 },
    { width: 440, height: 956 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 375, height: 667 }
  ]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => {
      return page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });
    }).toBeLessThanOrEqual(1);
    await expect(position).toHaveValue('1');
    await expect(page.getByLabel('View', { exact: true }).locator('option:checked')).toHaveText(`Track: ${trackName.trim()}`);
  }

  const view = page.getByLabel('View', { exact: true });
  await view.selectOption({ label: 'Waypoint: Start' });
  await expect(position).toHaveCount(0);
  await view.selectOption({ index: 0 });
  await expect(position).toBeVisible();
});
