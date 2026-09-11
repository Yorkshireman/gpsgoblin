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
  const elevation = page.getByRole('heading', { name: 'Elevation profile' }).locator('..');
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
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(filename);
  const elevation = page.getByRole('heading', { name: 'Elevation profile' }).locator('..');
  await expect(elevation.locator('.recharts-line-curve')).toBeVisible();
  expect(await elevation.locator('circle').count()).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'Speed', exact: true })).toBeVisible();
  await elevation.scrollIntoViewIfNeeded();
  await elevation.screenshot({
    path: testInfo.outputPath('local-elevation.png')
  });
  const speed = page.getByRole('heading', { name: 'Speed', exact: true }).locator('..');
  const averageLine = speed.locator('.recharts-reference-line-line');
  await expect(averageLine).toBeAttached();
  expect(Number(await averageLine.getAttribute('x2'))).toBeGreaterThan(
    Number(await averageLine.getAttribute('x1'))
  );
  expect(await averageLine.getAttribute('y1')).toBe(await averageLine.getAttribute('y2'));
  const averageLabel = await speed.getByText(/Average speed:/).textContent();
  await speed.screenshot({ path: testInfo.outputPath('local-speed.png') });
  await expect(speed.locator('.speed-trend .recharts-line-curve')).toBeVisible();
  await expect(speed.getByText('Speed trend · 5-minute average')).toBeVisible();
  const smoothedPath = await speed
    .locator('.recharts-line:not(.speed-trend) .recharts-line-curve')
    .getAttribute('d');
  const smoothing = page.getByRole('slider', { name: 'Smoothing' });
  await expect(smoothing).toHaveValue('30');
  await smoothing.focus();
  await smoothing.press('Home');
  await expect(speed.getByText('Unsmoothed', { exact: true })).toBeVisible();
  await expect(
    speed.locator('.recharts-line:not(.speed-trend) .recharts-line-curve')
  ).not.toHaveAttribute('d', smoothedPath ?? '');
  await smoothing.press('End');
  await expect(smoothing).toHaveValue('120');
  await expect(speed.getByText(/Average speed:/)).toHaveText(averageLabel ?? '');
  await expect(page.getByText('120 seconds', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Speed or pace' }).selectOption('pace');
  const pace = page.getByRole('heading', { name: 'Pace', exact: true }).locator('..');
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
  await expect(page.getByRole('button', { name: 'Show full pace range' })).toBeVisible();
  await expect(pace.locator('.recharts-yAxis-tick-labels')).toContainText('30:00');
  await page.getByRole('button', { name: 'Show full pace range' }).click();
  await expect(pace.locator('.recharts-yAxis-tick-labels')).toContainText('h');
  await page.getByRole('button', { name: 'Show normal pace range' }).click();
  const area = elevation.locator('.measurement-selection-area');
  const bounds = await area.boundingBox();
  if (!bounds) {
    throw new Error('Chart selection area missing');
  }
  await area.click({ position: { x: bounds.width / 2, y: bounds.height / 2 } });
  await expect(page.getByRole('region', { name: 'Selected measurement' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Selected map position/ })).toBeVisible();
  await expect(page.getByText(/We calculate speed from the distance/)).not.toBeVisible();
  await page.getByText('How speed is calculated', { exact: true }).click();
  await expect(page.getByText(/We calculate speed from the distance/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('pace keeps near-stop outliers inspectable without flattening the default scale', async ({
  page
}) => {
  const points = [0, 0.000000001, 0.0001, 0.0002]
    .map((longitude, index) => {
      return `<trkpt lat="0" lon="${longitude}"><time>2026-09-11T12:00:${String(index * 10).padStart(2, '0')}Z</time></trkpt>`;
    })
    .join('');
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'near-stop.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(
      `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>${points}</trkseg></trk></gpx>`
    )
  });
  await page.getByRole('combobox', { name: 'Speed or pace' }).selectOption('pace');
  const pace = page.getByRole('heading', { name: 'Pace', exact: true }).locator('..');
  await expect(pace.locator('.recharts-yAxis-tick-labels')).toContainText('30:00');
  await expect(page.getByText(/Paces slower than 30:00/)).toBeVisible();
  const position = page.getByRole('slider', { name: 'Position on route' });
  await position.focus();
  await position.press('ArrowRight');
  await expect(page.getByRole('region', { name: 'Selected measurement' })).toContainText(
    /\d+h \d+m \/km/
  );
  await page.getByRole('button', { name: 'Show full pace range' }).click();
  await expect(pace.locator('.recharts-yAxis-tick-labels')).toContainText('h');
  await page.getByRole('button', { name: 'Show normal pace range' }).click();
  await expect(pace.locator('.recharts-yAxis-tick-labels')).toContainText('30:00');
});
