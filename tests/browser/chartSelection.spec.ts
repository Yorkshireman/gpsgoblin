import { expect, test } from '@playwright/test';

// Synthetic changing speeds ensure the trace is distinct from the overall average.
const recording = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>
<trkpt lat="0" lon="0"><ele>0</ele><time>2026-09-11T12:00:00Z</time></trkpt>
<trkpt lat="0" lon="0.001"><ele>20</ele><time>2026-09-11T12:00:10Z</time></trkpt>
<trkpt lat="0" lon="0.003"><ele>40</ele><time>2026-09-11T12:00:20Z</time></trkpt>
<trkpt lat="0" lon="0.006"><ele>60</ele><time>2026-09-11T12:00:30Z</time></trkpt>
</trkseg></trk></gpx>`;

test('clicking the drawn speed line selects its source point and map location', async ({
  page
}) => {
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'speed-selection.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(recording)
  });
  const speed = page.getByRole('heading', { name: 'Speed', exact: true }).locator('../..');
  const trace = speed.locator('.recharts-line-curve');
  await trace.scrollIntoViewIfNeeded();
  const coordinate = await trace.evaluate((element) => {
    if (!(element instanceof SVGPathElement)) {
      throw new Error('Expected a plotted line');
    }
    const start = element.getPointAtLength(20);
    const matrix = element.getScreenCTM();
    if (!matrix) {
      throw new Error('Expected chart coordinates');
    }
    const position = new DOMPoint(start.x, start.y).matrixTransform(matrix);
    return { x: position.x, y: position.y };
  });
  await page.mouse.move(coordinate.x, coordinate.y);
  await expect(speed.locator('.recharts-tooltip-wrapper')).toContainText('Speed:');
  await page.mouse.click(coordinate.x, coordinate.y);
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText(
    'At 0.1 km'
  );
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'View on map' }).click();
  await expect(
    page.getByRole('img', { name: 'Selected map position: 0, 0.001', exact: true })
  ).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'Back to chart' }).click();
});
