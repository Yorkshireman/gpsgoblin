# Public discovery — issue #6

## Scope and release status

The permanent viewer URL is `/tools/gpx-file-viewer`. The homepage lists only
this available tool and uses “Free tools for GPS and activity files.” The tool
precedes supporting instructions, supported data, result meanings and limitations.
`/privacy` and `/limitations` contain supporting information, linked in the footer.
No structured data, product analytics, advertisements or consent platform is added.

**Contact details are indefinitely deferred by the owner (14 September 2026).**
There is no deadline or commitment to provide them; the owner may choose to
revisit this much later, or not at all. Do not prompt for contact setup during
unrelated work. This deferral does not resolve the existing release criterion.
No email,
owner identity or contact channel is invented. There is no placeholder contact
page. The contact acceptance criterion and O5 remain open; this implementation
must not be described as completing #6 or authorising public release.

`src/app/siteMetadata.ts` fixes the public origin to `https://gpsgoblin.com`.
All four pages use that origin for canonical and Open Graph metadata; sitemap
and robots use the same setting. The sitemap explicitly lists only those pages.
Metadata and URLs never derive from imported data. No unfinished tool, preview
host, workers.dev address or individual result is included.

## Privacy and third-party inventory

The public wording lives in `src/app/privacy/page.tsx`. It describes the shipped
code, not a completed legal assessment. Supplier policies were checked on
14 September 2026; hosting-specific configuration still needs release verification.

| Boundary | Requests and storage | Evidence / outstanding work |
| --- | --- | --- |
| Cloudflare Workers Static Assets | Serves public HTML and assets; receives IP address and requested paths, not imported file contents | Agreed hosting in product spec §20; [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/). Verify actual deployed headers, enabled services, logs and retention before resolving O5. |
| OpenStreetMap Foundation | `tile.openstreetmap.org` receives viewed tile coordinates, IP address and origin Referer; local route overlay and imported file are not sent | [Basemap assessment](basemap.md), request sample and [OSMF privacy policy](https://osmfoundation.org/wiki/Privacy_Policy). Recheck deployed-host network behaviour at release. |
| Application and bundled dependencies | Local parsing, analysis and maps; no remote fonts, geocoding, activity URL fetching, product analytics, ads or error-reporting service | Source inspection and existing browser privacy checks. No new remote integration in #6. |
| Browser storage and cache | File and results remain in the open viewer session. Browser may cache assets/tiles. `next-themes` reads the `theme` preference and can write it when changed; no appearance control is currently exposed | Provider and installed next-themes implementation inspected. Activity data is not persisted in browser storage. |

No advertising/analytics consent choice is displayed because neither service is
implemented. O6 and O7 remain unresolved and disabled. This is a description of
current behaviour, not a conclusion that future integrations need no consent.
Contact identity/channel, final privacy assessment, security headers/CSP and
hosting-side inventory remain O5 release work. No arbitrary retention promises
or owner details have been added.

Issue #7 subsequently adds build-generated headers/CSP and enforced local browser
checks; see the [release verification record](release-readiness.md). Deployed
verification and the deferred contact details still prevent closing O5.

## Compatibility claims

The limitations page draws its named engine and workload examples from
[large-file support](large-file-support.md), [GPX support](gpx-support.md) and
[fixture provenance](../tests/fixtures/gpx/README.md). It distinguishes synthetic
workloads and sanitised examples from universal exporter support, desktop engine
checks from physical devices, and measured examples from product limits. It does
not claim FIT/TCX, GPX 1.0, sensor extensions, conversion or file repair support.

## Deployment boundaries

This ticket prepares local static output. No deployment, push, PR publication,
merge or issue closure is authorised by this work. Before release, verify useful
HTML and direct clean-path links on the actual host; production metadata/indexing;
custom-domain direct paths and a disabled default production workers.dev route; and noindex on both
version and branch-alias preview hosts. Local robots allows crawling and must not be used
as evidence of preview noindex. Do not publicly release while the deferred contact/O5
requirements or other relevant Stage 1 gates remain open.

## Verification — 14 September 2026

- `pnpm tsc --incremental false`: passed.
- `pnpm lint`: passed.
- `pnpm knip`: passed with no findings.
- `pnpm test src/app/tools/gpx-file-viewer/page.test.tsx --runInBand --silent`:
  33 passed. Two existing assertions now wait for asynchronous import/map output;
  both had failed by reading before the requested result appeared.
- `pnpm test --runInBand --silent`: 174 tests across 14 suites passed after those
  assertion fixes. No parser, measurement or import behaviour changed.
- `pnpm build`: static export passed, including all four pages, sitemap and robots.
- Python HTML-parser inspection of `out/`: useful text and links are present
  without JavaScript; unique metadata uses the production origin; sitemap lists
  exactly four intended URLs; robots references the production sitemap. Production
  pages are not marked noindex in the export.
- `pnpm exec playwright test tests/browser/workspace.spec.ts --config
  /private/tmp/gpsgoblin-discovery-playwright.config.ts --workers=2`: four passed.
  The temporary configuration serves `out/` on port 4178 and retains the existing
  synthetic-data and blocked-OSM-tile fixtures. No automated requests hit OSM.
- `node /private/tmp/gpsgoblin-discovery-qa.mjs`: local Chrome navigation and
  screenshots at 1440×900, 1280×720, 390×844 and 375×667. Direct supporting pages
  return 200; homepage → viewer, viewer → limitations, footer → privacy → home
  work. Desktop primary navigation uses keyboard Enter; phone primary navigation
  uses touch. No page errors or horizontal overflow were observed. A temporary
  server on port 4179 maps clean paths to exported HTML, so these checks do not
  establish the actual Cloudflare host's routing behaviour.

Whole-page copy and initial viewport screenshots were inspected for the homepage,
privacy and limitations pages. The homepage tool link remains above the fold in
all four sizes. Supporting pages use normal document scrolling with readable text;
the small phone needs scrolling for the final footer links. Viewer screenshots
confirm the chooser remains ahead of longer guidance, the loaded phone shows its
summary and chart, and desktop chart selection stays beside its map feedback.
Existing workspace checks exercise all four sizes, selected values, smoothing,
units, phone map return/focus, long names and enlarged text. No physical-device
or human usability testing is claimed. Local screenshots and QA reports are in
`/private/tmp/gpsgoblin-discovery-qa` and
`/private/tmp/gpsgoblin-discovery-browser-results`; they contain only synthetic data.

## Standards review

Independent review against the branch base
`65d50ee97a3f0ef78b50cbf03c29e8cb69c64f08`: zero outstanding findings. One privacy
sentence describing an “appearance library” was replaced with a plain-language
explanation of the saved light/dark preference; the reviewer confirmed resolution.

## Spec review

Independent review: zero actionable findings for the implemented scope. Contact/O5
and actual-host verification remain explicitly partial, as recorded above. No
scope creep or unsupported compatibility claims were found.
