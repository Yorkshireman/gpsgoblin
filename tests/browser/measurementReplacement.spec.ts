import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    rejectNextMeasurementView: boolean;
  }
}

const recording = (day: number, elevation: number) => {
  return {
    // Identical file and entity names exercise replacement without relying on
    // changing labels or the parser's stable per-document IDs to reset state.
    name: 'recording.gpx', mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx version="1.1"><trk><name>Recorded track</name><trkseg>
      <trkpt lat="0" lon="0"><ele>${elevation}</ele><time>2026-01-0${day}T00:00:00Z</time></trkpt>
      <trkpt lat="0" lon="0.01"><ele>${elevation + 10}</ele><time>2026-01-0${day}T00:01:00Z</time></trkpt>
      <trkpt lat="0" lon="0.02"><ele>${elevation + 20}</ele><time>2026-01-0${day}T00:02:00Z</time></trkpt>
      </trkseg></trk></gpx>`)
  };
};

test('successful replacement resets the previous selection and file-owned chart settings', async ({ page }) => {
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  const position = page.getByRole('slider', { name: 'Position on route' });
  const chart = page.getByRole('combobox', { name: 'Chart', exact: true });
  const units = page.getByRole('combobox', { name: 'Display units' });
  await picker.setInputFiles(recording(1, 100));
  await position.press('End');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('120.0 m');
  await chart.selectOption('pace');
  await units.selectOption('imperial');
  await page.getByRole('slider', { name: 'Smoothing' }).press('End');
  await expect(page.getByRole('region', { name: 'Measurement chart', exact: true })).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('combobox', { name: 'Pace range' }).selectOption('custom');
  await page.getByRole('spinbutton', { name: 'Maximum (min/mi)' }).fill('10');

  await picker.setInputFiles(recording(2, 200));
  await expect(page.getByLabel('Chart selection tip', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Selected measurement', { exact: true })).toHaveCount(0);
  await expect(chart).toHaveValue('speed');
  await expect(units).toHaveValue('metric');
  await expect(page.getByRole('slider', { name: 'Smoothing' })).toHaveAttribute('aria-valuetext', '1 minute');
  await chart.selectOption('pace');
  await expect(page.getByRole('combobox', { name: 'Pace range' })).toHaveValue('automatic');
  await position.press('End');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('220.0 m');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('2 January 2026 at 00:02:00 UTC');
});

test('replacement after a real worker view error clears old failure and starts a usable session', async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalWorker = window.Worker;
    window.rejectNextMeasurementView = false;
    window.Worker = class extends OriginalWorker {
      postMessage(message: unknown, options?: StructuredSerializeOptions | Transferable[]) {
        // Alter only one request at the browser worker boundary. The real worker
        // runs its missing-entity/error path and all later calculations normally.
        if (window.rejectNextMeasurementView && message && typeof message === 'object' &&
          'type' in message && message.type === 'view' && 'settings' in message &&
          message.settings && typeof message.settings === 'object') {
          window.rejectNextMeasurementView = false;
          message = { ...message, settings: { ...message.settings, entityId: 'unavailable-entity' } };
        }
        if (Array.isArray(options)) super.postMessage(message, options);
        else super.postMessage(message, options);
      }
    };
  });
  await page.goto('/tools/gpx-file-viewer.html');
  const picker = page.getByLabel('GPX file', { exact: true });
  const position = page.getByRole('slider', { name: 'Position on route' });
  const units = page.getByRole('combobox', { name: 'Display units' });
  await picker.setInputFiles(recording(1, 100));
  await position.press('End');
  await page.evaluate(() => { window.rejectNextMeasurementView = true; });
  await units.selectOption('imperial');
  await expect(page.getByText('Measurements could not be updated. Try again or reopen the file.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry measurements' })).toBeVisible();
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('120.0 m');

  await picker.setInputFiles(recording(2, 200));
  await expect(page.getByLabel('Chart selection tip', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry measurements' })).toHaveCount(0);
  await expect(page.getByText('Measurements could not be updated. Try again or reopen the file.')).toHaveCount(0);
  await expect(units).toHaveValue('metric');
  await position.press('End');
  await units.selectOption('imperial');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('721.8 ft');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toContainText('2 January 2026 at 00:02:00 UTC');
});
