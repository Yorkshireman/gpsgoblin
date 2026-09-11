import { expect, test } from '@playwright/test';

// Synthetic recording; no personal file contents or coordinates.
const points = Array.from({ length: 120 }, (_, index) => {
  return `<trkpt lat="53" lon="${index * 0.001}"><ele>${100 + index}</ele><time>${new Date(Date.UTC(2026, 8, 11, 12, 0, index * 10)).toISOString()}</time></trkpt>`;
}).join('');

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`workspace keeps selection and its controls together at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 600 });
    const page = await context.newPage();
    await page.goto('/tools/gpx-file-viewer.html');
    await page.screenshot({ path: testInfo.outputPath('initial.png') });
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'workspace.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(
        `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Workspace route</name><trkseg>${points}</trkseg></trk></gpx>`
      )
    });
    await expect(page.getByRole('button', { name: 'Change GPX file' })).toBeVisible();
    await expect(page.getByText('Calculated distance')).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('loaded.png') });
    const chartChoice = page.getByRole('combobox', { name: 'Chart', exact: true });
    await page
      .getByRole('region', { name: 'Measurement chart', exact: true })
      .evaluate((element) => {
        element.scrollIntoView({ block: 'start' });
      });
    await chartChoice.selectOption('pace');
    await expect(page.getByRole('heading', { name: 'Pace', exact: true })).toBeInViewport();
    await chartChoice.selectOption('speed');
    await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
    const smoothing = page.getByRole('slider', { name: 'Smoothing' });
    await smoothing.press('ArrowRight');
    await expect(smoothing).toHaveAttribute('aria-valuetext', '1 minute 5 seconds');
    await page.getByText('Show elevation', { exact: true }).click();
    await expect(page.locator('.elevation-background')).toBeVisible();
    const line = page.locator('.recharts-line-curve');
    const coordinate = await line.evaluate((element) => {
      const path = element as SVGPathElement;
      const point = path.getPointAtLength(path.getTotalLength() / 2);
      const matrix = path.getScreenCTM();
      if (!matrix) throw new Error('Missing chart transform');
      const position = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      return { x: position.x, y: position.y };
    });
    const scrollBefore = await page.evaluate(() => {
      return window.scrollY;
    });
    if (viewport.width < 600) await page.touchscreen.tap(coordinate.x, coordinate.y);
    else await page.mouse.click(coordinate.x, coordinate.y);
    const selection = page.getByRole('region', { name: 'Selected measurement' });
    await expect(selection).toBeInViewport({ ratio: 1 });
    await expect(smoothing).toBeInViewport({ ratio: 1 });
    await expect(selection).toContainText('ft');
    expect(
      await page.evaluate(() => {
        return window.scrollY;
      })
    ).toBe(scrollBefore);
    await page.screenshot({ path: testInfo.outputPath('selected.png') });
    const selectedText = await selection.textContent();
    if (viewport.width < 600) {
      await page.getByRole('button', { name: 'View on map' }).tap();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('img', { name: /Selected map position/ })).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath('map.png') });
      await page.getByRole('button', { name: 'Back to chart' }).tap();
      await expect(page.getByRole('button', { name: 'View on map' })).toBeFocused();
      await expect(selection).toHaveText(selectedText ?? '');
    } else {
      await expect(page.getByRole('img', { name: /Selected map position/ })).toBeInViewport();
    }
    await chartChoice.selectOption('elevation');
    await expect(page.getByRole('heading', { name: 'Elevation profile' })).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Speed', exact: true })).toHaveCount(0);
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      })
    ).toBe(true);
    // Long metadata, missing measurements and enlarged text must not crowd out the workspace.
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: `${'Long recording name '.repeat(8)}.gpx`,
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(
        `<gpx version="1.1" creator="Test exporter" xmlns="http://www.topografix.com/GPX/1/1"><metadata><desc>${'File notes '.repeat(80)}</desc></metadata><trk><name>${'Route name '.repeat(30)}</name><desc>${'Route notes '.repeat(80)}</desc><trkseg><trkpt lat="0" lon="0"><ele>10</ele></trkpt><trkpt lat="0" lon="0.01"/></trkseg></trk></gpx>`
      )
    });
    await expect(page.getByRole('heading', { name: 'Elevation profile' })).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '24px';
      window.scrollTo(0, 0);
    });
    await page.screenshot({ path: testInfo.outputPath('large-text-loaded.png') });
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      })
    ).toBe(true);
    await page.getByText(/Measurement warnings \(/).click();
    await expect(page.getByRole('region', { name: 'Measurement warnings' })).toBeVisible();
    await page.getByText('File details', { exact: true }).first().click();
    await expect(page.getByText('Test exporter', { exact: true })).toBeVisible();
    await context.close();
  });
}
