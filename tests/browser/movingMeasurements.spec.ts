import { advancedControlsDisclosureTrigger, expect, test } from './browserTest';

// Invented movement and a sustained confined interval; no personal recording.
const recording = () => {
  let seconds = 0;
  const points = Array.from({ length: 132 }, (_, index) => {
    if (index > 0) seconds += index === 111 ? 600 : 1;
    const metres =
      index <= 10
        ? index * 30
        : index <= 70
          ? 300 + Math.sin(index) / 10
          : 300 + (index - 70) * 20;
    return `<trkpt lat="0" lon="${metres / 111195.0802335329}"><ele>100</ele><time>${new Date(Date.UTC(2026, 0, 1) + seconds * 1000).toISOString()}</time></trkpt>`;
  }).join('');
  return `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Moving-view example</name><trkseg>${points}</trkseg></trk></gpx>`;
};

test.use({ hasTouch: true });
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 667 }
]) {
  test(`confirmed stop exclusion and axes at ${viewport.width}x${viewport.height}`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'moving-example.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(recording())
    });
    await expect(
      page.getByRole('heading', { name: 'Speed', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Includes stops', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Calculated distance', { exact: true })
    ).toBeInViewport();
    await expect(
      page.getByText('Elapsed time', { exact: true })
    ).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('loaded.png') });
    await expect(
      page.getByText('Review possible stops (1)', { exact: true })
    ).not.toBeVisible();
    const advanced = advancedControlsDisclosureTrigger(page);
    await advanced.press('Enter');
    await expect(
      page.getByRole('combobox', { name: 'Stops', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Review possible stops (1)', { exact: true })
    ).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('advanced-open.png') });
    await advanced.press('Space');
    await expect(
      page.getByRole('combobox', { name: 'Stops', exact: true })
    ).not.toBeVisible();
    const marker = page.getByRole('button', {
      name: 'Possible stop 1',
      exact: true
    });
    if (viewport.width < 600) await marker.tap();
    else {
      await marker.focus();
      await page.keyboard.press('Enter');
    }
    const selected = page.getByRole('region', {
      name: 'Selected possible stop'
    });
    await expect(selected).toContainText('climbing can look like a stop');
    await expect(selected).toContainText('Included in speed and pace');
    const confirmation = page.getByRole('checkbox', {
      name: 'I stopped here — leave this time out'
    });
    if (viewport.width < 600)
      await page
        .getByText('I stopped here — leave this time out', { exact: true })
        .tap();
    else {
      await confirmation.focus();
      await page.keyboard.press('Space');
    }
    await expect(confirmation).toBeChecked();
    await expect(
      page.getByRole('heading', { name: 'Moving speed', exact: true })
    ).toBeVisible();
    await expect(selected).toContainText('Left out of speed and pace');
    await expect(page.getByLabel('Active calculation')).toContainText(
      'Recording gaps: 10 min left out'
    );
    await expect(page.getByLabel('Active calculation')).toContainText(
      "Their time and distance don't count towards the average"
    );
    await expect(
      page.getByRole('dialog').locator('.measurement-selection-area')
    ).toBeInViewport({ ratio: 1 });
    await expect(
      page.getByRole('dialog').getByText('Distance (km)', { exact: true })
    ).toBeInViewport({ ratio: 1 });
    await expect(
      page.getByText('I stopped here — leave this time out', { exact: true })
    ).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath('excluded.png') });
    await page
      .getByRole('button', { name: 'Back to chart', exact: true })
      .click();
    await expect(marker).toBeFocused();
    await advancedControlsDisclosureTrigger(page).click();
    await page.getByRole('combobox', { name: 'Show by' }).selectOption('time');
    await expect(
      page.getByText('Estimated moving time (min)', { exact: true })
    ).toBeVisible();
    await advancedControlsDisclosureTrigger(page).click();
    await page
      .getByRole('combobox', { name: 'Chart', exact: true })
      .selectOption('pace');
    await expect(
      page.getByRole('heading', { name: 'Moving pace', exact: true })
    ).toBeVisible();
    await advancedControlsDisclosureTrigger(page).click();
    await page
      .getByRole('combobox', { name: 'Pace range', exact: true })
      .selectOption('full');
    await page
      .getByRole('combobox', { name: 'Pace range', exact: true })
      .selectOption('custom');
    await page
      .getByRole('spinbutton', { name: 'Maximum (min/km)' })
      .fill('0.1');
    await advancedControlsDisclosureTrigger(page).click();
    await expect(
      page.getByRole('button', { name: /Above range:/ }).first()
    ).toBeVisible();
    await page
      .getByRole('button', { name: /Above range:/ })
      .first()
      .click();
    await expect(
      page.getByLabel('Selected measurement', { exact: true })
    ).toContainText('Above the chart limit');
    await page
      .getByRole('combobox', { name: 'Display units' })
      .selectOption('imperial');
    await expect(
      page.getByText('Estimated moving time (min)', { exact: true })
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Show full range', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Use suggested range', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Include stops', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Pace', exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Elapsed time (min)', { exact: true })
    ).toBeVisible();
    await advancedControlsDisclosureTrigger(page).click();
    await page.getByText('Review possible stops (1)', { exact: true }).click();
    await page
      .getByLabel('Inspect possible stop', { exact: true })
      .selectOption({ index: 1 });
    await page
      .getByText('I stopped here — leave this time out', { exact: true })
      .click();
    await expect(confirmation).not.toBeChecked();
    await expect(selected).toContainText('Included in speed and pace');
    await page
      .getByRole('button', { name: 'Back to chart', exact: true })
      .click();
    await expect(
      page.getByLabel('Inspect possible stop', { exact: true })
    ).toBeFocused();
    await page.getByRole('combobox', { name: 'Stops' }).selectOption('exclude');
    await expect(page.getByLabel('Active calculation')).toContainText(
      'stops left out: 0 s'
    );
    await page
      .getByRole('combobox', { name: 'Show by' })
      .selectOption('distance');
    await advancedControlsDisclosureTrigger(page).click();
    await expect(
      page.getByText('Distance (mi)', { exact: true })
    ).toBeVisible();
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      })
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('restored-interval.png')
    });
  });
}

for (const kind of ['sparse', 'gap'] as const) {
  test(`no stop controls for ${kind} recordings; axis and gaps remain usable`, async ({
    page
  }) => {
    const points = Array.from({ length: 40 }, (_, index) => {
      const seconds =
        kind === 'sparse' ? index * 15 : index * 5 + (index >= 20 ? 600 : 0);
      return `<trkpt lat="0" lon="${index / 1000}"><time>${new Date(Date.UTC(2026, 0, 1) + seconds * 1000).toISOString()}</time></trkpt>`;
    }).join('');
    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: `${kind}.gpx`,
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(
        `<gpx version="1.1"><trk><trkseg>${points}</trkseg></trk></gpx>`
      )
    });
    for (const chart of ['speed', 'pace']) {
      await page
        .getByRole('combobox', { name: 'Chart', exact: true })
        .selectOption(chart);
      const advanced = advancedControlsDisclosureTrigger(page);
      await advanced.press('Enter');
      await expect(
        page.getByRole('combobox', { name: 'Stops', exact: true })
      ).toHaveCount(0);
      await expect(page.getByText(/Review possible stops/)).toHaveCount(0);
      await expect(
        page.getByText(/We cannot check for stops|No stops found to leave out/)
      ).toHaveCount(0);
      await page
        .getByRole('combobox', { name: 'Show by' })
        .selectOption('time');
      await advanced.press('Space');
      await expect(
        page.getByText('Elapsed time (min)', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText('Includes stops', { exact: true })
      ).toBeVisible();
      await expect(page.getByLabel('Active calculation')).toHaveCount(0);
      if (kind === 'gap')
        await expect(
          page.getByRole('button', { name: /Recording gap/ }).first()
        ).toBeVisible();
    }
  });
}

test('permissioned summit stop and dialog navigation preserve totals, source access and return focus', async ({
  page
}, testInfo) => {
  const file = process.env.GPSGOBLIN_CONTINUOUS_FILE;
  test.skip(!file, 'Owner-provided recording stays local');
  if (!file) return;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(file);
  await advancedControlsDisclosureTrigger(page).click();
  await page.getByText('Review possible stops (5)', { exact: true }).click();
  const selector = page.getByLabel('Inspect possible stop', { exact: true });
  await selector.selectOption({ index: 3 });
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('region', { name: 'Selected possible stop' })
  ).toContainText('10 min 38 s');
  await dialog
    .getByText('I stopped here — leave this time out', { exact: true })
    .click();
  await expect(page.getByLabel('Active calculation')).toContainText(
    'stops left out: 10 min 38 s'
  );
  await page.screenshot({
    path: testInfo.outputPath('private-summit-excluded.png')
  });
  // Another marker inside the modal must not replace the outside return target.
  const next = dialog
    .getByRole('button', { name: /Possible stop|nearby stop/ })
    .last();
  await next.click();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(selector).toBeFocused();
  await page
    .getByRole('button', { name: 'Include stops', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Speed', exact: true })
  ).toBeVisible();
  await expect(page.getByText('2 h 16 min 7 s', { exact: true })).toBeVisible();
  const position = page.getByRole('slider', { name: 'Position on route' });
  await expect(position).toHaveAttribute('aria-valuemax', '8141');
  await position.press('End');
  await expect(
    page.getByLabel('Selected measurement', { exact: true })
  ).toBeVisible();
});

test('permissioned lunch ride hides stop controls after replacing a filtered recording', async ({
  page
}, testInfo) => {
  const file = process.env.GPSGOBLIN_LUNCH_FILE;
  test.skip(!file, 'Owner-provided recording stays local');
  if (!file) return;
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  await picker.setInputFiles({
    name: 'stops.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(recording())
  });
  await page
    .getByRole('button', { name: 'Possible stop 1', exact: true })
    .click();
  await page
    .getByText('I stopped here — leave this time out', { exact: true })
    .click();
  await expect(
    page.getByRole('checkbox', { name: 'I stopped here — leave this time out' })
  ).toBeChecked();
  await page
    .getByRole('button', { name: 'Back to chart', exact: true })
    .click();
  await expect(page.getByLabel('Active calculation')).toBeVisible();
  await picker.setInputFiles(file);
  await expect(
    page.getByText('StravaLunchRide.gpx', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Speed', exact: true })
  ).toBeVisible();
  await advancedControlsDisclosureTrigger(page).click();
  await expect(page.getByRole('combobox', { name: 'Show by' })).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Stops', exact: true })
  ).toHaveCount(0);
  await expect(page.getByText(/Review possible stops/)).toHaveCount(0);
  await expect(page.getByLabel('Active calculation')).toHaveCount(0);
  await expect(
    page.getByText('6 recording gaps', { exact: true })
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('private-lunch-advanced.png')
  });
});
