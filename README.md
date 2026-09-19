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

CI runs the `Complete quality suite` check for every PR targeting `master`, push
to `master`, and merge queue candidate. The protected `master` branch requires a
pull request and this passing check, including for administrators; direct pushes,
force pushes, deletions, and bypasses are disabled.

## Checks

```sh
pnpm test --runInBand
pnpm tsc
pnpm lint
pnpm knip
pnpm format:check
pnpm build
pnpm exec playwright install --with-deps chrome
pnpm test:browser --workers=2
```

The production build is a static export written to `out/`. The type-check command
generates Next.js route types first, so it also works from a clean checkout.

The Playwright setup serves that export locally and blocks external OpenStreetMap
tile requests by default. Browser cases that need owner-provided GPX recordings or
an operator-disabled basemap remain explicit skips when their environment variables
are absent. These skips are expected in CI; any ordinary test failure fails the
required check.

To troubleshoot the check, open its first failing step and run the matching command
above from a frozen-lockfile install. If a browser cannot start locally, rerun the
Playwright install command before the browser suite. Do not add private GPX files,
credentials, or browser artifacts to CI logs or uploads.

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
