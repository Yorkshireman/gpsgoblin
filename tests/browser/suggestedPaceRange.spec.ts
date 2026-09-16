import { test, expect } from './browserTest';

const recording = () => {
  let longitude = 0;
  return `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>${Array.from({ length: 1200 }, (_, index) => {
    longitude += index >= 500 && index < 800 ? 0.00000009 : 0.000009;
    return `<trkpt lat="0" lon="${longitude}"><ele>10</ele><time>${new Date(Date.UTC(2026, 0, 1) + index * 1000).toISOString()}</time></trkpt>`;
  }).join('')}</trkseg></trk></gpx>`;
};

test.use({ hasTouch: true });
for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
  test(`suggested pace is inspectable at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({ name: 'synthetic-stop.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from(recording()) });
    await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
    const suggestion = page.getByText(/Suggested range ·/);
    await expect(suggestion).toContainText('29:00 min/km');
    await expect(page.getByText(/Some pace readings are above the chart limit/)).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Pace range' })).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('initial-pace.png') });
    // Bring the chart workspace into view on short screens, as a reader would.
    await page.getByLabel('Measurement chart', { exact: true }).evaluate(element => { element.scrollIntoView({ block: 'start' }); });
    const arrow = page.getByRole('button', { name: /Above range:/ }).first();
    if (viewport.width < 600) await arrow.tap(); else await arrow.click();
    const selected = page.getByLabel('Selected measurement', { exact: true });
    await expect(selected).toContainText('Above the chart limit');
    await expect(selected).toBeInViewport({ ratio: 1 });
    await expect(arrow).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath('selected-overflow.png') });
    const selectedValue = await selected.textContent();
    await page.getByRole('button', { name: 'Show full range' }).click();
    await expect(page.getByRole('button', { name: /Above range:/ })).toHaveCount(0);
    await expect(selected).not.toContainText('Above the chart limit');
    await page.getByRole('button', { name: 'Use suggested range' }).click();
    await expect(selected).toHaveText(selectedValue ?? '');
    await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
    await expect(suggestion).toContainText('46:40 min/mi');
    await page.getByRole('button', { name: /Above range:/ }).first().focus();
    await page.keyboard.press('Enter');
    await expect(selected).toContainText('Above the chart limit');
    expect(await page.evaluate(() => { return document.documentElement.scrollWidth <= innerWidth; })).toBe(true);
    await page.getByText('Advanced Controls', { exact: true }).click();
    const range = page.getByRole('combobox', { name: 'Pace range' });
    await range.selectOption('custom');
    const maximum = page.getByRole('spinbutton', { name: 'Maximum (min/mi)' });
    expect(Number(await maximum.inputValue())).toBeCloseTo(29 * 1.609344, 8);
    await expect(page.getByText(/Custom range ·/)).toContainText('46:40 min/mi');
    await page.screenshot({ path: testInfo.outputPath('prefilled-custom.png') });
    await maximum.fill('50');
    await range.selectOption('suggested');
    await range.selectOption('custom');
    await expect(maximum).toHaveValue('50');
    await maximum.fill('');
    await range.selectOption('full');
    await range.selectOption('custom');
    await expect(maximum).toHaveValue('');
  });
}

test('permissioned exports receive different suggested ranges', async ({ page }, testInfo) => {
  const files = [process.env.GPSGOBLIN_GAP_FILE, process.env.GPSGOBLIN_CONTINUOUS_FILE];
  test.skip(files.some(file => { return !file; }), 'Requires local private recordings');
  for (const [index, file] of files.entries()) {
    if (!file) return;
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles(file);
    await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
    await expect(page.getByText(/Suggested range ·/)).toContainText(index === 0 ? '54:00 min/km' : '32:00 min/km');
    await expect(page.getByText(/Some pace readings are above the chart limit/)).toBeVisible();
    if (index === 0) {
      const gaps = await page.getByRole('button', { name: /Recording gap|nearby recording gaps/ }).all();
      const arrows = await page.getByRole('button', { name: /Above range:/ }).all();
      for (const gap of gaps) {
        const gapBox = await gap.boundingBox();
        for (const arrow of arrows) {
          const arrowBox = await arrow.boundingBox();
          if (gapBox && arrowBox) expect(gapBox.y + gapBox.height).toBeLessThanOrEqual(arrowBox.y);
        }
      }
    }
    await page.screenshot({ path: testInfo.outputPath(`private-pace-${index}.png`) });
  }
});
