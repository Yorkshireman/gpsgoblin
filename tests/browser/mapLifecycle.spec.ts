import { expect, test } from '@playwright/test';

test('phone maps mount only when requested and adapt to desktop without losing selection', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'map-lifecycle.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx version="1.1"><trk><trkseg>
      <trkpt lat="0" lon="0"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt>
      <trkpt lat="0" lon="0.01"><ele>20</ele><time>2026-01-01T00:01:00Z</time></trkpt>
      <trkpt lat="0" lon="0.02"><ele>30</ele><time>2026-01-01T00:02:00Z</time></trkpt>
      </trkseg></trk></gpx>`)
  });
  await page.getByRole('slider', { name: 'Position on route' }).press('End');
  const selected = page.getByLabel('Selected measurement', { exact: true });
  await expect(selected).toContainText('00:02:00 UTC');
  const selectedText = await selected.textContent();
  const canvases = page.locator('canvas.maplibregl-canvas');
  const maps = page.locator('.maplibregl-map');
  await expect(canvases).toHaveCount(0);
  await expect(maps).toHaveCount(0);

  const viewMap = page.getByRole('button', { name: 'View on map' });
  const marker = page.getByRole('img', { name: 'Selected map position: 0, 0.02', exact: true });
  await viewMap.tap();
  await expect(marker).toBeVisible();
  await expect(canvases).toHaveCount(1);
  await expect(maps).toHaveCount(1);
  // An open phone dialog also gives way to the single desktop map on resize.
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(marker).toBeVisible();
  await expect(canvases).toHaveCount(1);
  await expect(maps).toHaveCount(1);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(canvases).toHaveCount(0);
  await expect(maps).toHaveCount(0);
  await expect(selected).toHaveText(selectedText ?? '');
  await viewMap.tap();
  await expect(marker).toBeVisible();
  await expect(canvases).toHaveCount(1);
  await page.getByRole('button', { name: 'Back to chart' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(canvases).toHaveCount(0);
  await expect(maps).toHaveCount(0);
  await expect(viewMap).toBeFocused();
  await expect(selected).toHaveText(selectedText ?? '');

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(marker).toBeVisible();
  await expect(canvases).toHaveCount(1);
  await expect(maps).toHaveCount(1);
  await expect(selected).toHaveText(selectedText ?? '');
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(canvases).toHaveCount(0);
  await expect(maps).toHaveCount(0);
  await viewMap.tap();
  await expect(marker).toBeVisible();
  await expect(canvases).toHaveCount(1);
  await expect(maps).toHaveCount(1);
  await page.getByRole('button', { name: 'Back to chart' }).tap();
  await expect(canvases).toHaveCount(0);
  await expect(viewMap).toBeFocused();
  await expect(selected).toHaveText(selectedText ?? '');
  await context.close();
});
