import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './browserTest';

for (const colorScheme of ['light', 'dark'] as const) {
  test(`public pages and viewer states have no automated accessibility violations in ${colorScheme} mode`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    const scan = async (state: string) => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      await testInfo.attach(`${state}-axe`, { body: JSON.stringify({ violations: result.violations, incomplete: result.incomplete }), contentType: 'application/json' });
      expect(result.violations, state).toEqual([]);
      return;
    };
    for (const url of ['/', '/privacy', '/limitations', '/tools/gpx-file-viewer']) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await scan(url.replaceAll('/', '-') || 'home');
      if (url === '/') {
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Open GPX File Viewer' })).toBeFocused();
        await page.screenshot({ path: testInfo.outputPath(`home-focus-${colorScheme}.png`) });
        await page.keyboard.press('Enter');
        await expect(page.getByRole('heading', { name: 'GPX File Viewer', exact: true })).toBeVisible();
      }
    }
    const picker = page.getByLabel('GPX file', { exact: true });
    await picker.setInputFiles({ name: 'accessibility.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from('<gpx version="1.1"><trk><name>Accessibility route</name><trkseg><trkpt lat="0" lon="0"><ele>10</ele><time>2026-01-01T00:00:00Z</time></trkpt><trkpt lat="0" lon="0.01"><ele>20</ele><time>2026-01-01T00:01:00Z</time></trkpt></trkseg></trk></gpx>') });
    await page.getByRole('slider', { name: 'Position on route' }).press('End');
    await expect(page.getByLabel('Selected measurement', { exact: true })).toBeVisible();
    await scan('selected');
    await page.screenshot({ path: testInfo.outputPath(`selected-${colorScheme}.png`) });
    const viewMap = page.getByRole('button', { name: 'View on map' });
    if (await viewMap.isVisible()) {
      await viewMap.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('img', { name: /Selected map position:/ })).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: 'Background map unavailable' })).toBeVisible();
      // axe flags focusable content behind a modal for manual review. Verify
      // the dialog's focus trap and its keyboard exit instead of ignoring it.
      for (let step = 0; step < 12; step += 1) {
        await page.keyboard.press('Tab');
        await expect.poll(async () => {
          return await page.getByRole('dialog').evaluate((dialog) => {
            return dialog.contains(document.activeElement);
          });
        }).toBe(true);
      }
      await scan('map-dialog');
      await page.keyboard.press('Escape');
      await expect(viewMap).toBeFocused();
    }
    await picker.setInputFiles({ name: 'broken.gpx', mimeType: 'application/gpx+xml', buffer: Buffer.from('<gpx>') });
    await expect(page.getByText('Unable to open GPX file')).toBeVisible();
    await scan('failed-replacement');
    await page.getByRole('button', { name: 'Clear file' }).press('Enter');
    await expect(page.getByRole('button', { name: 'Choose GPX file' })).toBeFocused();
    await scan('cleared');
    return;
  });
}
