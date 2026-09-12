import { expect, test } from '@playwright/test';

// Synthetic one-second recording with a hill, speed jitter and a missing-elevation gap.
const recording = Array.from({ length: 2400 }, (_, index) => {
  const elevation = 220 + 450 * Math.sin((Math.PI * index) / 2400);
  const longitude = index * 0.000025 + (index % 2 ? 0.00001 : 0);
  const time = new Date(Date.UTC(2026, 8, 11, 12, 0, index)).toISOString();
  return `<trkpt lat="53" lon="${longitude}">${index >= 1200 && index < 1250 ? '' : `<ele>${elevation}</ele>`}<time>${time}</time></trkpt>`;
}).join('');

test('dense recordings keep elevation visible without a dot on every measurement', async ({
  page
}, testInfo) => {
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'dense.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(
      `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>${recording}</trkseg></trk></gpx>`
    )
  });
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('elevation');
  const elevation = page.getByRole('heading', { name: 'Elevation profile' }).locator('../..');
  await expect(elevation.locator('.recharts-line-curve')).toBeVisible();
  await elevation.scrollIntoViewIfNeeded();
  await elevation.screenshot({
    path: testInfo.outputPath('dense-elevation.png')
  });
  await page.screenshot({
    path: testInfo.outputPath('dense-viewer.png'),
    fullPage: true
  });
  expect(await elevation.locator('circle').count()).toBeLessThanOrEqual(1);
  expect(
    (await elevation.locator('.recharts-line-curve').getAttribute('d'))?.match(/M/g)
  ).toHaveLength(2);
});

test('optional local recording verification', async ({ page }, testInfo) => {
  const filename = process.env.GPX_VERIFY_FILE;
  if (!filename) {
    test.skip(
      true,
      'Set GPX_VERIFY_FILE to inspect a local recording without adding it to the repository.'
    );
    return;
  }
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(filename);
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('elevation');
  const elevation = page.getByRole('heading', { name: 'Elevation profile' }).locator('../..');
  await expect(elevation.locator('.recharts-line-curve')).toBeVisible();
  expect(await elevation.locator('circle').count()).toBeLessThanOrEqual(1);

  await elevation.scrollIntoViewIfNeeded();
  await elevation.screenshot({
    path: testInfo.outputPath('local-elevation.png')
  });
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('speed');
  const speed = page.getByRole('heading', { name: 'Speed', exact: true }).locator('../..');
  const elevationToggle = speed.getByRole('checkbox', { name: 'Show elevation' });
  await expect(elevationToggle).not.toBeChecked();
  await expect(speed.locator('.elevation-background')).toHaveCount(0);
  await speed.getByText('Show elevation', { exact: true }).click();
  await expect(elevationToggle).toBeChecked();
  await expect(speed.locator('.elevation-background .recharts-area-area')).toBeVisible();
  await speed.screenshot({ path: testInfo.outputPath('local-speed-with-elevation.png') });
  await elevationToggle.focus();
  await elevationToggle.press('Space');
  await expect(elevationToggle).not.toBeChecked();
  await expect(speed.locator('.elevation-background')).toHaveCount(0);
  const averageLine = speed.locator('.recharts-reference-line-line');
  await expect(averageLine).toBeAttached();
  expect(Number(await averageLine.getAttribute('x2'))).toBeGreaterThan(
    Number(await averageLine.getAttribute('x1'))
  );
  expect(await averageLine.getAttribute('y1')).toBe(await averageLine.getAttribute('y2'));
  const averageLabel = await speed.getByText(/Average speed:/).textContent();
  await speed.screenshot({ path: testInfo.outputPath('local-speed.png') });
  await expect(speed.locator('.recharts-line-curve')).toHaveCount(1);
  const smoothedPath = await speed.locator('.recharts-line-curve').getAttribute('d');
  const smoothing = page.getByRole('slider', { name: 'Smoothing' });
  await expect(smoothing).toHaveAttribute('aria-valuetext', '1 minute');
  await smoothing.press('ArrowRight');
  await expect(smoothing).toHaveAttribute('aria-valuetext', '1 minute 5 seconds');
  await smoothing.focus();
  await smoothing.press('Home');
  await expect(smoothing).toHaveAttribute('aria-valuetext', '0 seconds (unsmoothed)');
  await expect(speed.locator('.recharts-line-curve')).not.toHaveAttribute('d', smoothedPath ?? '');
  await smoothing.press('End');
  await expect(smoothing).toHaveAttribute('aria-valuetext', '10 minutes');
  await expect(speed.getByText(/Average speed:/)).toHaveText(averageLabel ?? '');
  await expect(page.getByText('10 minutes', { exact: true })).toBeVisible();
  await speed
    .locator('..')
    .screenshot({ path: testInfo.outputPath('local-speed-ten-minutes.png') });
  await smoothing.press('ArrowLeft');
  await expect(smoothing).toHaveAttribute('aria-valuetext', '9 minutes 30 seconds');
  await smoothing.press('End');
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
  const pace = page.getByRole('heading', { name: 'Pace', exact: true }).locator('../..');
  await expect(pace.locator('.recharts-yAxis-tick-labels')).toContainText('0:00');
  await pace.screenshot({ path: testInfo.outputPath('local-pace.png') });
  const unitBounds = await pace.getByText('min/km', { exact: true }).boundingBox();
  const axisBounds = await pace.locator('.recharts-yAxis-tick-labels').boundingBox();
  const chartBounds = await pace.boundingBox();
  const sliderBounds = await smoothing.boundingBox();
  expect(unitBounds && axisBounds && unitBounds.y + unitBounds.height <= axisBounds.y).toBe(true);
  expect(chartBounds && sliderBounds && sliderBounds.y >= chartBounds.y + chartBounds.height).toBe(
    true
  );
  await smoothing.press('Home');
  await expect(page.getByRole('button', { name: /pace range/ })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('elevation');
  const area = elevation.locator('.measurement-selection-area');
  const bounds = await area.boundingBox();
  if (!bounds) {
    throw new Error('Chart selection area missing');
  }
  await area.click({ position: { x: bounds.width / 2, y: bounds.height / 2 } });
  await expect(page.getByLabel('Selected measurement', { exact: true })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'View on map' }).click();
  await expect(page.getByRole('img', { name: /Selected map position/ })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'Back to chart' }).click();
  await expect(page.getByText(/We calculate speed from the distance/)).not.toBeVisible();
  await page.getByText('How speed is calculated', { exact: true }).click();
  await expect(page.getByText(/We calculate speed from the distance/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('pace plots actual values above 30 with explicit minutes per distance', async ({ page }, testInfo) => {
  const times = [0, 3600, 10800, 11160];
  const points = times.map((seconds, index) => {
    return `<trkpt lat="0" lon="${index * 0.01}"><time>${new Date(Date.UTC(2026, 0, 1, 0, 0, seconds)).toISOString()}</time></trkpt>`;
  }).join('');
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'slow-pace.gpx', mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx version="1.1"><trk><trkseg>${points}</trkseg></trk></gpx>`)
  });
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
  await expect(page.getByRole('button', { name: /pace range/ })).toHaveCount(0);
  await expect(page.getByText(/Paces slower than/)).toHaveCount(0);
  const smoothing = page.getByRole('slider', { name: 'Smoothing' });
  await smoothing.press('Home');
  const trace = page.locator('.recharts-line-curve');
  const path = await trace.getAttribute('d') ?? '';
  const vertices = Array.from(path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g), match => {
    return { x: Number(match[1]), y: Number(match[2]) };
  });
  expect(vertices).toHaveLength(3);
  const area = page.locator('.measurement-selection-area');
  const top = Number(await area.getAttribute('y'));
  const bottom = top + Number(await area.getAttribute('height'));
  // The 108-minute peak is twice the 54-minute peak, not flattened to one ceiling.
  expect(vertices[1].y - top).toBeCloseTo(3, 1);
  expect((bottom - vertices[0].y) / (bottom - vertices[1].y)).toBeCloseTo(0.5, 2);
  const position = page.getByRole('slider', { name: 'Position on route' });
  await position.press('Home');
  await position.press('ArrowRight');
  const selected = page.getByLabel('Selected measurement', { exact: true });
  await expect(selected).toContainText(/53:\d{2} min\/km/);
  await position.press('ArrowRight');
  await expect(selected).toContainText(/107:\d{2} min\/km/);
  const marker = page.locator('.recharts-reference-dot circle');
  expect(Number(await marker.getAttribute('cy'))).toBeCloseTo(vertices[1].y, 2);
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
  await expect(selected).toContainText(/173:\d{2} min\/mi/);
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('metric');
  await smoothing.press('End');
  await expect(selected).toContainText(/107:\d{2} min\/km/);
  await page.getByRole('region', { name: 'Measurement chart', exact: true }).evaluate(element => {
    element.scrollIntoView({ block: 'start' });
  });
  await page.screenshot({ path: testInfo.outputPath('uncapped-pace.png') });
});
