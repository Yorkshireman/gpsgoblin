import { expect, test } from '@playwright/test';

// Synthetic fixture: equatorial points and known one-minute intervals; no personal data.
const contents = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><name>Measurement check</name><trkseg>
    <trkpt lat="0" lon="0"><ele>0</ele><time>2026-09-11T12:00:00Z</time></trkpt>
    <trkpt lat="0" lon="0.01"><ele>100</ele><time>2026-09-11T12:01:00Z</time></trkpt>
    <trkpt lat="0" lon="0.02"><time>2026-09-11T12:02:00Z</time></trkpt>
    <trkpt lat="0" lon="0.03"><ele>200</ele><time>2026-09-11T12:03:00Z</time></trkpt>
    <trkpt lat="0" lon="0.04"><ele>150</ele><time>2026-09-11T12:04:00Z</time></trkpt>
  </trkseg><trkseg>
    <trkpt lat="0" lon="1"><ele>300</ele><time>2026-09-12T12:00:00Z</time></trkpt>
    <trkpt lat="0" lon="1.01"><ele>350</ele><time>2026-09-12T12:01:00Z</time></trkpt>
  </trkseg></trk>
  <rte><name>Untimed route</name><rtept lat="1" lon="1"/><rtept lat="1" lon="2"/></rte>
</gpx>`;

test('charts preserve gaps and select real map positions on the static viewer', async ({
  page
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'measurements.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(contents)
  });
  await expect(page.getByRole('heading', { name: 'Elevation profile' })).toBeVisible();
  const elevationLine = page.locator('.recharts-line-curve').first();
  await expect(elevationLine).toBeVisible();
  // Two measurement runs in the first segment plus the separate second segment.
  expect((await elevationLine.getAttribute('d'))?.match(/M/g)).toHaveLength(3);
  await page.locator('.recharts-line-dots').first().locator('circle').nth(1).click();
  await expect(page.getByRole('region', { name: 'Selected measurement' })).toContainText('100.0 m');
  await expect(
    page.getByRole('img', { name: 'Selected map position: 0, 0.01', exact: true })
  ).toBeVisible();
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
  await expect(page.getByRole('region', { name: 'Selected measurement' })).toContainText(
    '328.1 ft'
  );
  await page.getByRole('slider', { name: 'Inspect point' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'Selected measurement' })).toContainText(
    'Unavailable'
  );
  await expect(
    page.getByRole('img', { name: 'Selected map position: 0, 0.02', exact: true })
  ).toBeVisible();
  await page.getByRole('combobox', { name: 'Speed or pace' }).selectOption('pace');
  await expect(page.getByRole('heading', { name: 'Interval pace' })).toBeVisible();
  const paceTicks = await page
    .locator('.recharts-yAxis-tick-labels')
    .nth(1)
    .locator('.recharts-cartesian-axis-tick-value')
    .allTextContents();
  expect(paceTicks.length).toBeGreaterThan(1);
  expect(new Set(paceTicks).size).toBe(paceTicks.length);
  expect(
    await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    })
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('measurements.png'), fullPage: true });
  await page.getByRole('combobox', { name: 'Item to inspect' }).selectOption('route-0');
  await expect(page.getByRole('heading', { name: 'Elevation profile' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Interval pace' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Selected measurement' })).toHaveCount(0);
  await expect(page.getByText('No elevation measurements available.')).toBeVisible();
  expect(errors).toEqual([]);
});
