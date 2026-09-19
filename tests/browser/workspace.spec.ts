import { expect, test, blockExternalTiles } from './browserTest';

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
    const context = await browser.newContext({
      viewport,
      hasTouch: viewport.width < 600
    });
    await blockExternalTiles(context);
    const page = await context.newPage();
    await page.goto('/tools/gpx-file-viewer.html');
    await page.screenshot({ path: testInfo.outputPath('initial.png') });
    const help = page.getByText('Help with this viewer', { exact: true });
    await expect(
      page.getByRole('heading', { name: 'What you can see' })
    ).not.toBeVisible();
    await help.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'What files you can open' })
    ).toBeVisible();
    await help.press('Enter');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'workspace.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(
        `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Workspace route</name><trkseg>${points}</trkseg></trk></gpx>`
      )
    });
    await expect(
      page.getByRole('button', { name: 'Change GPX file' })
    ).toBeVisible();
    const loadedHelp = page.getByText('Help with this viewer', { exact: true });
    await loadedHelp.press('Enter');
    const helpText = page.getByText(
      'Choose Speed, Pace or Elevation under Chart. Choose kilometres or miles under Display units.',
      { exact: true }
    );
    const helpTextFontSize = await helpText.evaluate((element) => {
      return getComputedStyle(element).fontSize;
    });
    await expect(
      page.getByRole('heading', { name: 'What you can see' })
    ).toBeVisible();
    await loadedHelp.press('Enter');
    const speedExplanation = page.getByText('How speed is calculated', {
      exact: true
    });
    await speedExplanation.press('Enter');
    const speedText = page.getByText(
      'Speed comes from the distance and time between GPS readings. Small GPS errors can make it jump around, even when you move steadily.',
      { exact: true }
    );
    await expect(speedText).toBeVisible();
    expect(
      await speedText.evaluate((element) => {
        return getComputedStyle(element).fontSize;
      })
    ).toBe(helpTextFontSize);
    await speedExplanation.press('Enter');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await expect(page.getByText('Calculated distance')).toBeInViewport();
    if (viewport.width >= 1024) {
      await expect(
        page
          .getByRole('status')
          .filter({ hasText: 'Background map unavailable' })
      ).toBeVisible();
    }
    await page.screenshot({ path: testInfo.outputPath('loaded.png') });
    const totals = page.getByText('About these totals', { exact: true });
    await expect(
      page.getByText(/Based on the recorded GPS points/)
    ).not.toBeVisible();
    if (viewport.width < 600) await totals.tap();
    else await totals.press('Enter');
    await expect(
      page.getByText(/Based on the recorded GPS points/)
    ).toBeVisible();
    await totals.press('Enter');
    const chartChoice = page.getByRole('combobox', {
      name: 'Chart',
      exact: true
    });
    await page
      .getByRole('region', { name: 'Measurement chart', exact: true })
      .evaluate((element) => {
        element.scrollIntoView({ block: 'start' });
      });
    await chartChoice.selectOption('pace');
    await expect(
      page.getByRole('heading', { name: 'Pace', exact: true })
    ).toBeInViewport();
    await chartChoice.selectOption('speed');
    await page
      .getByRole('combobox', { name: 'Display units' })
      .selectOption('imperial');
    const smoothing = page.getByRole('slider', { name: 'Smoothing' });
    await smoothing.press('ArrowRight');
    await expect(smoothing).toHaveAttribute(
      'aria-valuetext',
      '1 minute 5 seconds'
    );
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
    if (viewport.width < 600)
      await page.touchscreen.tap(coordinate.x, coordinate.y);
    else await page.mouse.click(coordinate.x, coordinate.y);
    const selection = page.getByLabel('Selected measurement', { exact: true });
    await expect(selection).toBeInViewport({ ratio: 1 });
    await expect(smoothing).toBeInViewport({ ratio: 1 });
    await expect(selection).toContainText('ft');
    expect(
      await page.evaluate(() => {
        return window.scrollY;
      })
    ).toBe(scrollBefore);
    await page.screenshot({ path: testInfo.outputPath('selected.png') });
    await testInfo.attach('selection-viewport', {
      body: JSON.stringify(
        await page.evaluate(() => {
          return { width: innerWidth, height: innerHeight, scrollY };
        })
      ),
      contentType: 'application/json'
    });
    const selectedText = await selection.textContent();
    if (viewport.width < 600) {
      await page.getByRole('button', { name: 'View on map' }).tap();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('img', { name: /Selected map position/ })
      ).toBeInViewport();
      await expect(
        page.getByRole('button', { name: 'Back to chart' })
      ).toBeInViewport({ ratio: 1 });
      await page.getByText('Map privacy', { exact: true }).tap();
      await expect(
        page.getByRole('button', { name: 'Back to chart' })
      ).toBeInViewport({ ratio: 1 });
      await page.getByText('Map privacy', { exact: true }).tap();
      await page.screenshot({ path: testInfo.outputPath('map.png') });
      await page.getByRole('button', { name: 'Back to chart' }).tap();
      await expect(
        page.getByRole('button', { name: 'View on map' })
      ).toBeFocused();
      await expect(selection).toHaveText(selectedText ?? '');
    } else {
      await expect(
        page.getByRole('img', { name: /Selected map position/ })
      ).toBeInViewport();
    }
    await chartChoice.selectOption('elevation');
    await expect(
      page.getByRole('heading', { name: 'Elevation profile' })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', { name: 'Speed', exact: true })
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      })
    ).toBe(true);
    await page.getByText('File details', { exact: true }).click();
    await page.getByRole('button', { name: 'Reset view', exact: true }).click();
    await expect(chartChoice).toHaveValue('speed');
    await expect(
      page.getByRole('combobox', { name: 'Display units' })
    ).toHaveValue('metric');
    await expect(smoothing).toHaveAttribute('aria-valuetext', '1 minute');
    await expect(selection).toHaveCount(0);
    await expect(page.locator('.elevation-background')).toHaveCount(0);
    await expect(page.getByLabel('Chart selection tip')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'File details', exact: true })
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Start of route' })
    ).toHaveCount(0);
    await page.getByLabel('Chart selection tip').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('reset.png') });
    // Long metadata, missing measurements and enlarged text must not crowd out the workspace.
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: `${'Long recording name '.repeat(8)}.gpx`,
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(
        `<gpx version="1.1" creator="Test exporter" xmlns="http://www.topografix.com/GPX/1/1"><metadata><desc>${'File notes '.repeat(80)}</desc></metadata><trk><name>${'Route name '.repeat(30)}</name><desc>${'Route notes '.repeat(80)}</desc><trkseg><trkpt lat="0" lon="0"><ele>10</ele></trkpt><trkpt lat="0" lon="0.01"/></trkseg></trk></gpx>`
      )
    });
    await expect(
      page.getByText('Elapsed time needs valid start and finish times.')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Elevation profile' })
    ).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '24px';
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: testInfo.outputPath('large-text-loaded.png')
    });
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      })
    ).toBe(true);
    await page.getByText(/Measurement warnings \(/).click();
    await expect(
      page.getByRole('region', { name: 'Measurement warnings' })
    ).toBeVisible();
    await page.getByText('File details', { exact: true }).first().click();
    await expect(
      page.getByText('Test exporter', { exact: true })
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('large-text-details.png')
    });
    await context.close();
  });
}
