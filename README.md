# GPSGoblin

Free tools for GPS and activity files.

GPSGoblin processes files in the browser. Files and filenames are not uploaded.

## Current tool

The GPX File Viewer opens GPX 1.1 track recordings, displays their route and
segments, and calculates geometric distance from the recorded GPS points.

See [GPX support](docs/gpx-support.md) for the tested format scope and current
limitations. Background maps use OpenStreetMap public tiles; map requests reveal
the viewed area while your file stays on your device. See [basemap operation](docs/basemap.md)
for provider terms, verification and the build-time disable switch.

Share links contain the original file, losslessly compressed in a browser worker
using Brotli quality 10 (`brotli-wasm` 3.0.1). New links use the `v2` fragment
format; the viewer also opens existing `v1` gzip links. No file is stored online.
Links remain long and messaging apps can handle them differently. The Content
Security Policy permits WebAssembly compilation with `wasm-unsafe-eval`; ordinary
JavaScript evaluation remains blocked.

## Development

Requirements:

- Node.js 20.9 or newer
- pnpm 12.3.4

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

Open <http://localhost:3000/tools/gpx-file-viewer>.

## Formatting

Prettier covers maintained JavaScript/TypeScript, styles, JSON, YAML, HTML and
Markdown. `.prettierignore` excludes generated output, lockfiles, vendored assets
and skills, captured benchmarks, and external GPX samples.

`pnpm dev` runs the formatter watcher alongside Next.js. The watcher formats disk
writes from both people and agents while it is running. For editing without the
dev server, use `pnpm format:watch`. Formatting happens shortly after a completed
write; stop the watcher when editing is finished.

VS Code recommends the Prettier extension and enables format on save for these
languages. Its folder-open task also starts the watcher once automatic tasks are
allowed in a trusted workspace. Agents format each edit batch explicitly when a
watcher is not running.

`pnpm format` formats all files in scope; `pnpm format:check` checks without writing.
CI runs the check for every PR targeting `master`, pushes to `master`, and merge
queue candidates. The protected `master` branch requires a pull request and a
passing `Prettier` check, including for administrators; direct pushes, force
pushes, deletions, and bypasses are disabled.

## Checks

```sh
pnpm format:check
pnpm tsc
pnpm lint
pnpm test
pnpm build
```

The production build is a static export written to `out/`.

## Stack

The tested Stage 1 stack is:

- Next.js 16.3.4 with the App Router
- React 19.2.8
- TypeScript 5
- Chakra UI 3.37.0
- MapLibre GL JS 6.7.0
- Jest 30 with React Testing Library
- pnpm 12.3.4

Exact dependency versions and resolutions are recorded in `package.json` and
`pnpm-lock.yaml`.

## Product direction

The agreed product scope and release stages are documented in
[the product specification](docs/product-spec.md).
