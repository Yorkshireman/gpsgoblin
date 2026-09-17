import { expect, test, blockExternalTiles } from './browserTest';

const fixture =
  '<gpx version="1.1"><wpt lat="53.8" lon="-1.5"><name>Share link fixture</name></wpt></gpx>';

test('shares a GPX file from a fragment link without sending its contents outbound', async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write']
  });
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
  const page = await context.newPage();
  const outbound: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== baseURL) outbound.push(request.url());
  });
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'private-name.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(fixture)
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
  const copyLink = page.getByRole('button', { name: 'Copy link' });
  await expect(copyLink).toBeInViewport();
  await copyLink.click();
  await expect(page.getByText('Share link copied.')).toBeInViewport();
  const link = await page.evaluate(() => sessionStorage.getItem('shared-link'));
  if (!link) throw new Error('Expected the copied share link.');
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

  const recipient = await context.newPage();
  await recipient.goto(link);
  await expect(
    recipient.getByText('Share link fixture', { exact: true })
  ).toBeVisible();
  await expect(
    recipient.getByText('shared-route.gpx', { exact: true })
  ).toBeVisible();
  await expect(recipient).toHaveURL(/tools\/gpx-file-viewer\.html$/);
  await context.close();
});

test('explains a damaged or unknown share link on the normal upload view', async ({
  page
}) => {
  await page.goto('/tools/gpx-file-viewer.html#gpx-share=v2.invalid');
  await expect(page.getByText('Unable to open GPX file')).toBeVisible();
  await expect(
    page.getByText('This shared file uses a newer link format.')
  ).toBeInViewport();
  await expect(
    page.getByRole('button', { name: 'Choose GPX file' })
  ).toBeVisible();
});

test('keeps Share visible and explains why an oversized file cannot use a link', async ({
  page
}) => {
  await page.goto('/tools/gpx-file-viewer.html');
  await page.getByLabel('GPX file', { exact: true }).setInputFiles({
    name: 'large-route.gpx',
    mimeType: 'application/gpx+xml',
    buffer: Buffer.from(
      `<gpx version="1.1"><wpt lat="53.8" lon="-1.5"><name>Large share fixture</name></wpt><!--${'x'.repeat(8_000_001)}--></gpx>`
    )
  });
  await expect(
    page.getByText('Large share fixture', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Share GPX file' })
  ).toBeDisabled();
  await expect(
    page.getByText(
      'This file is too large to share as a link. You can still send the GPX file itself.'
    )
  ).toBeInViewport();
});
