import {
  advancedControls,
  blockExternalTiles,
  expect,
  test
} from './browserTest';

const points = [0, 600, 1800, 9000, 9600]
  .map((seconds, index) => {
    return `<trkpt lat="0" lon="${index * 0.01}"><ele>100</ele><time>${new Date(Date.UTC(2026, 0, 1, 0, 0, seconds)).toISOString()}</time></trkpt>`;
  })
  .join('');
const recording = `<gpx version="1.1"><trk><trkseg>${points}</trkseg></trk></gpx>`;

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`custom pace range clips the view and keeps overflow selectable at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await browser.newContext({
      viewport,
      hasTouch: viewport.width < 600
    });
    await blockExternalTiles(context);
    const page = await context.newPage();
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'pace-range.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(recording)
    });
    await page
      .getByRole('combobox', { name: 'Chart', exact: true })
      .selectOption('pace');
    const range = page.getByRole('combobox', { name: 'Pace range' });
    await expect(
      page.getByRole('button', { name: 'Show full range' })
    ).toBeVisible();
    const suggestedLabel = await page
      .getByText(/Suggested range ·/)
      .textContent();
    await page.getByRole('button', { name: 'Show full range' }).click();
    await advancedControls(page).click();
    await expect(range).toHaveValue('full');
    await expect(
      page.getByRole('button', { name: /Above range:/ })
    ).toHaveCount(0);
    const trace = page.locator('.recharts-line-curve');
    const automaticPath = await trace.getAttribute('d');
    await range.selectOption('custom');
    const maximum = page.getByRole('spinbutton', { name: 'Maximum (min/km)' });
    await expect(page.getByText(/Custom range ·/)).toHaveText(
      (suggestedLabel ?? '').replace('Suggested range', 'Custom range')
    );
    expect(Number(await maximum.inputValue())).toBeGreaterThan(0);
    await maximum.fill('60');
    const arrow = page.getByRole('button', {
      name: /Above range: 107:\d{2} min\/km/
    });
    await expect(arrow).toHaveCount(1);
    // Original coordinates go outside the viewport and are clipped, never flattened.
    const ys = Array.from(
      ((await trace.getAttribute('d')) ?? '').matchAll(
        /[ML](-?[\d.]+),(-?[\d.]+)/g
      ),
      (match) => {
        return Number(match[2]);
      }
    );
    const top = Number(
      await page.locator('.measurement-selection-area').getAttribute('y')
    );
    expect(Math.min(...ys)).toBeLessThan(top);
    expect(
      await trace.evaluate((element) => Boolean(element.closest('[clip-path]')))
    ).toBe(true);
    // Finish configuring before inspecting: expanded options use normal page
    // scrolling and need not fit alongside the graph on a short phone.
    await advancedControls(page).click();
    await page
      .getByRole('region', { name: 'Measurement chart', exact: true })
      .evaluate((element) => {
        element.scrollIntoView({ block: 'start' });
      });
    if (viewport.width < 600) await arrow.tap();
    else await arrow.click();
    const selected = page.getByLabel('Selected measurement', { exact: true });
    await expect(selected).toContainText(/107:\d{2} min\/km/);
    await expect(selected).toContainText('Above the chart limit');
    await expect(page.locator('.recharts-tooltip-wrapper')).not.toBeVisible();
    await expect(selected).toBeInViewport({ ratio: 1 });
    await expect(arrow).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath('custom-pace.png') });
    await arrow.focus();
    await arrow.press('Enter');
    await expect(selected).toContainText('Above the chart limit');
    await page.getByRole('slider', { name: 'Position on route' }).press('Home');
    await arrow.press('Space');
    await expect(selected).toContainText(/107:\d{2} min\/km/);
    await advancedControls(page).click();
    await maximum.fill('15');
    const position = page.getByRole('slider', { name: 'Position on route' });
    await position.press('Home');
    await position.press('ArrowRight');
    await position.press('ArrowRight');
    await expect(selected).toContainText(/17:\d{2} min\/km/);
    await expect(
      page.getByRole('button', { name: /Above range:/ })
    ).toHaveCount(2);
    await maximum.fill('60');
    await expect(selected).not.toContainText('Above the chart limit');
    await arrow.click();
    await page
      .getByRole('combobox', { name: 'Display units' })
      .selectOption('imperial');
    const imperialMaximum = page.getByRole('spinbutton', {
      name: 'Maximum (min/mi)'
    });
    expect(Number(await imperialMaximum.inputValue())).toBeCloseTo(96.56064, 4);
    await expect(selected).toContainText(/173:\d{2} min\/mi/);
    await imperialMaximum.fill('0');
    await expect(
      page.getByText(
        'Enter a number greater than zero. Showing the full range.'
      )
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Above range:/ })
    ).toHaveCount(0);
    await imperialMaximum.fill('100');
    await expect(
      page.getByRole('button', { name: /Above range:/ })
    ).toHaveCount(1);
    await page
      .getByRole('combobox', { name: 'Display units' })
      .selectOption('metric');
    await range.selectOption('full');
    await expect(
      page.getByRole('button', { name: /Above range:/ })
    ).toHaveCount(0);
    await expect(selected).not.toContainText('Above the chart limit');
    await expect(trace).toHaveAttribute('d', automaticPath ?? '');
    await expect(
      page.getByRole('slider', { name: 'Position on route' })
    ).toHaveAttribute('max', '4');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    await context.close();
  });
}
