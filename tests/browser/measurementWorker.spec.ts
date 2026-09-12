import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    measurementTransport: { hold: boolean; release?: () => void; requests: number; workers: number; analysisRequests: boolean[]; analysisResponses: boolean[] };
  }
}

test('worker settings preserve the previous view and apply only the latest request', async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalWorker = window.Worker;
    window.measurementTransport = { hold: true, requests: 0, workers: 0, analysisRequests: [], analysisResponses: [] };
    window.Worker = class extends OriginalWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options);
        if (String(url).includes('turbopack-worker')) window.measurementTransport.workers += 1;
        this.addEventListener('message', event => {
          if (event.data.type === 'view' && event.data.ok) {
            window.measurementTransport.analysisResponses.push(Boolean(event.data.view.analysis));
          }
        });
      }
      postMessage(message: unknown, options?: StructuredSerializeOptions | Transferable[]) {
        const send = () => {
          if (Array.isArray(options)) super.postMessage(message, options);
          else super.postMessage(message, options);
          return;
        };
        if (message && typeof message === 'object' && 'type' in message && message.type === 'view') {
          window.measurementTransport.requests += 1;
          if ('settings' in message && message.settings && typeof message.settings === 'object' && 'includeAnalysis' in message.settings) {
            window.measurementTransport.analysisRequests.push(message.settings.includeAnalysis !== false);
          }
          if (window.measurementTransport.hold) {
            window.measurementTransport.release = () => {
              window.measurementTransport.hold = false;
              send();
            };
            return;
          }
        }
        send();
      }
    };
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'worker-settings.gpx', mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx version="1.1"><trk><trkseg>
      <trkpt lat="0" lon="0"><ele>0</ele><time>2026-01-01T00:00:00Z</time></trkpt>
      <trkpt lat="0" lon="0.01"><ele>100</ele><time>2026-01-01T00:01:00Z</time></trkpt>
      </trkseg></trk><trk><name>Other track</name><trkseg>
      <trkpt lat="1" lon="1"/><trkpt lat="1" lon="1.01"/>
      </trkseg></trk></gpx>`)
  });
  // Cancel an initial view by changing scope, then return before its reply.
  // The replacement request still needs static columns because none were received.
  await expect(page.getByText('Preparing measurements…')).toBeVisible();
  await page.getByRole('combobox', { name: 'Item to inspect' }).selectOption('track-1');
  await page.getByRole('combobox', { name: 'Item to inspect' }).selectOption('track-0');
  expect(await page.evaluate(() => window.measurementTransport.requests)).toBe(1);
  await page.evaluate(() => { window.measurementTransport.release?.(); });
  await page.getByRole('slider', { name: 'Position on route' }).press('End');
  const selected = page.getByLabel('Selected measurement', { exact: true });
  await expect(selected).toContainText('66.7 km/h');
  await page.evaluate(() => { window.measurementTransport.hold = true; });
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('imperial');
  await expect(page.getByRole('status', { name: 'Updating measurements' })).toHaveText('Updating…');
  await expect(selected).toContainText('66.7 km/h');
  await page.getByRole('combobox', { name: 'Chart', exact: true }).selectOption('pace');
  await page.getByRole('slider', { name: 'Smoothing' }).press('End');
  expect(await page.evaluate(() => window.measurementTransport.requests)).toBe(3);
  await page.evaluate(() => { window.measurementTransport.release?.(); });
  await expect(page.getByRole('region', { name: 'Measurement chart', exact: true })).toHaveAttribute('aria-busy', 'false');
  await expect(selected).toContainText('1:27 min/mi');
  await expect(selected).toContainText('328.1 ft');
  await expect(page.getByRole('heading', { name: 'Pace', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.measurementTransport.requests)).toBe(4);
  expect(await page.evaluate(() => window.measurementTransport.analysisRequests)).toEqual([true, true, false, false]);
  expect(await page.evaluate(() => window.measurementTransport.analysisResponses)).toEqual([true, true, false, false]);
  expect(await page.evaluate(() => window.measurementTransport.workers)).toBe(1);
  // An update pending during Clear cannot restore its file or overwrite a new one.
  await page.evaluate(() => { window.measurementTransport.hold = true; });
  await page.getByRole('combobox', { name: 'Display units' }).selectOption('metric');
  await page.getByRole('button', { name: 'Clear file' }).click();
  await page.evaluate(() => { window.measurementTransport.release?.(); });
  await expect(page.getByRole('heading', { name: 'Open a GPX file' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Position on route' })).toHaveCount(0);
});
