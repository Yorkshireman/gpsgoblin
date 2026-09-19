import {
  createUXContext,
  expect,
  test,
  uxBaselineViewports
} from './browserTest';

const personalFile = {
  buffer: Buffer.from(
    '<gpx version="1.1"><trk><name>Personal route</name><trkseg><trkpt lat="53" lon="-1"><ele>100</ele><time>2026-09-11T12:00:00Z</time></trkpt><trkpt lat="53.01" lon="-1.01"><ele>120</ele><time>2026-09-11T12:01:00Z</time></trkpt></trkseg></trk></gpx>'
  ),
  mimeType: 'application/gpx+xml',
  name: 'personal-route.gpx'
};

for (const viewport of uxBaselineViewports) {
  test(`example journey stays usable at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await createUXContext(browser, viewport);
    const page = await context.newPage();
    let exampleResponse: 'delay' | 'fail' | 'success' = 'delay';
    let releaseExample: (() => void) | undefined;
    const delayedExample = new Promise<void>((resolve) => {
      releaseExample = resolve;
    });

    await page.route('**/examples/example-activity.gpx', async (route) => {
      if (exampleResponse === 'fail') {
        await route.fulfill({ body: 'Unavailable', status: 503 });
        return;
      }
      if (exampleResponse === 'delay') await delayedExample;
      await route.continue();
    });

    try {
      await page.goto('/');
      const homepageExample = page.getByRole('link', {
        name: 'Try an example'
      });
      await expect(
        page.getByRole('link', { name: 'Open GPX File Viewer' })
      ).toBeVisible();
      await expect(homepageExample).toBeVisible();
      await homepageExample.scrollIntoViewIfNeeded();
      if (viewport.width < 600) await homepageExample.tap();
      else {
        await homepageExample.focus();
        await expect(homepageExample).toBeFocused();
        await homepageExample.press('Enter');
      }

      await expect(page).toHaveURL(/#example-activity$/);
      await expect(page.getByText('Opening example activity')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Open your own file' })
      ).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('loading.png') });

      exampleResponse = 'success';
      releaseExample?.();
      await expect(
        page.getByText('Example activity', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Open your own file' })
      ).toBeVisible();
      const chartChoice = page.getByRole('combobox', { name: 'Chart' });
      await expect(chartChoice).toBeVisible();
      await expect(chartChoice.locator('option[value="elevation"]')).toHaveText(
        'Elevation'
      );
      await expect(chartChoice.locator('option[value="speed"]')).toHaveText(
        'Speed'
      );
      await expect(chartChoice.locator('option[value="pace"]')).toHaveText(
        'Pace'
      );
      await page.screenshot({ path: testInfo.outputPath('loaded.png') });

      await page
        .getByRole('slider', { name: 'Position on route' })
        .press('End');
      await expect(
        page.getByLabel('Selected measurement', { exact: true })
      ).toBeVisible();

      await page.reload();
      await expect(
        page.getByText('Example activity', { exact: true })
      ).toBeVisible();
      await page.goBack();
      await expect(
        page.getByRole('heading', {
          name: 'Free tools for GPS and activity files'
        })
      ).toBeVisible();

      await page.goto('/tools/gpx-file-viewer');
      await expect(
        page.getByRole('button', { name: 'Choose GPX file' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Try an example' })
      ).toBeVisible();
      await expect(
        page.getByText('Example activity', { exact: true })
      ).toHaveCount(0);

      const viewerExample = page.getByRole('button', {
        name: 'Try an example'
      });
      if (viewport.width < 600) await viewerExample.tap();
      else await viewerExample.press('Enter');
      await expect(
        page.getByText('Example activity', { exact: true })
      ).toBeVisible();

      await page
        .getByLabel('GPX file', { exact: true })
        .setInputFiles(personalFile);
      await expect(
        page.getByText('personal-route.gpx', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Change GPX file' })
      ).toBeVisible();
      await expect(page).not.toHaveURL(/#example-activity$/);
      await page.screenshot({ path: testInfo.outputPath('replacement.png') });

      await page.getByRole('button', { name: 'Clear file' }).press('Enter');
      exampleResponse = 'fail';
      const failingExample = page.getByRole('button', {
        name: 'Try an example'
      });
      if (viewport.width < 600) await failingExample.tap();
      else await failingExample.press('Enter');
      await expect(
        page.getByText('Unable to open example activity')
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Try again' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Choose GPX file' })
      ).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('error.png') });

      expect(
        await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        })
      ).toBe(true);
    } finally {
      await context.close();
    }
  });
}
