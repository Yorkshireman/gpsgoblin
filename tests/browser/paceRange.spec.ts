import { expect, test } from '@playwright/test';

const points = [0, 600, 1800, 9000, 9600].map((seconds, index) => {
  return `<trkpt lat="0" lon="${index * 0.01}"><ele>100</ele><time>${new Date(Date.UTC(2026, 0, 1, 0, 0, seconds)).toISOString()}</time></trkpt>`;
}).join('');
const recording = `<gpx version="1.1"><trk><trkseg>${points}</trkseg></trk></gpx>`;

for (const viewport of [
  { width: 1440, height: 900 }, { width: 1280, height: 720 },
  { width: 390, height: 844 }, { width: 375, height: 667 }
]) {
  test(`custom pace range clips the view and keeps overflow selectable at ${viewport.width} × ${viewport.height}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 600 });
    const page = await context.newPage();
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'pace-range.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from(recording)
    });
    await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
    const range = page.getByRole('combobox', { name: 'Pace range' });
    await expect(range).toHaveValue('automatic');
    await expect(page.getByRole('button', { name: /Above range:/ })).toHaveCount(0);
    const trace = page.locator('.recharts-line-curve');
    const automaticPath = await trace.getAttribute('d');
    await range.selectOption('custom');
    const maximum = page.getByRole('spinbutton', { name: 'Maximum (min/km)' });
    await maximum.fill('60');
    const arrow = page.getByRole('button', { name: /Above range: 107:\d{2} min\/km/ });
    await expect(arrow).toHaveCount(1);
    // Original coordinates go outside the viewport and are clipped, never flattened.
    const ys = Array.from((await trace.getAttribute('d') ?? '').matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g), match => {
      return Number(match[2]);
    });
    const top = Number(await page.locator('.measurement-selection-area').getAttribute('y'));
    expect(Math.min(...ys)).toBeLessThan(top);
    expect(await trace.evaluate(element => Boolean(element.closest('[clip-path]')))).toBe(true);
    await page.getByRole('region', { name: 'Measurement chart', exact: true }).evaluate(element => {
      element.scrollIntoView({ block: 'start' });
    });
    if (viewport.width < 600) await arrow.tap();
    else await arrow.click();
    const selected = page.getByLabel('Selected measurement', { exact: true });
    await expect(selected).toContainText(/107:\d{2} min\/km/);
    await expect(selected).toContainText('Above visible maximum');
    await expect(page.locator('.recharts-tooltip-wrapper')).not.toBeVisible();
    await expect(selected).toBeInViewport({ ratio: 1 });
    await expect(arrow).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath('custom-pace.png') });
    await arrow.focus();
    await arrow.press('Enter');
    await expect(selected).toContainText('Above visible maximum');
    await page.getByRole('slider', { name: 'Position on route' }).press('Home');
    await arrow.press('Space');
    await expect(selected).toContainText(/107:\d{2} min\/km/);
    await maximum.fill('15');
    const position = page.getByRole('slider', { name: 'Position on route' });
    await position.press('Home');
    await position.press('ArrowRight');
    await position.press('ArrowRight');
    await expect(selected).toContainText(/17:\d{2} min\/km/);
    await expect(page.getByRole('button', { name: /Above range:/ })).toHaveCount(2);
    await maximum.fill('60');
    await expect(selected).not.toContainText('Above visible maximum');
    await arrow.click();
    await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
    const imperialMaximum = page.getByRole('spinbutton', { name: 'Maximum (min/mi)' });
    expect(Number(await imperialMaximum.inputValue())).toBeCloseTo(96.56064, 4);
    await expect(selected).toContainText(/173:\d{2} min\/mi/);
    await imperialMaximum.fill('0');
    await expect(page.getByText('Enter a number greater than zero. Showing the automatic range.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Above range:/ })).toHaveCount(0);
    await imperialMaximum.fill('100');
    await expect(page.getByRole('button', { name: /Above range:/ })).toHaveCount(1);
    await page.getByRole('combobox', { name: 'Display units' }).selectOption('metric');
    await range.selectOption('automatic');
    await expect(page.getByRole('button', { name: /Above range:/ })).toHaveCount(0);
    await expect(selected).not.toContainText('Above visible maximum');
    await expect(trace).toHaveAttribute('d', automaticPath ?? '');
    await expect(page.getByRole('slider', { name: 'Position on route' })).toHaveAttribute('max', '4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}
