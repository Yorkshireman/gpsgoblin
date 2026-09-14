import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from './browserTest';

test('exported pages enforce headers and hydrate on direct clean URLs', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => { errors.push(error.message); });
  page.on('console', (message) => {
    if (/Content Security Policy|hydration|Hydration/i.test(message.text())) errors.push(message.text());
  });
  for (const url of ['/', '/tools/gpx-file-viewer', '/privacy', '/limitations', '/404.html']) {
    const response = await page.goto(url);
    const headers = response?.headers();
    expect(headers?.['content-security-policy']).toContain("worker-src 'self'");
    expect(headers?.['content-security-policy']).not.toContain('unsafe-eval');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers?.['x-frame-options']).toBe('DENY');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  }
  // Exercise browser enforcement, not just a string assertion on a header.
  const blocked = await page.evaluate(async () => {
    return await new Promise<string>((resolve) => {
      document.addEventListener('securitypolicyviolation', (event) => {
        resolve(event.violatedDirective);
      }, { once: true });
      const script = document.createElement('script');
      script.textContent = "document.documentElement.dataset.unapprovedScript = 'executed'";
      document.head.append(script);
    });
  });
  expect(blocked).toBe('script-src-elem');
  await expect(page.locator('html')).not.toHaveAttribute('data-unapproved-script');
});

test('activity canaries stay local through import, inspection, replacement and clear', async ({ page, context, baseURL }) => {
  const canaries = ['release-private-file', 'ReleasePrivateLabel', '53.1234567', '-1.7654321', '2031-07-19T09:37:41Z', '187.654', '123.456'];
  const requests: { url: string; method: string; body: string | null; headers: Record<string, string> }[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => { errors.push(error.message); });
  context.on('request', (request) => {
    requests.push({ url: request.url(), method: request.method(), body: request.postData(), headers: request.headers() });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tools/gpx-file-viewer');
  const picker = page.getByLabel('GPX file', { exact: true });
  await picker.setInputFiles({
    name: `${canaries[0]}.gpx`, mimeType: 'application/gpx+xml',
    buffer: Buffer.from(`<gpx version="1.1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"><trk><name>${canaries[1]}</name><trkseg>
      <trkpt lat="${canaries[2]}" lon="${canaries[3]}"><ele>${canaries[5]}</ele><time>${canaries[4]}</time><extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>${canaries[6]}</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions></trkpt>
      <trkpt lat="53.1244567" lon="-1.7644321"><ele>200</ele><time>2031-07-19T09:38:41Z</time></trkpt>
      </trkseg></trk></gpx>`)
  });
  const slider = page.getByRole('slider', { name: 'Position on route' });
  await slider.press('End');
  await slider.press('Home');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toBeVisible();
  const mapButton = page.getByRole('button', { name: 'View on map' });
  if (await mapButton.isVisible()) await mapButton.press('Enter');
  await expect(page.getByRole('img', { name: /Selected map position: 53.123/ })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Background map unavailable' })).toBeVisible();
  if (await page.getByRole('dialog').isVisible()) {
    await page.keyboard.press('Escape');
    await expect(mapButton).toBeFocused();
  }
  await page.getByRole('button', { name: 'Close point details' }).press('Enter');
  await expect(page.getByLabel('Selected measurement', { exact: true })).toHaveCount(0);
  await picker.setInputFiles({ name: 'replacement.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from('<gpx version="1.1"><wpt lat="0" lon="0"><name>Replacement waypoint</name></wpt></gpx>') });
  await expect(page.getByText('Replacement waypoint', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear file' }).press('Enter');
  await expect(page.getByRole('button', { name: 'Choose GPX file' })).toBeFocused();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
  expect(requests.some(({ url }) => { return url.includes('/maplibre/maplibre-gl-worker.mjs'); })).toBe(true);
  expect(requests.some(({ url }) => { return url.includes('/turbopack-worker-'); })).toBe(true);
  expect(requests.some(({ url }) => { return url.startsWith('https://tile.openstreetmap.org/'); })).toBe(true);
  for (const request of requests) {
    const url = new URL(request.url);
    expect(url.origin === baseURL || /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(request.url)).toBe(true);
    expect(['GET', 'HEAD']).toContain(request.method);
    expect(request.body).toBeNull();
    for (const canary of canaries) expect(decodeURIComponent(JSON.stringify(request))).not.toContain(canary);
  }
  const persisted = await page.evaluate(async () => {
    return JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, databases: await indexedDB.databases() });
  });
  for (const canary of canaries) expect(persisted).not.toContain(canary);
});

test('Workers verification hosts are noindex without affecting the public origin', async ({ request }) => {
  for (const host of ['gpsgoblin.example.workers.dev', 'version-gpsgoblin.example.workers.dev', 'branch-gpsgoblin.example.workers.dev', 'gpsgoblin.com']) {
    const response = await request.get('/tools/gpx-file-viewer', { headers: { Host: host } });
    expect(response.status()).toBe(200);
    expect(response.headers()['x-robots-tag']).toBe(host.endsWith('.workers.dev') ? 'noindex' : undefined);
    expect(response.headers()['content-security-policy']).toContain("worker-src 'self'");
  }
});

test('static assets exclude private files and known credential signatures', async () => {
  const files = readdirSync('out', { recursive: true, encoding: 'utf8' });
  const forbidden = /(^|\/)(?:\.env(?:\.[^/]*)?|private-recordings|tests|\.git)(?:\/|$)|\.(?:gpx|pem|key)$/i;
  const credential = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{80,}/;
  for (const file of files) {
    expect(forbidden.test(file), `Private asset path: ${file}`).toBe(false);
    if (/\.(?:html|js|mjs|css|json|txt|xml|map)$/.test(file)) {
      // Report filenames only; never echo a matched credential into test logs.
      expect(credential.test(readFileSync(path.join('out', file), 'utf8')), `Credential signature in ${file}`).toBe(false);
    }
  }
});
