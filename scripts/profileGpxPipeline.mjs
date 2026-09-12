import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';

// Load trusted repository TypeScript without changing or instrumenting application files.
// This process-local harness is diagnostic; browser results remain the product evidence.
const require = createRequire(import.meta.url);
const modules = new Map();
const loadSource = (path) => {
  const filename = existsSync(`${path}.ts`) ? `${path}.ts` : resolve(path, 'index.ts');
  if (modules.has(filename)) return modules.get(filename).exports;
  const loadedModule = { exports: {} };
  modules.set(filename, loadedModule);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier.startsWith('@/')) return loadSource(resolve('src', specifier.slice(2)));
    if (specifier.startsWith('.')) return loadSource(resolve(dirname(filename), specifier));
    return require(specifier);
  };
  new Function('require', 'module', 'exports', code)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
};
const { parseGpx } = loadSource(resolve('src/parsers/gpx'));
const { createMeasurementStore } = loadSource(resolve('src/analysis/prepared-measurements'));
const timings = {};
const measure = (name, action) => {
  const start = performance.now();
  const result = action();
  timings[name] = (timings[name] || 0) + performance.now() - start;
  return result;
};
// Instrument installed parser methods only within this short-lived Node process.
for (const [prototype, method, name] of [
  [require('saxes').SaxesParser.prototype, 'write', 'xmlExtractionMs']
]) {
  const original = prototype[method];
  prototype[method] = function (...args) {
    return measure(name, () => { return original.apply(this, args); });
  };
}
const directory = process.env.GPX_PROFILE_DIR || '/tmp/gpsgoblin-profiles';
const cases = (process.env.GPX_BENCHMARK_POINTS || '10000,50000,100000,250000').split(',').map(Number).map(points => {
  return { name: `${points}-points`, path: resolve(directory, `synthetic-${points}.gpx`) };
});
cases.unshift({ name: 'sanitised-recording', path: resolve('tests/fixtures/gpx/strava-recording.gpx') });
if (process.env.GPX_VERIFY_FILE) cases.unshift({ name: 'private-recording', path: process.env.GPX_VERIFY_FILE });
console.log(JSON.stringify({ runtime: process.version, note: 'Node phase isolation; not browser timing or device memory capacity' }));
for (const scenario of cases) {
  for (let run = 1; run <= 3; run++) {
    for (const name of Object.keys(timings)) delete timings[name];
    global.gc?.();
    const beforeMiB = process.memoryUsage().heapUsed / 1024 ** 2;
    const xml = measure('readMs', () => { return readFileSync(scenario.path, 'utf8'); });
    const parsed = measure('parseMs', () => { return parseGpx(xml); });
    if (!parsed.ok) throw new Error(`Benchmark input rejected: ${scenario.name}`);
    const afterParseMiB = process.memoryUsage().heapUsed / 1024 ** 2;
    const document = measure('cloneMs', () => { return structuredClone(parsed.document); });
    const measurements = measure('analysisAndPackingMs', () => { return createMeasurementStore(document); });
    const view = measure('displayMs', () => { return measurements.prepareView({ entityId: document.tracks[0].id, units: 'metric', motion: 'speed', smoothingSeconds: 60 }); });
    global.gc?.();
    console.log(JSON.stringify({ scenario: scenario.name, run, points: view.analysis.metrics.length / 4, displayedPoints: view.display.length / 3,
      ...Object.fromEntries(Object.entries(timings).map(([name, value]) => { return [name, Math.round(value)]; })),
      adapterOutsideXmlMs: Math.round(timings.parseMs - timings.xmlExtractionMs),
      heapBeforeMiB: Math.round(beforeMiB), heapAfterParseMiB: Math.round(afterParseMiB),
      retainedHeapMiB: Math.round(process.memoryUsage().heapUsed / 1024 ** 2) }));
  }
}
