import { createRequire } from 'node:module';
import path from 'node:path';
import { copyFileSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const mapLibreDirectory = path.join(
  path.dirname(require.resolve('maplibre-gl/package.json')),
  'dist'
);
const destinationDirectory = path.join(process.cwd(), 'public', 'maplibre');

mkdirSync(destinationDirectory, { recursive: true });

for (const filename of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(path.join(mapLibreDirectory, filename), path.join(destinationDirectory, filename));
}
