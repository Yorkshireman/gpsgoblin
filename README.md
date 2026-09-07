# GPSGoblin

Free tools for GPS and activity files.

GPSGoblin processes files in the browser. Files and filenames are not uploaded.

## Current tool

The GPX File Viewer opens GPX 1.1 track recordings, displays their route and
segments, and calculates geometric distance from the recorded GPS points.

See [GPX support](docs/gpx-support.md) for the tested format scope and current
limitations.

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

## Checks

```sh
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
