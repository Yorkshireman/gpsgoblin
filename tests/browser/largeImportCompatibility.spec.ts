import { expect, test } from '@playwright/test';

// These synthetic workloads exercise intended use cases, not product limits.
const recording = (pointCount: number, segmentLength = pointCount, extensions = false) => {
  const points = Array.from({ length: pointCount }, (_, index) => {
    const startsSegment = index > 0 && index % segmentLength === 0;
    const missing = segmentLength !== pointCount && index % segmentLength === 10;
    const time = new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString();
    const extension = extensions
      ? `<extensions><x:metrics><x:note>${'synthetic extension payload '.repeat(10)}</x:note><x:speed>50000</x:speed><x:time>not a timestamp</x:time><x:ele>-9999</x:ele><x:link href="https://gpx-canary.invalid/embedded"/></x:metrics></extensions>`
      : '';
    return `${startsSegment ? '</trkseg><trkseg>' : ''}<trkpt lat="0" lon="${(index * 0.00001).toFixed(5)}">${missing ? '' : `<ele>100</ele><time>${time}</time>`}${extension}</trkpt>`;
  }).join('');
  return {
    name: `synthetic-${pointCount}-points.gpx`,
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:x="urn:gpsgoblin:uninterpreted-test-fields" version="1.1"><trk><name>Synthetic long recording</name><trkseg>${points}</trkseg></trk></gpx>`)
  };
};

test('all-day and multi-day recordings retain every sample and recover from failed replacement', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  const position = page.getByRole('slider', { name: 'Position on route' });
  for (const pointCount of [43201, 172801]) {
    await picker.setInputFiles(recording(pointCount));
    await expect(position).toHaveAttribute('max', String(pointCount - 1), { timeout: 60000 });
    await expect(page.getByText(pointCount === 43201 ? '12 h' : '48 h', { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`${pointCount}-loaded.png`) });
    await position.press('End');
    await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText(
      pointCount === 43201 ? '1 January 2026 at 12:00:00 UTC' : '3 January 2026 at 00:00:00 UTC'
    );
  }
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
  await page.getByRole('slider', { name: 'Smoothing' }).press('End');
  await expect(page.getByRole('region', { name: 'Measurement chart', exact: true })).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('14:59 min/km');
  await picker.setInputFiles({ name: 'truncated.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from('<gpx version="1.1"><trk>') });
  await expect(page.getByText('The file contains malformed XML.')).toBeVisible();
  await expect(position).toHaveAttribute('max', '172800');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('3 January 2026 at 00:00:00 UTC');
  await page.getByRole('button', { name: 'Clear file' }).click();
  await expect(page.getByText('Workspace cleared.')).toBeVisible();
  await picker.setInputFiles(recording(3));
  await expect(position).toHaveAttribute('max', '2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('extension-heavy input stays local without interpreting vendor measurements', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const outbound: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outbound.push(request.url());
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(recording(24001, 24001, true));
  const position = page.getByRole('slider', { name: 'Position on route' });
  await expect(position).toHaveAttribute('max', '24000', { timeout: 60000 });
  await position.press('End');
  const selected = page.getByLabel('Selected measurement', { exact: true });
  await expect(selected).toContainText('100.0 m');
  await expect(selected).toContainText('4 km/h');
  await expect(selected).toContainText('1 January 2026 at 06:40:00 UTC');
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
  await expect(selected).toContainText('328.1 ft');
  expect(outbound).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('extensions-selected.png') });
});

test('thousands of segments preserve chart gaps and missing measurements', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(recording(50000, 20));
  const position = page.getByRole('slider', { name: 'Position on route' });
  await expect(position).toHaveAttribute('max', '49999', { timeout: 60000 });
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('elevation');
  await expect(page.getByRole('region', { name: 'Measurement chart', exact: true })).toHaveAttribute('aria-busy', 'false');
  const trace = page.locator('.recharts-line-curve');
  // A constant-elevation SVG path has zero bounding-box height despite its visible stroke.
  await expect(trace).toHaveAttribute('d', /^M/);
  // Each of the 2,500 segments has one missing elevation reading, splitting it in two.
  expect((await trace.getAttribute('d'))?.match(/M/g)).toHaveLength(5000);
  await position.press('Home');
  for (let index = 0; index < 10; index += 1) await position.press('ArrowRight');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('Unavailable');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('Recorded time: Missing');
  await position.press('ArrowRight');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('100.0 m');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('00:00:11 UTC');
  await position.press('End');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('13:53:19 UTC');
  await page.screenshot({ path: testInfo.outputPath('fragmented-selected.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
