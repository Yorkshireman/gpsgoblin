import {
  createUXContext,
  expect,
  test,
  uxBaselineViewports
} from './browserTest';

for (const viewport of uxBaselineViewports) {
  test(`GPX help journeys remain usable at ${viewport.width} × ${viewport.height}`, async ({
    browser
  }, testInfo) => {
    const context = await createUXContext(browser, viewport);
    const page = await context.newPage();

    await page.goto('/');
    const homepageHelp = page.getByRole('link', {
      name: 'How to get a GPX file'
    });
    await expect(homepageHelp).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Troubleshoot a GPX file' })
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(
        `home-help-entry-${viewport.width}x${viewport.height}.png`
      )
    });
    if (viewport.width < 600) await homepageHelp.tap();
    else await homepageHelp.press('Enter');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'How to get and open a GPX file'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('link', { name: 'Explore my GPX file' }).first()
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Choose your service'
      })
    ).toBeVisible();
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth > innerWidth;
      })
    ).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(
        `get-gpx-initial-${viewport.width}x${viewport.height}.png`
      )
    });

    const komoot = page.getByRole('link', {
      name: 'komoot Website or mobile app'
    });
    if (viewport.width < 600) await komoot.tap();
    else await komoot.press('Enter');
    await expect(page).toHaveURL(/#komoot-heading$/);
    await expect(
      page.getByRole('heading', { level: 2, name: 'komoot' })
    ).toBeInViewport();

    const troubleshooting = page.getByRole('link', {
      name: 'Troubleshoot an empty or incomplete GPX file'
    });
    await troubleshooting.scrollIntoViewIfNeeded();
    await page.keyboard.press('Tab');
    await troubleshooting.focus();
    await expect(troubleshooting).toBeFocused();
    await expect
      .poll(async () => {
        return troubleshooting.evaluate((element) => {
          const style = getComputedStyle(element);
          return `${style.outlineStyle} ${style.boxShadow}`;
        });
      })
      .not.toBe('none none');
    if (viewport.width < 600) await troubleshooting.tap();
    else await troubleshooting.press('Enter');

    await expect(page).toHaveURL(/gpx-file-empty-or-missing-data/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Why a GPX file is empty or missing data'
      })
    ).toBeInViewport();
    const recovery = page.getByRole('heading', {
      level: 2,
      name: 'The map works but a chart is missing'
    });
    await recovery.scrollIntoViewIfNeeded();
    await expect(recovery).toBeInViewport();
    expect(
      await page.evaluate(() => {
        return document.documentElement.scrollWidth > innerWidth;
      })
    ).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(
        `troubleshooting-branch-${viewport.width}x${viewport.height}.png`
      )
    });

    const getGpx = page.getByRole('link', {
      name: 'Learn how to get a GPX file'
    });
    await getGpx.scrollIntoViewIfNeeded();
    if (viewport.width < 600) await getGpx.tap();
    else await getGpx.press('Enter');
    await expect(page).toHaveURL(/how-to-get-a-gpx-file/);

    const viewer = page
      .getByRole('link', { name: 'Explore my GPX file' })
      .last();
    await viewer.scrollIntoViewIfNeeded();
    await expect(viewer).toBeInViewport();
    await page.screenshot({
      path: testInfo.outputPath(
        `get-gpx-cta-${viewport.width}x${viewport.height}.png`
      )
    });
    if (viewport.width < 600) await viewer.tap();
    else await viewer.press('Enter');
    await expect(page).toHaveURL(/tools\/gpx-file-viewer/);
    await expect(
      page.getByRole('button', { name: 'Choose GPX file' })
    ).toBeVisible();
    const viewerHelp = page.getByRole('link', {
      name: 'How to get a GPX file'
    });
    await expect(viewerHelp).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Troubleshoot a GPX file' })
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(
        `viewer-help-entry-${viewport.width}x${viewport.height}.png`
      )
    });
    if (viewport.width < 600) await viewerHelp.tap();
    else await viewerHelp.press('Enter');
    await expect(page).toHaveURL(/help\/how-to-get-a-gpx-file/);

    await context.close();
  });
}
