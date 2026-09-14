# Stage 1 release verification — issue #7

Status: **not ready for public release**. Contact details are indefinitely deferred
by the owner, with no deadline or commitment to revisit them. Contact setup is
not an active task or a launch requirement, following the owner's subsequent
approval on 14 September 2026. Public-domain verification and release approval
remain outstanding. Earlier chronological entries describe the gates at that time;
this decision supersedes their references to contact details blocking release.
This record covers the release candidate on `feat/7-release-verification`, based
on `320130a` (draft PR #20), including the workers.dev testing deployments below.
No merge, public-domain cutover or closure of #6/#7 is recorded.

## Release gates

| Gate | Evidence and remaining boundary |
| --- | --- |
| O2 basemap | Resolved supplier choice: [basemap assessment](basemap.md). Synthetic tile success, failure and local route fallback are exercised. Six real tile requests on workers.dev passed with the expected origin-only referrer; repeat on the public domain at cutover. |
| O3, GPX portion | ISC-licensed saxes 6.0.0; GPX 1.1 tracks, routes and waypoints, explicit rejection and extension policy in [GPX support](gpx-support.md). [Fixture provenance](../tests/fixtures/gpx/README.md) distinguishes synthetic, sanitised Strava and Bikerouter examples. FIT/TCX remain later stages. |
| O4 | [Large-file evidence](large-file-support.md) and the public limitations page distinguish desktop engines and emulated phones from physical devices. The owner confirmed the basic workflow on an iPhone 16 Pro Max in Brave; see the physical-device check below. Broader device coverage and measured physical-phone performance remain unverified. |
| O5 | Local and workers.dev header/CSP/privacy checks passed. [Hosting assessment](hosting-privacy.md) records disabled Worker logs/traces, no bindings and owner-provided evidence supporting inactive Web Analytics. Ordinary hosting/NEL processing remains disclosed; no fixed retention promise is made. **Contact optional and indefinitely deferred**; public-domain settings and checks remain open. |
| Actual hosts | Default workers.dev, version preview and branch-alias HTTPS/CSP/noindex checks passed; see hosted evidence below. Public-domain canonical/indexing, custom-domain routing/default-route disabling and final hosting privacy assessment remain open. |
| O6–O11 | Analytics and ads remain disabled; later format, merge, comparison and efficiency decisions are outside this Stage 1 verification. |

## Workers hosting transition — 14 September 2026

The owner approved replacing the undeployed Pages plan with Workers Static Assets.
The configuration and dashboard reference settings are in [Workers hosting](workers-hosting.md).
Only `out/` is served; there is no application backend or GPX processing on Cloudflare.
The generated host-specific rule marks workers.dev URLs noindex while leaving the
public origin unaffected. The release checklist now requires Workers custom-domain
verification and disabling the default workers.dev route at cutover, replacing
Pages-specific redirects. This is local configuration work, not a deployment.

Validation: `pnpm build`, `pnpm tsc`, `pnpm lint`, `pnpm knip` and the Wrangler
deployment dry run passed. Wrangler 4.131.1 accepted both generated header rules.
`pnpm test:browser:hosting --workers=2` passed all 12 desktop/mobile Chrome checks
against the local Workers emulator: direct-load hydration, CSP enforcement, actual
import/map workers, prohibited outbound activity canaries, asset scanning and
host-specific noindex. The noindex cases use synthetic Host headers; they do not
establish real Cloudflare DNS, TLS, preview aliases or custom-domain behaviour.
The same two header checks passed against the ordinary Python test server.
Temporary local servers were stopped after verification. No new physical-device
or visual-layout assessment is claimed for this hosting-only change.

The Cloudflare application, version/branch previews, public-domain cutover,
host-side logging/services assessment and remaining release gates are still open.
Contact details stay indefinitely deferred.

## Initial workers.dev deployment — 14 September 2026

The owner authorised deployment of branch `feat/7-release-verification` at commit
`5d13b06`. A fresh `pnpm build` and `pnpm knip` passed before `wrangler deploy`.
The Worker did not previously exist. Cloudflare deployed version
`9e4935bd-5bbc-417f-8be9-eda26e8302bf` at
https://gpsgoblin.andrew-stelmach.workers.dev. No custom-domain route was configured
and gpsgoblin.com was not changed.

The hosted viewer returned HTTPS 200 with the generated CSP, nosniff, frame,
referrer and permissions policies, and `X-Robots-Tag: noindex`. An unknown path
returned 404. Eight desktop/mobile Chrome checks passed on the actual default
workers.dev URL: hydration in both navigation orders, clean-path pages, browser
CSP enforcement and synthetic import/inspection/replacement/clear with actual
browser workers. Public map tile requests were blocked, exercising map fallback;
this does not verify successful live OpenStreetMap tiles. These checks reused
`hydration.spec.ts` and `releaseSecurity.spec.ts`, excluding the synthetic Host
header and local asset-scan tests. Local output: `/private/tmp/gpsgoblin-live-tests.log`.

Cloudflare also added NEL/Report-To network-error reporting headers. This is
hosting-side behaviour, not application telemetry; its privacy assessment remains
open. Version-specific and branch-alias preview URLs, GitHub build integration,
custom-domain cutover and default-route disabling remain unverified. This testing
deployment does not close #7 or establish public-release readiness. Contact details
remain indefinitely deferred.

### Owner-reported hosted Brave workflow — 14 September 2026

The owner confirmed the following on the deployed workers.dev testing site in
Brave with Shields enabled, following deployment of commit `5d13b06`:

| Interaction | Reported result |
| --- | --- |
| Open the HTTPS testing URL with Shields enabled | Site loaded successfully. |
| Load a GPX recording | Summary, chart and map background appeared correctly. |
| Click a chart point | Details appeared and the map marked the corresponding location. |
| Close the blue details box | Details disappeared and the selected-point marker cleared from the chart and map. |
| Change GPX file to a different recording | Summary, chart and map updated to the new recording. |
| Clear file | Summary, chart and map disappeared and the file chooser returned. |

These are owner-reported step-by-step confirmations, separate from the eight
agent-run hosted browser checks. The live map-background result adds evidence
beyond automated tile-fallback checks. Device, exact Brave version, viewport,
recording provenance, file sizes, point counts and timings were not recorded for
this hosted run. No new iPhone, keyboard, assistive-technology, large-file or
failure-recovery coverage is inferred. Actual-host checks of version/branch-alias
previews, GitHub builds, custom-domain cutover and hosting privacy assessment
remain outstanding. Contact details remain indefinitely deferred; #7 remains open.

## GitHub build integration — 14 September 2026

The owner connected GitHub Builds to `Yorkshireman/gpsgoblin`, selecting
`feat/7-release-verification` as the temporary production build branch and enabling
non-production previews. Adding gpsgoblin to the GitHub App's selected repositories
removed the disconnected-account warning, as confirmed by the owner.

Pushing `059e713` triggered a successful Cloudflare build and deployment, confirmed
by the owner-provided build log. It used Node 24.20.0, pnpm 12.3.4, frozen-lockfile
installation, the static build/header generator and Wrangler 4.131.1. Version
`2796dfe2-8b7e-4523-bf4f-2b1ebe8f9557` replaced the initial workers.dev deployment.
The owner refreshed the hosted page and confirmed a recording displayed its
summary, chart and map. This is owner-reported workflow evidence, not a new
agent-observed physical-device test. The build log also reported Next.js build
telemetry; Wrangler metrics were separately disabled in the configured build
variables. No claim is made that all build-tool telemetry is disabled.

### Non-production branch preview verification — 14 September 2026

Pushed verification branch `verify/7-workers-preview` at `059e713` without changing
the checked-out #7 branch or its source. The configured GitHub integration built
it successfully as a non-production version. GitHub check run `104107270649`
reported build `df04fbf3-4138-4dc5-9158-d57b3a8d6675`, version
`0f6fb8df-bc75-49e3-908c-bfb33b159b57`, and both URLs:

- Version: https://0f6fb8df-gpsgoblin.andrew-stelmach.workers.dev
- Branch alias: https://verify-7-workers-preview-gpsgoblin.andrew-stelmach.workers.dev

HTTPS requests to `/`, `/tools/gpx-file-viewer`, `/privacy` and `/limitations`
returned 200 with noindex and the generated CSP on both hosts. An initial Python
HTTP request returned 403; subsequent curl and browser checks succeeded without
changing site configuration or access controls. Sixteen Chrome desktop/mobile
checks passed across both URLs, reusing hydration and release-security workflow
tests with synthetic GPX input and blocked public tiles. These covered CSP browser
enforcement, hydration, actual import/map workers and inspection/replacement/clear;
map success with real tiles was not tested in this automated preview run. Logs:
`/private/tmp/gpsgoblin-preview-tests.log`. Knip passed with no findings.

Wrangler deployment listings before and after the preview build showed the same
latest active deployment: version `2796dfe2-8b7e-4523-bf4f-2b1ebe8f9557` at 100%.
The preview upload did not promote its version or replace the main testing URL.
The verification branch is retained for reproducibility; no extra PR was opened.
No custom-domain change, release approval or issue closure occurred. Remaining
public-domain and hosting-privacy gates and indefinitely deferred contact details
are unchanged.

## Hosting privacy assessment — 14 September 2026

[Hosting privacy evidence](hosting-privacy.md) records primary-source findings,
live workers.dev response headers and a fresh Chrome privacy-page load. Ordinary
host request processing, browser-managed network-error reports, optional Web
Analytics and build-tool telemetry are distinguished. No analytics script or
cookie was observed in the sampled page load; this does not certify account-wide
settings. Public privacy copy now discloses Cloudflare connection-failure reports
without claiming a fixed retention period or that no information leaves the device.

Validation: `pnpm build`, `pnpm lint`, `pnpm tsc`, `pnpm knip` and
`PLAYWRIGHT_PORT=4191 pnpm exec playwright test tests/browser/releaseSecurity.spec.ts --workers=2`
passed (eight browser checks). The default test port was occupied; the suite ran
on an isolated alternate port. Chrome screenshots of the privacy page were
reviewed at 1440 × 900 and 390 × 844, including the hosting section after scrolling
on the phone (scrollY 814). Copy wrapped without horizontal overflow, and the
Cloudflare policy link accepted keyboard focus with its correct destination.
This copy-only change did not receive a new physical-device test.

The technical assessment is recorded; account/zone-specific services and the
future custom domain still need verification. Public-release approval and domain cutover remain unresolved; contact details are optional and remain
indefinitely deferred. No account setting, deployment or domain was changed.

## Latest hosted verification — 14 September 2026

Cloudflare GitHub build `a639e1cf-ce81-4d36-9e2d-d63bf2020a86` completed
successfully for `7d8be48`. Wrangler confirmed active version
`4342ec3a-9cac-4a0b-b833-874d5773ad49` at 100%, deployed at 19:15:51 UTC.
The updated network-error disclosure was present in returned `/privacy` HTML.
Eight existing hydration and security checks passed against the live testing
origin in Chrome desktop/mobile (15.2 seconds), with synthetic activity canaries
and blocked public tiles. Output: `/private/tmp/gpsgoblin-privacy-live-results`.

A separate single-load Chrome check at 1440 × 900 used a synthetic two-point York
route with real tiles. Six GET tile requests returned 200; each used origin-only
Referer `https://gpsgoblin.andrew-stelmach.workers.dev/`, a browser User-Agent,
no request body and no cache-bypass header. Responses included Cache-Control and
ETag. Attribution was visible. No pan/zoom loop or personal recording was used.

Curl checks returned 200 for root, viewer, privacy, limitations, robots and
sitemap, with noindex throughout. Canonical URLs, sitemap entries and robots'
sitemap reference used gpsgoblin.com. An unknown route returned 404. Python's
HTTP client received Cloudflare error 1010/403; curl and the actual Chrome
workflows succeeded without configuration changes. This is a client-specific
observation, not proof that every client can access the testing host.

Current decision boundary: the testing deployment and branch-preview workflow
are verified. Account/zone-specific hosting settings and the public-domain
checks remain distinct from these results. Contact details are optional and
indefinitely deferred. No public-release readiness, merge or domain change is
implied. The draft PR remains open and mergeable; its older description needs
refreshing when PR publication/editing is next authorised.

## Dashboard hosting inventory — 14 September 2026

Owner-provided screenshots showed Workers Logs and Traces disabled, zero bindings
and no custom domains/routes on GPSGoblin. The owner confirmed Web analytics
opened directly to its initial hostname setup screen. Combined with the sampled
page's absent analytics beacon, this supports inactive Web Analytics in the
viewed account. It is UI evidence, not an API inventory or proof that Cloudflare
performs no network logging. See [hosting privacy](hosting-privacy.md).

The requested testing-host dashboard check is complete; no repeat setup action
is needed. Future custom-domain checks and release
approval remain separate. No service was enabled and no domain setting changed.

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

[Cloudflare Static Assets headers documentation](https://developers.cloudflare.com/workers/static-assets/headers/)
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
clean URLs and applies the generated global header rule to responses; it also recognises our workers.dev noindex rule and refuses
other unsupported rule syntax. Server reuse is disabled so a stale header-free server
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

### Owner-reported physical-device check — 14 September 2026

Device: iPhone 16 Pro Max, using Brave. The owner tested the production export
from commit `e83067e`, served by the Mac over the same Wi-Fi network using HTTP
and the generated security headers. Brave repeatedly upgraded the address to
HTTPS; the owner disabled Shields for the local preview address and confirmed
that the file chooser then appeared. This is not verification of public HTTPS
hosting or Brave with its default Shields settings.

The owner confirmed each of these results in the conversation:

| Interaction | Reported result |
| --- | --- |
| Open a GPX recording from the iPhone | File loaded; distance summary and chart appeared. |
| Display the map | Map worked. |
| Tap a chart point, then close its blue details box | Details closed and the point became unselected. |
| Change to a different GPX recording | New summary and chart appeared; previous selection was cleared. |
| Clear the file | Summary, chart and map disappeared; Choose GPX file was available again. |

These are successful owner-reported basic workflow checks on a physical phone,
not agent-observed screenshots or automated device tests. iOS/Brave versions,
recording provenance, file sizes, point counts, exact viewport and timings were
not recorded. No measured large-file performance, VoiceOver, keyboard access,
failed/cancelled replacement recovery, default-Shields compatibility or broader
physical-device support is inferred. Contact details remain indefinitely
deferred and the actual-host and other unresolved release gates remain open.

### Loaded-view rotation follow-up (14 September 2026)

The owner subsequently reported excess page width after portrait → landscape →
portrait on the loaded chart page in iPhone Brave; the empty chooser was unaffected.
A synthetic recording with a long track name and a second selectable item reproduced
hidden document overflow in Playwright WebKit. At a 440px viewport the document
measured 2317px wide. A long filename alone or a single track without the View
selector did not reproduce it. Constraining the selector's minimum width had no
effect; clipping overflow inside the native select restored the document to 440px.
The fix is confined to that select, preserving its full option labels and focus ring.

`viewportRotation.spec.ts` failed before the fix with 1373px of excess width at
956px, then passed in all six Chrome/Firefox/WebKit desktop/phone projects. It
checks resizing through 956×440, 440×956, 1440×900, 1280×720, 390×844 and 375×667,
preserved route position, and switching from track to waypoint and back. The
original larger synthetic reproduction also passed in Chrome and mobile-emulated
WebKit at 375, 390 and 440px, rotating through wider viewports and back.

Whole-page viewport screenshots were inspected in WebKit at 1440×900, 1280×720,
390×844 and 375×667, at the top of the loaded page with View focused. Its outline,
arrow and label remained visible; long text stayed within the field. The chart
and map share the desktop viewport; the short phone viewport requires scrolling
to reach the bottom of the chart and map button. No copy changed. Automated map
tiles were blocked for these checks. These automated checks are browser-emulation
evidence, separate from the physical-device retest below.

`pnpm build`, `pnpm tsc`, `pnpm lint` and `pnpm knip` passed. The local production
preview was rebuilt and restarted at the existing LAN address for that retest.

The owner then confirmed that the rotation bug was fixed on the iPhone 16 Pro Max
in Brave after testing the updated local production preview. This records a
successful owner-reported loaded-view portrait → landscape → portrait retest,
not an agent-observed device session. It does not extend the coverage to other
devices, browser versions, hosting environments or measured phone performance.

### Owner-reported desktop Brave check — 14 September 2026

The owner tested the updated local production preview on their Mac in Brave,
following the rotation fix recorded in `c69a83f`. They confirmed each step in
the conversation:

| Interaction | Reported result |
| --- | --- |
| Load a GPX recording | Summary, chart and map appeared correctly. |
| Click a chart point | Point details appeared and the map marked the corresponding location. |
| Close the blue details box | Details disappeared and the selected-point marker cleared from the chart and map. |
| Change GPX file to a different recording | Summary, chart and map updated to the new recording. |
| Clear file | Summary, chart and map disappeared and the file chooser returned. |

This is successful owner-reported basic workflow evidence, not an agent-observed
browser session. The exact Brave version, viewport, recording provenance, file
sizes, point counts and timings were not recorded. No keyboard coverage is inferred from this basic workflow check; the separate
keyboard check follows below. No assistive-technology, large-file performance, failure-recovery or public-host
verification is inferred. Contact details remain indefinitely deferred; the
remaining release gates are unchanged and #7 remains open.

### Owner-reported desktop Brave keyboard check — 14 September 2026

The owner tested the local production preview on their Mac in Brave following
commit `57f76bd`, confirming these guided keyboard checks in the conversation:

| Interaction | Reported result |
| --- | --- |
| Tab to Choose GPX file, then press Enter | Focus was clearly visible and the file picker opened. |
| Choose a GPX recording | Recording loaded with the summary, chart and map. |
| Tab to Position on route, then press Right Arrow | Focus was visible; selected-point details and the map marker updated. |
| Tab or Shift+Tab to the blue details box's close button, then press Enter | Focus was visible; the box closed and the selected-point marker cleared. |
| Tab or Shift+Tab to Clear file, then press Enter | Focus was visible and the file chooser returned. |

These are successful owner-reported checks, not an agent-observed browser session
or a full keyboard/accessibility audit. Exact Brave version, viewport and recording
details were not recorded. Keyboard replacement, every control's tab order, focus
placement after dismissal/clear, assistive technology and physical-phone keyboard
behaviour were not established by these confirmations. Contact details remain
indefinitely deferred and the remaining release gates stay open.

### Review and release decision

Local standards/spec self-review covered the changed source, build scripts,
tests and this record against AGENTS.md and product-spec sections 13, 19–22.
The subsequent pre-commit review compared all 24 pending files with `320130a`
using independent standards and spec reviewers. Standards: no documented
breaches or actionable maintainability findings. Spec: no commit-blocking
findings; the release requirements listed above remain explicitly outstanding.
Reviewers inspected source and recorded evidence rather than rerunning browser
checks. Typechecking, lint, Knip and all 176 Jest tests passed again before commit.
The changes implement Stage 1 verification and scoped fixes. At that review,
contact details, privacy/hosting confirmation and actual-host checks remained open; this work does
not close #6/#7 or declare a release ready. The reviewed branch was subsequently
pushed as draft PR #21; no public deployment or merge has been performed.
