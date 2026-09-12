import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const file = (name: string, contents = '<gpx version="1.1"><wpt lat="0" lon="0"><name>Safe waypoint</name></wpt></gpx>') => {
  return { name, mimeType: 'application/gpx+xml', buffer: Buffer.from(contents) };
};

test('actual worker rejects hostile input without network requests and recovers', async ({ page }) => {
  const outbound: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outbound.push(request.url());
  });
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  const workerStarted = page.waitForEvent('worker', worker => worker.url().includes('turbopack-worker'));
  await picker.setInputFiles(file('valid.gpx'));
  const worker = await workerStarted;
  expect(worker.url()).toContain('/_next/');
  await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
  for (const contents of [
    '<!DOCTYPE gpx SYSTEM "https://gpx-canary.invalid/external.dtd"><gpx version="1.1"/>',
    '<!DOCTYPE gpx [<!ENTITY x "123"><!ENTITY y "&x;&x;&x;">]><gpx version="1.1"><name>&y;</name></gpx>',
    '<gpx version="1.1"><wpt lat="0" lon="0"></gpx>',
    '<gpx version="1.0"/>',
    '<gpx version="1.1"><wpt lat="0" lon="0"><name>a & b</name></wpt></gpx>',
    '<gpx version="1.1"><wpt lat="0" lon="0"><name>&#0;</name></wpt></gpx>',
    '<gpx version="1.1"><wpt lat="0" lon="0"><name>\u0000</name></wpt></gpx>',
    '<gpx version="1.1"/>',
    '<TrainingCenterDatabase/>'
  ]) {
    await picker.setInputFiles(file('rejected.gpx', contents));
    await expect(page.getByText('Unable to open GPX file')).toBeVisible();
    await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
    await expect(page.getByText('valid.gpx', { exact: true }).first()).toBeVisible();
  }
  const markup = '<img src="https://gpx-canary.invalid/pixel" onerror="alert(1)">';
  await picker.setInputFiles(file('markup.gpx', `<gpx version="1.1"><wpt lat="0" lon="0"><name><![CDATA[${markup}]]></name><link href="https://gpx-canary.invalid/link"/></wpt></gpx>`));
  await expect(page.getByText(markup, { exact: true })).toBeVisible();
  expect(outbound).toEqual([]);
  await page.getByRole('button', { name: 'Clear file' }).click();
  await expect(page.getByRole('heading', { name: 'Open a GPX file' })).toBeVisible();
  await picker.setInputFiles(file('valid.gpx'));
  await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
  test(`cancel, clear and retry remain usable at ${viewport.width} × ${viewport.height}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 600 });
    const page = await context.newPage();
    await page.goto('/tools/gpx-file-viewer.html');
    await page.screenshot({ path: testInfo.outputPath('initial.png') });
    const picker = page.getByLabel('GPX file', { exact: true });
    await picker.setInputFiles(file('original.gpx'));
    await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('loaded.png') });
    // Delay only the worker asset, keeping its real code and transport unchanged.
    let release: (() => void) | undefined;
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/turbopack-worker-*.js', async route => { await held; await route.continue(); });
    await picker.setInputFiles(file('replacement.gpx'));
    const cancel = page.getByRole('button', { name: 'Cancel import' });
    await expect(cancel).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Clear file' })).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath('processing.png') });
    if (viewport.width < 600) await cancel.tap();
    else await cancel.press('Enter');
    await expect(page.getByText('Import cancelled.')).toBeInViewport();
    await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
    release?.();
    await page.unrouteAll({ behavior: 'wait' });
    await picker.setInputFiles(file('replacement.gpx'));
    await expect(page.getByText('replacement.gpx', { exact: true }).first()).toBeVisible();
    await picker.setInputFiles(file('malformed.gpx', '<gpx>'));
    await expect(page.getByText('The file contains malformed XML.')).toBeVisible();
    await expect(page.getByText('replacement.gpx', { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('failed-replacement.png') });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Clear file' }).click();
    await expect(page.getByText('Workspace cleared.')).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('cleared.png') });
    await context.close();
  });
}

test('a long-running import remains cancellable and preserves the previous file', async ({ page }) => {
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  await picker.setInputFiles(file('original.gpx'));
  await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
  let release: (() => void) | undefined;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/turbopack-worker-*.js', async route => { await held; await route.continue(); });
  try {
    await picker.setInputFiles(file('slow.gpx'));
    await expect(page.getByRole('button', { name: 'Cancel import' })).toBeEnabled();
    await page.clock.install();
    await page.clock.fastForward(60000);
    await expect(page.getByRole('button', { name: 'Cancel import' })).toBeEnabled();
    await page.getByRole('button', { name: 'Cancel import' }).click();
    await expect(page.getByText('Import cancelled.')).toBeVisible();
    await expect(page.getByText('original.gpx', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
  } finally {
    release?.();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await picker.setInputFiles(file('slow.gpx'));
  await expect(page.getByText('slow.gpx', { exact: true }).first()).toBeVisible();
});

test('rejects multiple dropped files and permits a single-file recovery', async ({ page }) => {
  await page.goto('/tools/gpx-file-viewer.html');
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    for (const name of ['one.gpx', 'two.gpx']) {
      data.items.add(new File(['<gpx version="1.1"/>'], name, { type: 'application/gpx+xml' }));
    }
    return data;
  });
  await page.locator('[data-part="dropzone"]').dispatchEvent('drop', { dataTransfer: transfer });
  await expect(page.getByText('Open one GPX file at a time. Choose a single file to replace the current file.')).toBeVisible();
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(file('one.gpx'));
  await expect(page.getByText('Safe waypoint', { exact: true })).toBeVisible();
});

test('clearing a pending import prevents it from restoring data after a newer import', async ({ page }) => {
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  let release: (() => void) | undefined;
  let first = true;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/turbopack-worker-*.js', async route => {
    if (first) {
      first = false;
      await held;
    }
    await route.continue();
  });
  try {
    await picker.setInputFiles(file('old.gpx'));
    await expect(page.getByRole('button', { name: 'Cancel import' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear file' }).click();
    await expect(page.getByText('Workspace cleared.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose GPX file' })).toBeFocused();
    await expect(page.getByText('Safe waypoint', { exact: true })).toHaveCount(0);
    await picker.setInputFiles(file('new.gpx'));
    await expect(page.getByText('new.gpx', { exact: true }).first()).toBeVisible();
  } finally {
    release?.();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await expect(page.getByText('new.gpx', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('old.gpx', { exact: true })).toHaveCount(0);
});

test('first-import progress and failure feedback fit the short phone viewport', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/tools/gpx-file-viewer.html');
  let release: (() => void) | undefined;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/turbopack-worker-*.js', async route => { await held; await route.continue(); });
  try {
    await page.getByLabel('GPX file', { exact: true }).setInputFiles(file('first.gpx'));
    const cancel = page.getByRole('button', { name: 'Cancel import' });
    await expect(cancel).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: testInfo.outputPath('first-processing.png') });
    await cancel.tap();
  } finally {
    release?.();
    await page.unrouteAll({ behavior: 'wait' });
  }
  await page.getByLabel('GPX file', { exact: true }).setInputFiles(file('bad.gpx', '<gpx>'));
  await expect(page.getByText('The file contains malformed XML.')).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: testInfo.outputPath('first-failure.png') });
  await context.close();
});


test('the actual worker imports the complete sanitised Strava recording', async ({ page }) => {
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'sanitised-recording.gpx',
    mimeType: 'application/gpx+xml',
    buffer: readFileSync('tests/fixtures/gpx/strava-recording.gpx')
  });
  await expect(page.getByRole('button', { name: 'Change GPX file' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Speed', exact: true })).toBeVisible();
  await page.getByRole('slider', { name: 'Position on route' }).press('ArrowRight');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toBeVisible();
});
