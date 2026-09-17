import { test, expect } from './browserTest';

const recording = (gapCount = 3) => {
  let seconds = 0;
  const intervals = [
    0,
    ...Array(20).fill(10),
    ...Array(gapCount).fill(600),
    ...Array(20).fill(10)
  ];
  return `<gpx version="1.1" creator="Synthetic gap test" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>${intervals
    .map((duration, index) => {
      seconds += duration;
      const longitude =
        index > 20 && index < 21 + gapCount
          ? 0.002
          : index < 21 + gapCount
            ? index / 10000
            : (index - gapCount) / 10000;
      return `<trkpt lat="0" lon="${longitude}"><ele>10</ele><time>${new Date(Date.UTC(2026, 0, 1) + seconds * 1000).toISOString()}</time></trkpt>`;
    })
    .join('')}</trkseg></trk></gpx>`;
};

test.use({ hasTouch: true });
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`gap inspection ${viewport.width}x${viewport.height}`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'recording-gaps.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(recording())
    });
    const control = page.getByLabel('Inspect recording gap', { exact: true });
    await expect(control).toBeHidden();
    await expect(control.locator('option')).toHaveCount(4);
    await page.screenshot({ path: testInfo.outputPath('loaded.png') });
    const marker = page.getByRole('button', {
      name: '3 nearby recording gaps; select to see the next one'
    });
    await expect(marker).toBeVisible();
    const initialScroll = await page.evaluate(() => {
      return window.scrollY;
    });
    if (viewport.width >= 600) {
      await marker.hover();
      await expect(page.getByRole('tooltip')).toContainText(
        '3 nearby recording gaps; select to see the next one'
      );
      await page.screenshot({ path: testInfo.outputPath('gap-tooltip.png') });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toBeHidden();
    }
    if (viewport.width < 600) await marker.tap();
    else await marker.click();
    const selection = page.getByLabel('Selected measurement', { exact: true });
    await expect(selection).toContainText('No GPS readings for 10 min');
    await expect(control).toHaveValue('track-0-segment-0-sample-21');
    await expect(selection).toBeInViewport({ ratio: 1 });
    await expect(marker).toBeInViewport({ ratio: 1 });
    if (viewport.width < 600)
      expect(
        await page.evaluate(() => {
          return window.scrollY;
        })
      ).toBe(initialScroll);
    await expect(page.locator('.recharts-tooltip-wrapper')).not.toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('selected.png') });
    const clear = page.getByRole('button', {
      name: 'Close gap details',
      exact: true
    });
    if (viewport.width < 600) await clear.tap();
    else {
      await clear.focus();
      await page.keyboard.press('Enter');
    }
    await expect(selection).toHaveCount(0);
    await expect(control).toHaveValue('');
    await expect(marker).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({ path: testInfo.outputPath('cleared.png') });
    await marker.click();
    await expect(
      page.getByText('3 recording gaps', { exact: true })
    ).not.toBeVisible();
    await page.getByText('Advanced Controls', { exact: true }).click();
    await page.getByText('3 recording gaps', { exact: true }).click();
    await control.selectOption('');
    await expect(selection).toHaveCount(0);
    await marker.click();
    await marker.focus();
    await page.keyboard.press('Enter');
    await expect(control).toHaveValue('track-0-segment-0-sample-22');
    await control.selectOption({ index: 3 });
    await selection.locator('summary').click();
    await expect(selection.getByText(/We can’t tell/)).toBeVisible();
    await page
      .getByRole('combobox', { name: 'Display units' })
      .selectOption('imperial');
    await expect(selection).toContainText('ft apart');
    await page
      .getByRole('combobox', { name: 'Chart', exact: true })
      .selectOption('pace');
    await expect(selection).toContainText('No GPS readings for 10 min');
    const paceTip = page.getByText('Why does pace sometimes spike?', {
      exact: true
    });
    await paceTip.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByText('A higher number means a slower pace.', { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText('Pace is the time it takes to cover one mile.', {
        exact: false
      })
    ).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('pace-tip.png') });
    await page.keyboard.press('Enter');
    await expect(
      page.getByText('A higher number means a slower pace.', { exact: false })
    ).toBeHidden();
    const smoothing = page.getByRole('slider', { name: 'Smoothing' });
    await smoothing.focus();
    await page.keyboard.press('Home');
    await expect(
      page.getByLabel('Measurement chart', { exact: true })
    ).toHaveAttribute('aria-busy', 'false');
    await expect(selection).toContainText('No GPS readings for 10 min');
    if (viewport.width < 600) {
      await page.getByRole('button', { name: 'View on map' }).tap();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Back to chart' }).tap();
      await expect(selection).toContainText('No GPS readings for 10 min');
    }
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth <= innerWidth;
      })
    ).toBe(true);
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'single-gap.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(recording(1))
    });
    const singleMarker = page.getByRole('button', {
      name: 'Recording gap 1',
      exact: true
    });
    await singleMarker.click();
    await expect(selection).toContainText(
      'We can’t tell how you moved during this gap'
    );
    if (viewport.width < 600) await singleMarker.tap();
    else {
      await singleMarker.focus();
      await page.keyboard.press('Enter');
    }
    await expect(selection).toHaveCount(0);
    await expect(singleMarker).toHaveAttribute('aria-pressed', 'false');
  });
}

test('permissioned local recordings preserve gap distinction', async ({
  page
}, testInfo) => {
  const gapFile = process.env.GPSGOBLIN_GAP_FILE;
  const continuousFile = process.env.GPSGOBLIN_CONTINUOUS_FILE;
  test.skip(
    !gapFile || !continuousFile,
    'Local private recordings supplied only for owner validation'
  );
  if (!gapFile || !continuousFile) return;
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(gapFile);
  const control = page.getByLabel('Inspect recording gap', { exact: true });
  await expect(control).toBeHidden();
  await expect(control.locator('option')).toHaveCount(10);
  await page.getByText('Advanced Controls', { exact: true }).click();
  await page.getByText('9 recording gaps', { exact: true }).click();
  await control.selectOption({ index: 1 });
  await expect(
    page.getByLabel('Selected measurement', { exact: true })
  ).toContainText('We can’t tell how you moved during this gap');
  await page.screenshot({
    path: testInfo.outputPath('private-gap-recording.png')
  });
  await page
    .getByLabel('GPX file', { exact: true })
    .setInputFiles(continuousFile);
  await expect(control).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Speed', exact: true })
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('private-continuous-recording.png')
  });
});
