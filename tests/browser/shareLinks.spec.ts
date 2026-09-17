import type { BrowserContext, Page } from '@playwright/test';

import { expect, test, blockExternalTiles } from './browserTest';

const fixture =
  '<gpx version="1.1"><wpt lat="53.8" lon="-1.5"><name>Share link fixture</name></wpt></gpx>';

type ButtonPosition = Readonly<{
  x: number;
  y: number;
}>;

test.describe('when someone copies a share link for an opened GPX file', () => {
  let cancelButtonPosition: ButtonPosition;
  let context: BrowserContext;
  let copyLinkPosition: ButtonPosition;
  let link: string;
  let outbound: string[];
  let page: Page;

  test.beforeEach(async ({ browser, baseURL }, testInfo) => {
    context = await browser.newContext(
      testInfo.project.name === 'mobile'
        ? {
            hasTouch: true,
            permissions: ['clipboard-read', 'clipboard-write'],
            viewport: { height: 844, width: 390 }
          }
        : {
            permissions: ['clipboard-read', 'clipboard-write'],
            viewport: { height: 900, width: 1440 }
          }
    );

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { value: undefined });
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (value: string) => {
            window.sessionStorage.setItem('shared-link', value);
          }
        }
      });
    });

    await blockExternalTiles(context);
    outbound = [];
    page = await context.newPage();

    page.on('request', (request) => {
      if (new URL(request.url()).origin !== baseURL) {
        outbound.push(request.url());
      }
    });

    await page.goto('/tools/gpx-file-viewer.html');
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      buffer: Buffer.from(fixture),
      mimeType: 'application/gpx+xml',
      name: 'private-name.gpx'
    });

    const share = page.getByRole('button', { name: 'Share GPX file' });

    await expect(share).toBeEnabled();
    await expect(share).toBeInViewport();
    await share.click();

    const confirmation = page.getByRole('dialog');

    await expect(confirmation).toContainText(
      'Sending it is like sending the file itself.'
    );

    await expect(confirmation).toBeInViewport();

    const cancel = page.getByRole('button', { name: 'Cancel' });
    const copyLink = page.getByRole('button', { name: 'Copy link' });

    await expect(cancel).toBeInViewport();
    await expect(copyLink).toBeInViewport();

    const cancelBounds = await cancel.boundingBox();
    const copyLinkBounds = await copyLink.boundingBox();

    if (!cancelBounds || !copyLinkBounds) {
      throw new Error('Expected both sharing actions to have visible bounds.');
    }

    cancelButtonPosition = { x: cancelBounds.x, y: cancelBounds.y };
    copyLinkPosition = { x: copyLinkBounds.x, y: copyLinkBounds.y };

    await copyLink.click();

    await expect(confirmation).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Link copied' })
    ).toBeVisible();
    await expect(page.getByText('Share link copied.')).toBeInViewport();

    link =
      (await page.evaluate(() => sessionStorage.getItem('shared-link'))) ?? '';
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('keeps the GPX payload out of the URL query and outbound requests', () => {
    expect(link).toContain('#gpx-share=v1.');
    expect(link).not.toContain('?');
    expect(link).not.toContain('Share%20link%20fixture');
    expect(
      outbound.every((url) => {
        return (
          !url.includes('gpx-share') && !url.includes('Share%20link%20fixture')
        );
      })
    ).toBe(true);
  });

  test('keeps Cancel next to Copy link', () => {
    expect(cancelButtonPosition.x).toBeLessThan(copyLinkPosition.x);
    expect(cancelButtonPosition.y).toBe(copyLinkPosition.y);
  });

  test.describe('when the copy confirmation period ends', () => {
    test.beforeEach(async () => {
      await expect(page.getByRole('dialog')).toBeHidden({ timeout: 3_000 });
    });

    test('closes the sharing confirmation', () => {
      expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('when the recipient opens the copied link', () => {
    let recipient: Page;

    test.beforeEach(async () => {
      if (!link) throw new Error('Expected the copied share link.');

      recipient = await context.newPage();
      await recipient.goto(link);
    });

    test('opens the shared file on the normal GPX viewer route', async () => {
      await expect(
        recipient.getByText('Share link fixture', { exact: true })
      ).toBeVisible();

      await expect(
        recipient.getByText('shared-route.gpx', { exact: true })
      ).toBeVisible();
      await expect(recipient).toHaveURL(/tools\/gpx-file-viewer\.html$/);
    });
  });
});

test.describe('when a recipient opens an unknown share-link version', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/gpx-file-viewer.html#gpx-share=v2.invalid');
  });

  test('explains the problem on the normal upload view', async ({ page }) => {
    await expect(page.getByText('Unable to open GPX file')).toBeVisible();
    await expect(
      page.getByText('This shared file uses a newer link format.')
    ).toBeInViewport();

    await expect(
      page.getByRole('button', { name: 'Choose GPX file' })
    ).toBeVisible();
  });
});

test.describe('when a file is too large to share', () => {
  let target: Page;
  let touchContext: BrowserContext | undefined;

  test.beforeEach(async ({ browser, page, baseURL }, testInfo) => {
    touchContext =
      testInfo.project.name === 'mobile'
        ? await browser.newContext({
            hasTouch: true,
            viewport: { height: 844, width: 390 }
          })
        : undefined;

    target = touchContext ? await touchContext.newPage() : page;
    if (touchContext) await blockExternalTiles(touchContext);

    await target.goto(
      touchContext
        ? `${baseURL}/tools/gpx-file-viewer.html`
        : '/tools/gpx-file-viewer.html'
    );

    await target.getByLabel('GPX file', { exact: true }).setInputFiles({
      buffer: Buffer.from(
        `<gpx version="1.1"><wpt lat="53.8" lon="-1.5"><name>Large share fixture</name></wpt><!--${'x'.repeat(8_000_001)}--></gpx>`
      ),
      mimeType: 'application/gpx+xml',
      name: 'large-route.gpx'
    });

    await expect(
      target.getByText('Large share fixture', { exact: true })
    ).toBeVisible();

    const share = target.getByRole('button', { name: 'Sharing unavailable' });

    await expect(share).toHaveAttribute('aria-disabled', 'true');
    if (touchContext) await share.tap();
    else await share.hover();
  });

  test.afterEach(async () => {
    await touchContext?.close();
  });

  test('reveals the unavailable reason from the Share icon', async () => {
    await expect(target.getByText('File too big to share.')).toBeInViewport();
  });
});
