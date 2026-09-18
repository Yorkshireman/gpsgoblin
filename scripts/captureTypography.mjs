// Repeatable design evidence, not a production font change or a new E2E suite.
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const port = Number(process.env.TYPOGRAPHY_CAPTURE_PORT ?? 4191);
const origin = `http://127.0.0.1:${port}`;
const output = 'docs/typography/captures';
const server = spawn(process.execPath, ['scripts/previewTypography.mjs'], {
  env: { ...process.env, TYPOGRAPHY_PORT: String(port) },
  stdio: 'inherit'
});
const evidence = [];
let browser;
let startupError;
server.once('error', (error) => {
  startupError = error;
  return;
});
server.once('exit', (code) => {
  startupError = new Error(`Preview exited with ${code}`);
  return;
});

const points = Array.from({ length: 120 }, (_, index) => {
  return `<trkpt lat="53" lon="${index * 0.001 + Math.sin(index / 10) * 0.0008}"><ele>${100 + index}</ele><time>${new Date(Date.UTC(2026, 8, 11, 12, 0, index * 10)).toISOString()}</time></trkpt>`;
}).join('');
const recording = `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Typography sample</name><trkseg>${points}</trkseg></trk></gpx>`;
const missingTime =
  '<gpx version="1.1" creator="Synthetic typography sample" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>Route with missing readings</name><trkseg><trkpt lat="0" lon="0"><ele>10</ele></trkpt><trkpt lat="0" lon="0.01"/></trkseg></trk></gpx>';

try {
  for (let attempt = 0; ; attempt += 1) {
    if (startupError) throw startupError;
    if (attempt >= 50) throw new Error('Preview server did not become ready');
    try {
      const response = await fetch(`${origin}/__typography/`);
      if (response.ok) break;
    } catch {
      // The child may not have opened its listener yet.
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
      return;
    });
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ channel: 'chrome' });
  console.log(`Capturing with ${browser.version()}`);
  for (const font of ['current', 'inter', 'source']) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
      { width: 375, height: 667 }
    ]) {
      for (const text of [100, 200]) {
        const phone = viewport.width < 600;
        const context = await browser.newContext({
          viewport,
          hasTouch: phone,
          colorScheme: 'light',
          reducedMotion: 'reduce'
        });
        // No visitor requests to font services, map services or other external hosts.
        await context.route('**/*', async (route) => {
          if (!route.request().url().startsWith(origin)) await route.abort();
          else await route.continue();
          return;
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => {
          errors.push(error.message);
          return;
        });
        const prefix = `${font}-${viewport.width}x${viewport.height}-${text}`;
        const navigate = async (path) => {
          await page.goto(`${origin}${path}?font=${font}&text=${text}`);
          await page.getByRole('heading', { level: 1 }).waitFor();
          await page.evaluate(async () => {
            await document.fonts.ready;
            return;
          });
          return;
        };
        const capture = async (state) => {
          await page.screenshot({
            path: `${output}/${prefix}-${state}.png`,
            animations: 'disabled'
          });
          evidence.push({
            font,
            viewport,
            text,
            state,
            browser: browser.version(),
            errors: [...errors],
            ...(await page.evaluate(() => {
              const visible = (selector) => {
                const element = document.querySelector(selector);
                if (!element) return null;
                const box = element.getBoundingClientRect();
                return {
                  top: Math.round(box.top),
                  bottom: Math.round(box.bottom),
                  fullyVisible:
                    box.top >= 0 &&
                    box.bottom <= innerHeight &&
                    box.left >= 0 &&
                    box.right <= innerWidth
                };
              };
              return {
                scrollY: Math.round(scrollY),
                scrollWidth: document.documentElement.scrollWidth,
                horizontalOverflow:
                  document.documentElement.scrollWidth > innerWidth,
                bodyFont: getComputedStyle(document.body).fontFamily,
                headingFont: getComputedStyle(document.querySelector('h1'))
                  .fontFamily,
                rootFontSize: getComputedStyle(document.documentElement)
                  .fontSize,
                loadedFonts: [...document.fonts]
                  .filter((face) => {
                    return face.status === 'loaded';
                  })
                  .map((face) => {
                    return face.family;
                  }),
                selection: visible('[aria-label="Selected measurement"]'),
                chart: visible('[aria-label="Measurement chart"]'),
                smoothing: visible('[aria-label="Smoothing"]'),
                chartAxes: [
                  ...document.querySelectorAll(
                    '.recharts-cartesian-axis-tick-value'
                  )
                ]
                  .slice(0, 4)
                  .map((element) => {
                    return {
                      text: element.textContent,
                      font: getComputedStyle(element).fontFamily,
                      size: getComputedStyle(element).fontSize
                    };
                  }),
                clippedControls: [
                  ...document.querySelectorAll('button, label, select')
                ]
                  .filter((element) => {
                    const box = element.getBoundingClientRect();
                    return (
                      box.width > 1 &&
                      box.height > 1 &&
                      element.scrollWidth > element.clientWidth + 1 &&
                      getComputedStyle(element).overflowX === 'hidden'
                    );
                  })
                  .map((element) => {
                    return element.textContent.trim();
                  })
              };
            }))
          });
          return;
        };
        for (const [state, path] of [
          ['home', '/'],
          ['privacy', '/privacy'],
          ['limitations', '/limitations'],
          ['empty', '/tools/gpx-file-viewer']
        ]) {
          await navigate(path);
          await capture(state);
        }
        await page.getByLabel('GPX file', { exact: true }).setInputFiles({
          name: 'typography-sample.gpx',
          mimeType: 'application/gpx+xml',
          buffer: Buffer.from(recording)
        });
        await expect(
          page.getByRole('button', { name: 'Change GPX file' })
        ).toBeVisible();
        await page.locator('.recharts-line-curve').waitFor();
        await capture('loaded');
        const chart = page.getByRole('region', {
          name: 'Measurement chart',
          exact: true
        });
        await chart.evaluate((element) => {
          element.scrollIntoView({ block: 'start' });
          return;
        });
        const position = page.getByRole('slider', {
          name: 'Position on route'
        });
        await position.press('ArrowRight');
        const selection = page.getByLabel('Selected measurement', {
          exact: true
        });
        await expect(selection).toContainText('At 0.1 km');
        // Bring the drawn target into view. Enlarged text can separate it from its controls.
        await chart.evaluate((element) => {
          element.scrollIntoView({ block: 'start' });
          return;
        });
        await page.locator('.recharts-line-curve').scrollIntoViewIfNeeded();
        const coordinate = await page
          .locator('.recharts-line-curve')
          .evaluate((element) => {
            const point = element.getPointAtLength(
              element.getTotalLength() / 2
            );
            const matrix = element.getScreenCTM();
            if (!matrix) throw new Error('Missing chart transform');
            const position = new DOMPoint(point.x, point.y).matrixTransform(
              matrix
            );
            return { x: position.x, y: position.y };
          });
        if (phone) await page.touchscreen.tap(coordinate.x, coordinate.y);
        else await page.mouse.click(coordinate.x, coordinate.y);
        await expect(selection).toContainText('At 4.0 km');
        await capture('line-feedback');
        await chart.evaluate((element) => {
          element.scrollIntoView({ block: 'start' });
          return;
        });
        await capture('selected');
        await page
          .getByRole('combobox', { name: 'Display units' })
          .selectOption('imperial');
        await expect(selection).toContainText('ft');
        await chart.evaluate((element) => {
          element.scrollIntoView({ block: 'start' });
          return;
        });
        await capture('imperial');
        if (phone) {
          const before = await selection.textContent();
          await page.getByRole('button', { name: 'View on map' }).tap();
          await expect(page.getByRole('dialog')).toBeVisible();
          await expect(
            page.getByRole('img', { name: /Selected map position:/ })
          ).toBeVisible();
          await capture('map');
          await page.getByRole('button', { name: 'Back to chart' }).tap();
          await expect(selection).toHaveText(before);
        }
        await page.getByLabel('GPX file', { exact: true }).setInputFiles({
          name: `${'Long recording name '.repeat(8)}.gpx`,
          mimeType: 'application/gpx+xml',
          buffer: Buffer.from(missingTime)
        });
        await expect(
          page.getByText('Elapsed time needs valid start and finish times.')
        ).toBeVisible();
        await page.getByText('File details', { exact: true }).first().click();
        await page
          .getByText('Filename:', { exact: false })
          .scrollIntoViewIfNeeded();
        await capture('details');
        await context.close();
        console.log(prefix);
      }
    }
  }
  // Exercise a failed font download, with the same content and explicit system fallback.
  for (const font of ['inter', 'source']) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      colorScheme: 'light',
      hasTouch: true
    });
    await context.route('**/*', async (route) => {
      const url = route.request().url();
      if (!url.startsWith(origin) || url.includes('/__typography/fonts/'))
        await route.abort();
      else await route.continue();
      return;
    });
    const page = await context.newPage();
    await page.goto(`${origin}/?font=${font}`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      return;
    });
    await page.screenshot({
      path: `${output}/${font}-375x667-100-fallback-home.png`
    });
    await page.goto(`${origin}/tools/gpx-file-viewer?font=${font}`);
    await page.getByLabel('GPX file', { exact: true }).setInputFiles({
      name: 'typography-sample.gpx',
      mimeType: 'application/gpx+xml',
      buffer: Buffer.from(recording)
    });
    await expect(
      page.getByRole('button', { name: 'Change GPX file' })
    ).toBeVisible();
    await page.screenshot({
      path: `${output}/${font}-375x667-100-fallback-loaded.png`
    });
    evidence.push({
      font,
      state: 'fallback',
      viewport: { width: 375, height: 667 },
      text: 100,
      ...(await page.evaluate(() => {
        return {
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          fontStatus: [...document.fonts].map((face) => {
            return { family: face.family, status: face.status };
          })
        };
      }))
    });
    await context.close();
  }
  await writeFile(
    'docs/typography/evidence.json',
    JSON.stringify(evidence, null, 2) + '\n'
  );
} finally {
  await browser?.close();
  server.kill();
}
