import { chromium } from '@playwright/test';
import os from 'node:os';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Workload sizes and the automation timeout are investigation settings, never app limits.
const track = (count) => {
  const points = Array.from({ length: count }, (_, index) => {
    return `<trkpt lat="0" lon="${(index * 0.00001).toFixed(5)}"><ele>${100 + index % 100}</ele><time>${new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString()}</time></trkpt>`;
  }).join('');
  return `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>${points}</trkseg></trk></gpx>`;
};
const outputDirectory = process.env.GPX_PROFILE_DIR || '/tmp/gpsgoblin-profiles';
mkdirSync(outputDirectory, { recursive: true });
const counts = (process.env.GPX_BENCHMARK_POINTS || '10000,50000,100000,250000').split(',').map(Number);
const cases = counts.map(count => {
  const path = resolve(outputDirectory, `synthetic-${count}.gpx`);
  writeFileSync(path, track(count));
  return { name: `${count}-points`, path };
});
cases.unshift({ name: 'sanitised-recording', path: resolve('tests/fixtures/gpx/strava-recording.gpx') });
// Private input is used by its local path, never copied into artifacts or logs.
if (process.env.GPX_VERIFY_FILE) {
  cases.unshift({ name: 'private-recording', path: process.env.GPX_VERIFY_FILE });
}
const browser = await chromium.launch({ channel: 'chrome' });
console.log(JSON.stringify({ browser: await browser.version(), cpu: os.cpus()[0]?.model,
  memoryGiB: os.totalmem() / 1024 ** 3, os: `${os.platform()} ${os.release()}`, arch: os.arch() }));
try {
  for (const cpuRate of (process.env.GPX_CPU_RATES || '1,4').split(',').map(Number)) {
    for (const scenario of cases.filter(item => {
      return !process.env.GPX_BENCHMARK_CASE || item.name.includes(process.env.GPX_BENCHMARK_CASE);
    })) {
      for (let run = 1; run <= Number(process.env.GPX_BENCHMARK_RUNS || 3); run++) {
        const viewport = process.env.GPX_PHONE ? { width: 390, height: 844 } : { width: 1280, height: 720 };
        const page = await browser.newPage({ viewport });
        page.setDefaultTimeout(60000);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
        await cdp.send('Performance.enable');
        await page.addInitScript(() => {
          window.importProfile = { tasks: [], events: {} };
          const mark = (name) => { window.importProfile.events[name] = performance.now(); };
          document.addEventListener('change', event => {
            if (event.target instanceof HTMLInputElement && event.target.type === 'file' && !window.importProfile.events.input) mark('input');
          }, true);
          const OriginalWorker = window.Worker;
          window.Worker = class extends OriginalWorker {
            constructor(url, options) {
              super(url, options);
              if (String(url).includes('turbopack-worker')) {
                mark('workerCreated');
                this.addEventListener('message', () => { mark('workerDelivered'); }, { once: true });
              }
            }
          };
          new PerformanceObserver(list => {
            window.importProfile.tasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, ms: entry.duration })));
          }).observe({ type: 'longtask' });
        });
        await page.goto('http://127.0.0.1:4173/tools/gpx-file-viewer.html');
        await page.getByRole('button', { name: 'Choose GPX file' }).waitFor();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const before = await cdp.send('Performance.getMetrics');
        await cdp.send('Profiler.enable');
        await cdp.send('Profiler.start');
        let outcome = 'loaded';
        try {
          // A real local file avoids allocating a large base64 upload buffer on the page.
          await page.getByLabel('GPX file', { exact: true }).setInputFiles(scenario.path);
          const failure = page.getByText('Unable to open GPX file', { exact: true });
          await page.getByRole('slider', { name: 'Position on route' }).or(failure).first().waitFor();
          if (await failure.isVisible()) outcome = 'rejected';
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.evaluate(() => { window.importProfile.events.painted = performance.now(); });
        } catch {
          outcome = 'automation-timeout-or-page-failure';
        }
        const { profile } = await cdp.send('Profiler.stop');
        // CPU profiles contain function names and static asset URLs, not recording contents.
        writeFileSync(resolve(outputDirectory, `${scenario.name}-${cpuRate}-${run}.cpuprofile`), JSON.stringify(profile));
        const after = await cdp.send('Performance.getMetrics');
        const imported = await page.evaluate(() => window.importProfile);
        let selectionMs;
        let chartClickMs;
        let smoothingMs;
        let sourcePoints;
        let drawnVertices;
        if (outcome === 'loaded') {
          sourcePoints = Number(await page.getByRole('slider', { name: 'Position on route' }).getAttribute('max')) + 1;
          const path = await page.locator('.recharts-line-curve').getAttribute('d');
          drawnVertices = (path?.match(/[ML]/g) || []).length;
          const start = performance.now();
          await page.getByRole('slider', { name: 'Position on route' }).press('ArrowRight');
          await page.getByLabel('Selected measurement', { exact: true }).waitFor();
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          selectionMs = Math.round(performance.now() - start);
          const hitArea = page.locator('.measurement-selection-area');
          const bounds = await hitArea.boundingBox();
          if (bounds) {
            const clickStart = performance.now();
            await hitArea.click({ position: { x: bounds.width / 2, y: bounds.height / 2 } });
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            chartClickMs = Math.round(performance.now() - clickStart);
          }
          const smoothingStart = performance.now();
          await page.getByRole('slider', { name: 'Smoothing' }).press('ArrowRight');
          await page.waitForFunction(() => {
            return document.querySelector('[aria-label="Measurement chart"]')?.getAttribute('aria-busy') === 'false';
          }, undefined, { timeout: 60000 });
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          smoothingMs = Math.round(performance.now() - smoothingStart);
        }
        const metric = (response, name) => { return response.metrics.find(item => item.name === name)?.value || 0; };
        const { input, workerCreated, workerDelivered, painted } = imported.events;
        const tasks = imported.tasks.filter(task => { return task.start >= input; });
        const data = { scenario: scenario.name, bytes: readFileSync(scenario.path).length, cpuRate, run, viewport, outcome,
          workerToPaintMs: Math.round(painted - workerCreated), workerRoundTripMs: Math.round(workerDelivered - workerCreated),
          afterWorkerMs: Math.round(painted - workerDelivered), selectionMs, chartClickMs, smoothingMs, sourcePoints, drawnVertices,
          maxMainThreadTaskMs: Math.round(tasks.reduce((max, task) => Math.max(max, task.ms), 0)),
          mainThreadScriptMs: Math.round(1000 * (metric(after, 'ScriptDuration') - metric(before, 'ScriptDuration'))),
          layoutMs: Math.round(1000 * (metric(after, 'LayoutDuration') - metric(before, 'LayoutDuration'))),
          pageHeapUsedMiB: Math.round(metric(after, 'JSHeapUsedSize') / 1024 ** 2) };
        console.log(JSON.stringify(data));
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
