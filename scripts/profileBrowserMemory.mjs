import { chromium } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

// Investigation settings, never application limits. Run separately from builds/tests.
// RSS includes shared pages/process overhead; 100 ms sampling can miss transient peaks.
const executeFile = promisify(execFile);
const profileDirectory = process.env.GPX_PROFILE_DIR || '/tmp/gpsgoblin-memory-profiles';
mkdirSync(profileDirectory, { recursive: true });
const counts = (process.env.GPX_MEMORY_POINTS || '250000').split(',').map(Number);
const variants = (process.env.GPX_MEMORY_VARIANTS || 'plain').split(',');
const runs = Number(process.env.GPX_MEMORY_RUNS || 3);
const viewport = process.env.GPX_PHONE ? { width: 390, height: 844 } : { width: 1280, height: 720 };
const baseUrl = process.env.GPX_PROFILE_URL || 'http://127.0.0.1:4173';
if (!counts.every(count => Number.isSafeInteger(count) && count > 1)
  || !Number.isSafeInteger(runs) || runs < 1
  || !variants.every(variant => ['plain', 'extensions', 'fragmented'].includes(variant))) {
  throw new Error('Invalid profiling workload settings.');
}

const syntheticRecording = (count, variant) => {
  const points = Array.from({ length: count }, (_, index) => {
    const segment = variant === 'fragmented' && index > 0 && index % 20 === 0;
    const missing = variant === 'fragmented' && index % 20 === 10;
    const extension = variant === 'extensions'
      ? `<extensions><x:metrics><x:note>${'synthetic payload '.repeat(16)}</x:note><x:hr>140</x:hr><x:cadence>80</x:cadence><x:power>250</x:power></x:metrics></extensions>`
      : '';
    return `${segment ? '</trkseg><trkseg>' : ''}<trkpt lat="0" lon="${(index * 0.00001).toFixed(5)}">${missing ? '' : `<ele>${100 + index % 100}</ele><time>${new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString()}</time>`}${extension}</trkpt>`;
  }).join('');
  return `<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:x="urn:gpsgoblin:synthetic-extension"><trk><trkseg>${points}</trkseg></trk></gpx>`;
};

const cases = [{ name: 'sanitised-recording', path: resolve('tests/fixtures/gpx/strava-recording.gpx') }];
if (process.env.GPX_VERIFY_FILE) {
  cases.unshift({ name: 'private-recording', path: process.env.GPX_VERIFY_FILE });
}
for (const count of counts) {
  for (const variant of variants) {
    const name = `${variant}-${count}-points`;
    const path = resolve(profileDirectory, `${name}.gpx`);
    writeFileSync(path, syntheticRecording(count, variant));
    cases.push({ name, path });
  }
}

const browserRss = async (rootPid) => {
  const { stdout } = await executeFile('ps', ['-axo', 'pid=,ppid=,rss=']);
  const processes = stdout.trim().split('\n').map(line => {
    const [pid, parentPid, rssKiB] = line.trim().split(/\s+/).map(Number);
    return { pid, parentPid, rssKiB };
  });
  const descendants = new Set([rootPid]);
  let previousSize;
  do {
    previousSize = descendants.size;
    for (const process of processes) {
      if (descendants.has(process.parentPid)) descendants.add(process.pid);
    }
  } while (descendants.size !== previousSize);
  const members = processes.filter(process => descendants.has(process.pid));
  return {
    rssBytes: members.reduce((sum, process) => sum + process.rssKiB * 1024, 0),
    processes: members.length
  };
};

const afterPaint = async (page) => {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return;
};

console.log(JSON.stringify({
  kind: 'environment', cpu: os.cpus()[0]?.model, memoryBytes: os.totalmem(),
  os: `${os.platform()} ${os.release()}`, arch: os.arch(), viewport,
  rssSamplingIntervalMs: 100, loadedObservationTailMs: 1000,
  interpretation: 'Sampled sum of RSS for a fresh browser process and its descendants; includes shared pages and overhead, excludes Node and other applications, may miss short-lived peaks. Paired WebGL-disabled trials estimate incremental map work, not an exact isolated map cost.'
}));

for (const scenario of cases.filter(scenario => !process.env.GPX_MEMORY_CASE || scenario.name.includes(process.env.GPX_MEMORY_CASE))) {
  for (let run = 1; run <= runs; run += 1) {
    // Alternate the paired order to reduce systematic warm-cache ordering effects.
    for (const mapEnabled of run % 2 ? [true, false] : [false, true]) {
      let server;
      let browser;
      const samples = [];
      const sampleFailures = [];
      let pendingSample;
      let timer;
      const sample = () => {
        if (pendingSample) return pendingSample;
        pendingSample = (async () => {
          try {
            samples.push({ milliseconds: performance.now(), ...await browserRss(server.process().pid) });
          } catch (error) {
            sampleFailures.push(error instanceof Error ? error.name : 'Unknown sampling error');
          } finally {
            pendingSample = undefined;
          }
        })();
        return pendingSample;
      };
      try {
        server = await chromium.launchServer({ channel: 'chrome' });
        browser = await chromium.connect(server.wsEndpoint());
        const page = await browser.newPage({ viewport, hasTouch: viewport.width < 600 });
        page.setDefaultTimeout(60000);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Performance.enable');
        await page.addInitScript(({ mapEnabled }) => {
          window.memoryProfile = { tasks: [], input: null };
          if (!mapEnabled) Object.defineProperty(window, 'WebGLRenderingContext', { value: undefined });
          document.addEventListener('change', event => {
            if (event.target instanceof HTMLInputElement && event.target.type === 'file') {
              window.memoryProfile.input = performance.now();
            }
          }, true);
          new PerformanceObserver(list => {
            window.memoryProfile.tasks.push(...list.getEntries().map(entry => ({ start: entry.startTime, ms: entry.duration })));
          }).observe({ type: 'longtask' });
        }, { mapEnabled });
        await page.goto(`${baseUrl}/tools/gpx-file-viewer.html`);
        await page.getByRole('button', { name: 'Choose GPX file' }).waitFor();
        await afterPaint(page);
        await sample();
        const baselineRssBytes = samples.at(-1)?.rssBytes;
        timer = setInterval(() => { void sample(); }, 100);
        let outcome = 'loaded';
        let mapOutcome = mapEnabled ? 'not-checked' : 'disabled-for-comparison';
        let sourcePoints;
        let chartPaintMs;
        let selectionPaintMs;
        let mapSelectionReadyMs;
        try {
          await page.getByLabel('GPX file', { exact: true }).setInputFiles(scenario.path);
          const failure = page.getByText('Unable to open GPX file', { exact: true });
          const position = page.getByRole('slider', { name: 'Position on route' });
          await position.or(failure).first().waitFor();
          if (await failure.isVisible()) {
            outcome = 'rejected';
          } else {
            await afterPaint(page);
            chartPaintMs = await page.evaluate(() => Math.round(performance.now() - window.memoryProfile.input));
            sourcePoints = Number(await position.getAttribute('max')) + 1;
            const selectionStart = performance.now();
            await position.press('End');
            await page.getByLabel('Selected measurement', { exact: true }).waitFor();
            await afterPaint(page);
            selectionPaintMs = Math.round(performance.now() - selectionStart);
            if (mapEnabled) {
              const mapStart = performance.now();
              if (viewport.width < 600) await page.getByRole('button', { name: 'View on map' }).click();
              const marker = page.getByRole('img', { name: /^Selected map position:/ });
              const unavailable = page.getByText('Map unavailable', { exact: true });
              await marker.or(unavailable).first().waitFor();
              mapOutcome = await marker.isVisible() ? 'selected-position-ready' : 'unavailable';
              await afterPaint(page);
              mapSelectionReadyMs = Math.round(performance.now() - mapStart);
            }
          }
        } catch (error) {
          outcome = error instanceof Error ? error.name : 'Unknown browser failure';
        }
        // Keep observing initial map-worker processing after the marker/UI is ready.
        // This is a documented sampling window, not proof every map tile has finished.
        await new Promise(resolve => setTimeout(resolve, 1000));
        clearInterval(timer);
        timer = undefined;
        await pendingSample;
        await sample();
        const profile = await page.evaluate(() => window.memoryProfile).catch(() => null);
        const metrics = await cdp.send('Performance.getMetrics').catch(() => ({ metrics: [] }));
        const heapBytes = metrics.metrics.find(metric => metric.name === 'JSHeapUsedSize')?.value;
        const tasks = profile?.tasks.filter(task => task.start >= profile.input) ?? [];
        const peak = samples.reduce((peak, next) => next.rssBytes > peak.rssBytes ? next : peak, { rssBytes: 0, processes: 0 });
        console.log(JSON.stringify({
          kind: 'trial', scenario: scenario.name, bytes: statSync(scenario.path).size,
          browser: browser.version(), run, mapEnabled, viewport, outcome, mapOutcome, sourcePoints,
          chartPaintMs, selectionPaintMs, mapSelectionReadyMs,
          maximumMainThreadTaskMs: Math.round(tasks.reduce((max, task) => Math.max(max, task.ms), 0)),
          baselineRssBytes, sampledPeakRssBytes: peak.rssBytes,
          sampledPeakAboveBaselineBytes: baselineRssBytes === undefined ? undefined : peak.rssBytes - baselineRssBytes,
          sampledFinalRssBytes: samples.at(-1)?.rssBytes,
          processCountAtPeak: peak.processes, rssSampleCount: samples.length, sampleFailures,
          pageHeapUsedBytes: heapBytes
        }));
      } catch (error) {
        console.log(JSON.stringify({
          kind: 'trial', scenario: scenario.name, bytes: statSync(scenario.path).size,
          run, mapEnabled, viewport, outcome: 'profiling-setup-failed',
          error: error instanceof Error ? error.name : 'Unknown setup error', sampleFailures
        }));
      } finally {
        clearInterval(timer);
        await pendingSample;
        await browser?.close();
        await server?.close();
      }
    }
  }
}
