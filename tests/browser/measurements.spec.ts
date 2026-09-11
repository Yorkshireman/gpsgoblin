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
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'measurements.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(contents)
  });

  await expect(page.getByText('Average speed: 66.7 km/h')).toBeVisible();
  await expect(page.getByText('Duration', { exact: true })).toBeInViewport();
  await expect(page.getByText('24 h 1 min')).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('duration.png') });
  const averageLine = page.locator('.recharts-reference-line-line');
  await expect(averageLine).toBeAttached();
  expect(Number(await averageLine.getAttribute('x2'))).toBeGreaterThan(
    Number(await averageLine.getAttribute('x1'))
  );
  expect(await averageLine.getAttribute('y1')).toBe(await averageLine.getAttribute('y2'));
  const speed = page.getByRole('heading', { name: 'Speed', exact: true }).locator('../..');
  const elevationToggle = speed.getByRole('checkbox', { name: 'Show elevation' });
  await speed.getByText('Show elevation', { exact: true }).click();
  await expect(elevationToggle).toBeChecked();
  const background = speed.locator('.recharts-area-area');
  await expect(background).toBeVisible();
  expect((await background.getAttribute('d'))?.match(/M/g)).toHaveLength(3);
  await elevationToggle.focus();
  await elevationToggle.press('Space');
  await expect(elevationToggle).not.toBeChecked();
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('elevation');
  const elevationLine = page.locator('.recharts-line-curve').first();
  await expect(elevationLine).toBeVisible();
  // Two measurement runs in the first segment plus the separate second segment.
  expect((await elevationLine.getAttribute('d'))?.match(/M/g)).toHaveLength(3);
  const selectionArea = page.locator('.measurement-selection-area').first();
  const bounds = await selectionArea.boundingBox();
  if (!bounds) {
    throw new Error('Chart selection area missing');
  }
  await selectionArea.click({ position: { x: bounds.width / 5, y: bounds.height / 2 } });
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('100.0 m');
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'View on map' }).click();
  await expect(
    page.getByRole('img', { name: 'Selected map position: 0, 0.01', exact: true })
  ).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'Back to chart' }).click();
  await elevationLine.scrollIntoViewIfNeeded();
  const pointOnLine = await elevationLine.evaluate((element) => {
    if (!(element instanceof SVGPathElement)) {
      throw new Error('Expected elevation line');
    }
    const point = element.getPointAtLength(8);
    const matrix = element.getScreenCTM();
    if (!matrix) {
      throw new Error('Missing chart transform');
    }
    const position = new DOMPoint(point.x, point.y).matrixTransform(matrix);
    return { x: position.x, y: position.y };
  });
  await page.mouse.click(pointOnLine.x, pointOnLine.y);
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('0.0 m');
  await selectionArea.click({ position: { x: bounds.width / 5, y: bounds.height / 2 } });
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText(
    '328.1 ft'
  );
  await page.getByRole('slider', { name: 'Position on route' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText(
    'Unavailable'
  );
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'View on map' }).click();
  await expect(
    page.getByRole('img', { name: 'Selected map position: 0, 0.02', exact: true })
  ).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'Back to chart' }).click();
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
  await expect(page.getByRole('heading', { name: 'Pace', exact: true })).toBeVisible();
  const paceElevationToggle = page.getByRole('checkbox', { name: 'Show elevation' });
  await page.getByText('Show elevation', { exact: true }).click();
  await expect(paceElevationToggle).toBeChecked();
  await expect(page.locator('.elevation-background')).toBeVisible();
  await expect(page.getByText('Elevation (ft)', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('pace-elevation.png') });
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('speed');
  await expect(page.getByRole('checkbox', { name: 'Show elevation' })).toBeChecked();
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
  await expect(paceElevationToggle).toBeChecked();
  await paceElevationToggle.focus();
  await paceElevationToggle.press('Space');
  await expect(paceElevationToggle).not.toBeChecked();
  await expect(page.locator('.elevation-background')).toHaveCount(0);
  const paceTicks = await page
    .locator('.recharts-yAxis-tick-labels')
    .first()
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
  await expect(page.getByText('11 September 2026 at 12:02:00 UTC')).toBeVisible();
  await page.getByText('11 September 2026 at 12:02:00 UTC').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('recorded-time.png') });
  await page.getByRole('combobox', { name: 'Item to inspect' }).selectOption('route-0');
  await expect(page.getByRole('heading', { name: 'Elevation profile' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Pace', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Chart selection tip', { exact: true })).toContainText(
    'Select a point on the chart to see its details.'
  );
  await expect(page.getByText('No elevation measurements available.')).toBeVisible();
  expect(errors).toEqual([]);
});
