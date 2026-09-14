# Stage 1 release verification — issue #7

Status: **not ready for public release**. Contact details are indefinitely deferred
by the owner, with no deadline or commitment to revisit them. Contact setup is
not an active task; the existing release criterion remains unresolved.
This record covers the local release candidate on
`feat/7-release-verification`, based on `320130a` (draft PR #20). It does not record
a deployment, approval to merge, or closure of #6/#7.

## Release gates

| Gate | Evidence and remaining boundary |
| --- | --- |
| O2 basemap | Resolved supplier choice: [basemap assessment](basemap.md). Synthetic tile success, failure and local route fallback are exercised. Actual-host requests still need verification. |
| O3, GPX portion | ISC-licensed saxes 6.0.0; GPX 1.1 tracks, routes and waypoints, explicit rejection and extension policy in [GPX support](gpx-support.md). [Fixture provenance](../tests/fixtures/gpx/README.md) distinguishes synthetic, sanitised Strava and Bikerouter examples. FIT/TCX remain later stages. |
| O4 | [Large-file evidence](large-file-support.md) and the public limitations page distinguish desktop engines and emulated phones from physical devices. No universal file limit or physical-phone performance claim. Physical-device verification remains open. |
| O5 | Local header/CSP implementation and privacy checks below. **Owner contact channel deferred**; final privacy assessment, deployed headers and hosting-side services/logging inventory remain open. |
| Actual hosts | Production canonical/indexing, path/query-preserving pages.dev redirects, and noindex on both hash and branch previews remain unverified. Local checks cannot close these gates. |
| O6–O11 | Analytics and ads remain disabled; later format, merge, comparison and efficiency decisions are outside this Stage 1 verification. |

## Security policy and build

`pnpm build` generates the static export and then runs
`scripts/writeSecurityHeaders.mjs`. It hashes the exact inline Next hydration and
theme scripts in every exported HTML file, including error pages, and writes
`out/_headers`. Rebuild the headers with every export; publish the complete `out/`
directory atomically. Do not copy headers from an earlier build.

The policy permits bundled scripts and workers from the same origin, plus only
the exact build's inline script hashes. It prohibits inline event handlers,
eval, plugins, framing and form submissions. MapLibre fetches OSM raster tiles
through `connect-src`; inline image data and local image blobs are allowed for
rendering. Chakra/Emotion and chart/map positioning still require inline styles:
`style-src 'unsafe-inline'` is an explicit compromise, not a claim of complete
CSS injection protection. Script permission is not extended to third parties.

The export also sets `nosniff`, `DENY` framing, origin-only cross-origin referrers
and disables camera, microphone and geolocation permissions. CSP limits resource
loading; it cannot guarantee that trusted same-origin JavaScript never transmits
data. That is why request inspection remains a separate check.

[Cloudflare Pages headers documentation](https://developers.cloudflare.com/pages/configuration/headers/)
defines the `_headers` deployment format and 2,000-character line limit. The
generator fails the build if a line exceeds that limit. Next's installed
`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` explains
why per-request nonces require dynamic rendering; this project uses static
export, so its exact inline scripts are hashed after rendering instead.

Cloudflare HTML/script rewriting or injected services can invalidate hashes or
introduce unapproved third parties. Verify the deployed response and console;
do not relax the policy to accommodate an unexplained injection. HSTS and other
host-managed settings must be assessed on the real HTTPS host.

## Privacy and asset verification

`releaseSecurity.spec.ts` observes request URLs, methods, bodies and headers
through import, point inspection, failed tile loading, replacement and clear.
The synthetic fixture has recognisable filename, label, coordinates, timestamp,
elevation and sensor-extension values. It permits only same-origin GET/HEAD
asset requests and exact OSM tile URLs; none of the canaries may appear in a
request. It also checks browser storage after clear. Sensor extensions are
intentionally ignored by the GPX adapter, not advertised as supported metrics.

No public OSM tiles are fetched by automated checks. Routes abort those requests
or supply a synthetic image. A tile URL necessarily identifies the viewed area;
the test does not claim geographic anonymity. [Public discovery](public-discovery.md)
records the hosting, tile and browser-storage boundaries.

The static asset check rejects private recording/fixture/environment paths and
known private-key, AWS access-key and GitHub token signatures without printing
matched secrets. This is a bounded scan, not proof against every possible secret
format. Source inspection found only the public basemap-disable build setting in
application environment accesses, and no configured telemetry or error collector.

## Local verification setup

Both Playwright configurations start `scripts/serveStaticExport.py`. It serves
clean URLs and applies the generated global header rule to responses; it refuses
unsupported rule syntax. Server reuse is disabled so a stale header-free server
cannot silently invalidate security tests. Choose a free port with
`PLAYWRIGHT_PORT=4187` if 4173 is already occupied. This small test server does
not emulate Cloudflare redirect, caching or preview behaviour.

The tests exercise browser rejection of an unapproved inline script, direct-load
hydration, actual import/measurement workers, MapLibre workers and tile fallback.
Accessibility checks use [Playwright's axe integration](https://playwright.dev/docs/accessibility-testing)
for WCAG A/AA rules in light/dark and reduced-motion contexts. Automated results
do not replace visual, keyboard, touch or assistive-technology testing.

## Verification results

Verification on 14 September 2026 used macOS 26.6.2, Node 24.20.0, pnpm 12.3.4
and Python 3.14.3. All runs served `out/` with the generated headers enforced.

| Browser | Desktop viewport | Emulated phone viewport | Focused workflow/security result |
| --- | --- | --- | --- |
| Chrome 153.0.8010.36 | 1280×720 | 390×844, touch | 18 passed |
| Playwright Firefox 155.0 | 1280×720 | 390×844, touch | 18 passed |
| Playwright WebKit 26.6 | 1280×720 | 390×844, touch | 18 passed |

The focused matrix covers hydration in both route orders, successful replacement
and recovery from a real worker error, chart/map coordination, responsive map
lifecycle, enforced CSP, outbound canaries and the asset scan. These are browser
engine results on a Mac, not native Safari or physical iOS/Android certification.

| Command | Result |
| --- | --- |
| `pnpm test --runInBand --silent` | 176 passed in 15 suites |
| `pnpm tsc --incremental false` | Passed |
| `pnpm lint` | Passed |
| `pnpm knip` | Passed, no findings |
| `pnpm build` | Passed; six exported HTML files, seven unique inline-script hashes |
| `PLAYWRIGHT_PORT=4187 pnpm test:browser --workers=2` | 114 passed; 10 conditional skips |
| `PLAYWRIGHT_PORT=4189 pnpm test:browser:compatibility tests/browser/releaseSecurity.spec.ts tests/browser/measurements.spec.ts tests/browser/measurementReplacement.spec.ts tests/browser/mapLifecycle.spec.ts tests/browser/hydration.spec.ts --output=/private/tmp/gpsgoblin-release-engine-results` | 54 passed |
| `git diff --check` | Passed |

The ten skips are the two operator-disabled-basemap cases (this is an enabled
build) and eight cases requiring optional private recordings that were not supplied
to this run. Checked-in sanitised/synthetic fixtures were exercised, including the
complete sanitised Strava file. No skipped case is described as freshly passed.
Earlier disabled-basemap and performance evidence remains in its original reports.

The full Chrome command also used
`PLAYWRIGHT_JSON_OUTPUT_NAME=/private/tmp/gpsgoblin-release-browser.json`,
`--reporter=list,json` and
`--output=/private/tmp/gpsgoblin-release-browser-results` to retain axe attachments
and synthetic viewport screenshots locally. Logs are
`/private/tmp/gpsgoblin-release-browser-final.log` and
`/private/tmp/gpsgoblin-release-compatibility-final.log`. These temporary files are
not committed or required to rerun the documented commands.

### Failures addressed

- The homepage's white-on-teal button text measured 3.74:1. Its surface variant
  now uses the theme's contrasting foreground/background pair, with keyboard
  focus visible in light and dark mode.
- Summary helper text is now a `dd`, so each statistic is a valid definition list.
- The interactive map container has a labelled `group` role.
- Route lines now have an opaque dark-green centre and a white casing, with tiles
  inserted underneath both layers. The selected marker retains its black/white
  outline. Charts use the contrasting green foreground token in each theme.
- Recharts' default axis-label grey measured 3.95:1 on white. Axis labels now use
  the same muted foreground token as ticks: `#52525b` in light mode (7.73:1 on
  white), `#a1a1aa` in dark mode (7.76:1 on `#09090b`).
- Old tests were updated for the Chart options disclosure, Suggested range,
  Try again action, exact chooser heading, legitimate Next HEAD prefetch requests
  and the already-approved OSM tile boundary. No arbitrary external URL is
  allowlisted, and hostile GPX URLs remain forbidden.
- The dialog keyboard check waits for the asynchronously mounted map and focus
  trap to settle; eight repeated light/dark desktop/phone accessibility cases
  passed after that test timing correction. No dialog behaviour change was needed.

### Viewport and accessibility assessment

The workspace checks exercise 1440×900, 1280×720, 390×844 and 375×667 using drawn
chart targets, keyboard controls and phone touch. At the chart-region scroll
position, selected values, the graph and smoothing stay together. Desktop also
shows the linked map marker; phones open View on map and return with selection
and focus preserved. The 375×667 view needs normal document scrolling for the
position slider. Expanding all pace options also uses normal scrolling; close
Chart options before inspecting to see the graph and selected values together.
There is no claim that every expanded control fits on a short phone.

Reviewed viewport screenshots include the homepage focus state in light/dark,
loaded summaries, selected measurements, the phone map, pace overflow and
import/replacement recovery. The homepage control's contrast change does not
change its layout. Changed summary markup does not alter the displayed wording.
Reviewed copy describes the available results and actions; no new contact or
unsupported format claims were introduced.

Maps have coordinate/summary alternatives; charts have the labelled position
slider and selected numeric readings. Average lines are dashed and labelled,
selection has an outlined marker and a detail panel, and missing readings are
shown with gaps/text. Reduced-motion contexts remain usable; chart-line animations
and initial map fitting are disabled, and dialogs use no motion preset.

Axe reports no automated WCAG A/AA violations in the exercised states. Its
remaining manual-review items concern SVG/background contrast and focusable
page content hidden behind the modal. Rendered chart colours and viewport images
were inspected; keyboard cycling stays inside the settled dialog and Escape
returns focus to View on map. These checks do not establish full WCAG conformance,
screen-reader usability or contrast over every possible map image. Physical
devices and assistive-technology assessment remain explicit limitations.

### Review and release decision

Local standards/spec self-review covered the changed source, build scripts,
tests and this record against AGENTS.md and product-spec sections 13, 19–22.
The subsequent pre-commit review compared all 24 pending files with `320130a`
using independent standards and spec reviewers. Standards: no documented
breaches or actionable maintainability findings. Spec: no commit-blocking
findings; the release requirements listed above remain explicitly outstanding.
Reviewers inspected source and recorded evidence rather than rerunning browser
checks. Typechecking, lint, Knip and all 176 Jest tests passed again before commit.
The changes implement Stage 1 verification and scoped fixes. Contact details,
privacy/hosting confirmation and actual-host checks remain open; this work does
not close #6/#7 or declare a release ready. No files were deployed or pushed.
