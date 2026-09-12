import { expect, test } from '@playwright/test';

// A dense recording with two segments, sharp extrema, a stop and missing elevation.
const points = Array.from({ length: 50000 }, (_, index) => {
  const longitude = (index < 9000 ? index : index <= 9100 ? 8999 : index - 101) * 0.00001;
  const elevation = index === 3457 ? 900 : index === 4567 ? -50 : 100;
  const missing = (index >= 6000 && index < 6500) || (index >= 12500 && index < 12600 && index !== 12553);
  const time = new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString();
  return `${index === 25000 ? '</trkseg><trkseg>' : ''}<trkpt lat="0" lon="${longitude.toFixed(5)}">${missing ? '' : `<ele>${elevation}</ele>`}<time>${time}</time></trkpt>`;
}).join('');
const recording = `<gpx version="1.1"><trk><trkseg>${points}</trkseg></trk></gpx>`;

// Count the vertices actually drawn, without relying on the sampler's internals.
const vertices = (path: string) => {
  return Array.from(path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g), match => {
    return { x: Number(match[1]), y: Number(match[2]) };
  });
};

test('chart detail adapts to width while every original measurement stays selectable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({ name: 'large-chart.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from(recording) });
  await expect(page.locator('.recharts-line-curve')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('large-loaded-desktop.png') });
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('elevation');
  const trace = page.locator('.recharts-line-curve');
  await expect(trace).toBeVisible();
  const widePath = await trace.getAttribute('d') ?? '';
  expect(vertices(widePath).length).toBeLessThan(12500);
  expect(widePath.match(/M/g)).toHaveLength(5);
  const position = page.getByRole('slider', { name: 'Position on route' });
  await expect(position).toHaveAttribute('max', '49999');
  await position.press('Home');
  await position.press('ArrowRight');
  await position.press('ArrowRight');
  const selected = page.getByLabel('Selected measurement', { exact: true });
  await expect(selected).toContainText('00:00:02 UTC');
  await expect(selected).toContainText('100.0 m');
  const marker = page.locator('.recharts-reference-dot circle').last();
  await expect(marker).toBeVisible();
  const selectedX = Number(await marker.getAttribute('cx'));
  expect(vertices(widePath).some(point => Math.abs(point.x - selectedX) < 0.0001)).toBe(false);
  await expect(trace).toHaveAttribute('d', widePath);
  await expect(page.getByRole('img', { name: 'Selected map position: 0, 0.00002', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('large-selected-desktop.png') });
  await page.setViewportSize({ width: 375, height: 667 });
  await expect.poll(async () => vertices(await trace.getAttribute('d') ?? '').length).toBeLessThan(vertices(widePath).length);
  const narrowPath = await trace.getAttribute('d') ?? '';
  expect(narrowPath.match(/M/g)).toHaveLength(5);
  await expect(selected).toContainText('00:00:02 UTC');
  await expect(position).toHaveAttribute('max', '49999');
  await position.press('End');
  await expect(selected).toContainText('13:53:19 UTC');
  await page.getByRole('button', { name: 'View on map' }).click();
  await expect(page.getByRole('img', { name: 'Selected map position: 0, 0.49898', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to chart' }).click();
  await expect(page.locator('[data-scope="dialog"][data-part="backdrop"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View on map' })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('large-selected-phone.png') });
});

test('a dense chart preserves sharp extrema, isolated readings and stop transitions for touch selection', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({ name: 'large-boundaries.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from(recording) });
  const chart = page.getByRole('combobox', { name: 'Chart', exact: true });
  await chart.selectOption('elevation');
  const trace = page.locator('.recharts-line-curve');
  await expect(trace).toBeVisible();
  await expect(page.locator('.recharts-reference-dot circle')).toHaveCount(1);
  const tapVertex = async (highest: boolean) => {
    await trace.scrollIntoViewIfNeeded();
    const path = vertices(await trace.getAttribute('d') ?? '');
    const vertex = path.reduce((best, point) => {
      return (highest ? point.y < best.y : point.y > best.y) ? point : best;
    });
    const screen = await trace.evaluate((element, point) => {
      if (!(element instanceof SVGPathElement)) throw new Error('Missing chart trace');
      const matrix = element.getScreenCTM();
      if (!matrix) throw new Error('Missing chart coordinates');
      const transformed = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return { x: transformed.x, y: transformed.y };
    }, vertex);
    await page.touchscreen.tap(screen.x, screen.y);
    return;
  };
  await tapVertex(true);
  const selected = page.getByLabel('Selected measurement', { exact: true });
  await expect(selected).toContainText('900.0 m');
  await expect(selected).toContainText('00:57:37 UTC');
  await tapVertex(false);
  await expect(selected).toContainText('-50.0 m');
  await expect(selected).toContainText('01:16:07 UTC');
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
  await expect(selected).toContainText('-164.0 ft');
  await expect(selected).toContainText('01:16:07 UTC');
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('metric');
  await chart.selectOption('speed');
  const smoothing = page.getByRole('slider', { name: 'Smoothing' });
  await smoothing.press('Home');
  await tapVertex(false);
  await expect(selected).toContainText('0 km/h');
  await expect(selected).toContainText('02:30:00 UTC');
  await smoothing.press('End');
  await expect(selected).toContainText('02:30:00 UTC');
  await chart.selectOption('pace');
  await smoothing.press('Home');
  await expect(selected).toContainText('Unavailable');
  await chart.selectOption('elevation');
  await page.getByRole('button', { name: 'View on map' }).tap();
  await expect(page.getByRole('img', { name: 'Selected map position: 0, 0.08999', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to chart' }).tap();
  await expect(page.locator('[data-scope="dialog"][data-part="backdrop"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View on map' })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('large-stop-phone.png') });
  await context.close();
});

test('separate fragments retain their own peaks even inside the same screen pixel', async ({ page }) => {
  const point = (longitude: number, elevation?: number) => {
    return `<trkpt lat="0" lon="${longitude}">${elevation === undefined ? '' : `<ele>${elevation}</ele>`}</trkpt>`;
  };
  const tail = Array.from({ length: 5000 }, (_, index) => {
    return point(1.0000005 + index * 0.001, 0);
  }).join('');
  const xml = `<gpx version="1.1"><trk><trkseg>${point(0, 0)}${point(0.0000001, 100)}${point(0.0000002, 0)}</trkseg><trkseg>${point(1, 0)}${point(1.0000001, 200)}${point(1.0000002, 0)}${point(1.0000003)}${point(1.0000004, 0)}${point(1.00000045, 50)}${tail}</trkseg></trk></gpx>`;
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({ name: 'compressed-fragments.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from(xml) });
  const trace = page.locator('.recharts-line-curve');
  await expect(trace).toBeVisible();
  const paths = (await trace.getAttribute('d') ?? '').split('M').slice(1);
  expect(paths).toHaveLength(3);
  const heights = paths.map(path => {
    const points = vertices(`M${path}`);
    return Math.max(...points.map(point => point.y)) - Math.min(...points.map(point => point.y));
  });
  expect(heights[0]).toBeGreaterThan(10);
  expect(heights[0]).toBeCloseTo(heights[1] / 2, 1);
  expect(heights[2]).toBeCloseTo(heights[1] / 4, 1);
});
