import { expect, test } from './browserTest';

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
  const speed = page.getByRole('region', {
    name: 'Measurement chart',
    exact: true
  });
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
  await expect(speed.locator('.recharts-tooltip-wrapper')).toContainText(
    'Speed:'
  );
  await page.mouse.click(coordinate.x, coordinate.y);
  await expect(
    page.getByLabel('Selected measurement', { exact: true })
  ).toContainText('At 0.1 km');
  const marker = speed.locator('.recharts-reference-dot circle').last();
  await expect(marker).toBeVisible();
  expect(await marker.getAttribute('fill')).not.toBe(
    await trace.getAttribute('stroke')
  );
  await expect(marker).toHaveAttribute('stroke-width', '3');
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'View on map' }).click();
  await expect(
    page.getByRole('img', {
      name: 'Selected map position: 0, 0.001',
      exact: true
    })
  ).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole('button', { name: 'Back to chart' }).click();
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`point dismissal clears inspection at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await browser.newContext({
      viewport,
      hasTouch: viewport.width < 600
    });
    await context.route('https://tile.openstreetmap.org/**', async (route) => {
      await route.abort();
      return;
    });
    const page = await context.newPage();
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'dismiss-selection.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(recording)
    });
    const chart = page.getByRole('region', {
      name: 'Measurement chart',
      exact: true
    });
    const position = page.getByRole('slider', { name: 'Position on route' });
    await position.press('ArrowRight');
    const details = page.getByLabel('Selected measurement', { exact: true });
    await expect(details).toContainText('At 0.1 km');
    await expect(chart.locator('.recharts-reference-dot')).toHaveCount(1);
    if (viewport.width >= 1024) {
      await expect(
        page.getByRole('img', {
          name: 'Selected map position: 0, 0.001',
          exact: true
        })
      ).toBeVisible();
    }
    await chart.evaluate((element) => {
      element.scrollIntoView({ block: 'start' });
    });
    const close = details.getByRole('button', { name: 'Close point details' });
    await expect(close).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('selected.png') });
    if (viewport.width < 600) await close.tap();
    else {
      await close.focus();
      await close.press('Enter');
    }
    await expect(details).toHaveCount(0);
    await expect(chart.locator('.recharts-reference-dot')).toHaveCount(0);
    await expect(position).toHaveAttribute(
      'aria-valuetext',
      'No point selected'
    );
    await expect(chart).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath('dismissed.png') });
    if (viewport.width < 1024)
      await page.getByRole('button', { name: 'View on map' }).tap();
    await expect(
      page.getByRole('img', { name: /Selected map position:/ })
    ).toHaveCount(0);
    if (viewport.width < 1024)
      await page.getByRole('button', { name: 'Back to chart' }).tap();
    await page
      .getByRole('combobox', { name: 'Chart', exact: true })
      .selectOption('elevation');
    await position.press('ArrowRight');
    await expect(details).toContainText('At 0.1 km');
    await details.getByRole('button', { name: 'Close point details' }).click();
    await expect(details).toHaveCount(0);
    await expect(chart.locator('.recharts-reference-dot')).toHaveCount(0);
    await expect(position).toHaveAttribute(
      'aria-valuetext',
      'No point selected'
    );
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth > innerWidth;
      })
    ).toBe(false);
    await context.close();
  });
}
