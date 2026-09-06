# GPSGoblin — GPS & Activity File Toolkit Product Specification

**Status:** First consolidated specification; agreed product direction with explicitly identified implementation decisions and release gates.
**Version:** 0.2
**Date:** 6 September 2026
**Owner:** Yorkshireman
**Product name:** GPSGoblin — settled.
**Owned production domain:** `https://gpsgoblin.com` — purchased; a placeholder site is live. This is the canonical production origin.
**Suggested repository location:** `docs/product-spec.md`

## 1. How to use this specification

Build a small, maintainable product in independently releasable stages. This document describes the intended V1 suite, not a requirement to implement the entire suite before publishing anything.

**Agreed** means a product or stack decision already accepted by the owner. **Recommended default** means a proposed resolution of an implementation detail that was not individually discussed. **Open / release gate** means evidence or a decision is required before the affected capability can be released. Do not silently convert an open item into a settled fact.

The owner has approved incremental public releases. The first vertical slice is a functioning GPX viewer. The advanced comparison engine must not become a dependency of that first release.

Implement the current stage, preserve the explicitly required extension points, and avoid building infrastructure for speculative future features. Maintain this specification when intentional behaviour changes. Record substantial technical choices in short decision records rather than burying them in component code.

Public claims must match tested behaviour. An unavailable calculation, clear limitation or rejected comparison is better than a confident but unsupported result.

## 2. Product and commercial objective

### 2.1 Product concept — agreed

GPSGoblin is a free, privacy-conscious collection of browser-based tools for viewing, inspecting, converting, manipulating and comparing GPS/activity files.

Use **GPSGoblin** consistently in site branding, navigation, page-title suffixes and sharing metadata. The descriptive tagline is **“Free tools for GPS and activity files.”** Supporting positioning is **“View, convert, merge and compare — right in your browser.”** Public copy must reflect the tools actually released; mention merge only if the conditional GPX Merge tool ships. This branding does not change the agreed tool scope or release sequencing.

The site is sport-neutral at the brand and generic-tool level. Running and cycling receive specialised treatment where their analysis needs differ. Do not unnecessarily exclude hikers, walkers or other GPS-file users from general tools.

The intended acquisition model is:

> A person searches for a specific file-processing task, lands directly on the corresponding tool, and completes that task for free.

Useful tools and their explanatory pages are the primary planned search-acquisition channel. Same-route performance analysis is the intended signature capability: it should make the collection distinctive and useful to repeat visitors, without consuming a disproportionate share of development effort before simpler tools launch.

Users must not have to visit the homepage or understand the wider product to use an individual tool.

### 2.2 Success and cost discipline — agreed

The owner would regard **£50 per month of operating profit** as success, while preferring substantially more. This is a success threshold, not a revenue forecast.

For this project:

`Operating profit = recognised revenue − domain allocation − hosting − map infrastructure − other operating expenses`

Treat this as before personal tax and without assigning a wage to development time. Track development and maintenance hours separately to assess whether the return remains worthwhile. Consider a recurring result rather than a single unusually good month.

Keep ongoing maintenance and supplier dependence low. Apart from a domain, no paid service, paid upgrade or uncapped usage-based spending may be enabled without the owner's approval. An alert is not a spending cap.

There is no approved numerical development-time budget. Earlier informal estimates such as a couple of weekends are not planning commitments for the full suite.

### 2.3 Evidence boundary

Search demand, attainable rankings, visitor retention, advertising approval and advertising yield remain business hypotheses to test. No independently validated keyword-volume dataset, traffic forecast, competitor revenue or profitability probability is attached to this specification.

Do not turn earlier illustrative RPMs, competitor traffic estimates or earnings scenarios into validated requirements. Do not claim that the signature analysis is unique without a fresh competitor check.

Commercial strategy informs prioritisation; it does not justify thin pages, exaggerated analysis or deceptive advertisements.

## 3. Intended V1 suite and release sequence

### 3.1 Tools — agreed

| Tool                              | Core job                                                                         | Suggested permanent URL            |
| --------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| GPX File Viewer                   | Inspect routes, tracks, segments and available measurements                      | `/tools/gpx-file-viewer`           |
| FIT File Viewer                   | Inspect activity recordings and available training measurements                  | `/tools/fit-file-viewer`           |
| TCX File Viewer                   | Inspect activity/course data and available training measurements                 | `/tools/tcx-file-viewer`           |
| FIT to GPX                        | Export supported geographic content as GPX, disclosing losses                    | `/tools/fit-to-gpx`                |
| TCX to GPX                        | Export supported geographic content as GPX, disclosing losses                    | `/tools/tcx-to-gpx`                |
| GPX Merge — conditional           | Combine files without inventing one continuous activity                          | `/tools/merge-gpx`                 |
| Compare Activity Files            | Compare routes, summaries and available measurements, including different routes | `/tools/compare-activities`        |
| Same-Route Performance Comparison | Compare repeat attempts geographically, with time differences and replay         | `/tools/compare-route-performance` |

The paths above are recommended defaults; settle them before their first indexable release. All published tool URLs use the settled origin `https://gpsgoblin.com` (for example, `https://gpsgoblin.com/tools/gpx-file-viewer`). The two comparison tools may share components and imported data but serve different jobs. Efficiency indicators belong within general comparison, not a separate mandatory SEO page.

GPX Merge is included only if a bounded implementation is genuinely inexpensive after the shared file infrastructure exists. If safe preservation and export prove substantial, defer it explicitly.

### 3.2 Delivery stages — agreed

| Stage | Deliverable                                                 | Exit condition                                                                            |
| ----- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1     | End-to-end GPX viewer, indexable page and static deployment | A real file can be inspected on the production build; relevant public-release gates pass  |
| 2     | FIT and TCX viewers                                         | Supported data, missing-data cases and representative exporter fixtures work              |
| 3     | FIT→GPX and TCX→GPX; optionally GPX Merge                   | Downloads are valid, preservation/loss behaviour is tested and disclosed                  |
| 4     | General comparison                                          | Different routes can be compared without implying geographic equivalence                  |
| 5     | Same-route analysis, replay and stop exclusion              | Spatial/timing acceptance tests and conservative rejection behaviour pass                 |
| 6     | Fitness & Efficiency Indicators                             | Each released calculation has an approved documented method and defensible interpretation |

Each stage leaves a working, tested application. Publish completed tools independently. Unfinished routes must not masquerade as products or be submitted in the sitemap. Advertising is not a prerequisite for publishing a useful tool.

The full V1 ambition includes the advanced tools. Release sequencing is not permission to silently discard them; reassess scope with evidence at stage boundaries.

## 4. Shared user experience

### 4.1 Entry and workflow

Use a clean, restrained visual design. Put the usable tool near the top of its landing page, ahead of long explanatory content.

The default flow is:

`Land → understand → choose/drop file → validate/process → inspect or download result`

Provide drag-and-drop and a normal file picker. Support multi-file selection where the tool requires it. No registration, mandatory onboarding or email capture. Show supported file types and tested size limits before selection.

Provide clear loading, success, partial-success and failure states. Keep successful imports when a different selected file fails. Allow users to remove or replace a file and clear the current workspace. File contents and filenames remain local.

Errors should distinguish unsupported format, unsupported file subtype, corrupt structure, missing required data and configured resource limits. Explain what the user can still do; never turn an absent metric into a generic invalid-file error.

Recommended default: retain imported data only in memory during the open application session. Persisting activity contents in browser storage is not required for V1. Explain that refreshing or clearing the workspace loses local work. Non-sensitive display preferences may be persisted subject to the selected storage/consent approach.

### 4.2 View organisation

For viewers, favour summary, map, selected charts and deeper details in that order. Do not show empty charts for absent data.

For same-route comparison, favour comparison extent/reference/time basis, headline difference, map and delta graph, significant sections, then optional deeper metrics.

Use progressive disclosure. Do not present every possible FIT field or twelve default graphs just because the parser exposes them.

Support metric and imperial display units. Running pace and cycling speed are different presentations of supported measurements. Never silently infer a sport solely from file extension. Permit a local sport override where required, preserving the original metadata and clearly identifying the override.

### 4.3 Mobile and accessibility

Viewers and converters must be comfortable on phones. Complex analysis must remain usable on mobile, while desktop/tablet may show richer simultaneous views.

Require semantic controls, keyboard access, meaningful labels, visible focus, adequate contrast, reduced-motion support and non-colour-only result distinctions. Users need a file picker alternative to drag-and-drop.

Maps and charts enhance the result; they are not the sole representation of important information. Include readable summaries and section results. Do not autoplay replay. Do not trap scrolling inside a map on mobile.

Light/dark mode is desirable if inexpensive, but is not a release blocker. Avoid turning cosmetic preferences into delays to useful releases.

## 5. Canonical data model

### 5.1 Structural principles — agreed

Keep one framework-independent TypeScript model shared by all formats and tools. Preserve the distinction between recorded source values and calculated or adjusted representations.

A file is not necessarily a single continuous activity. GPX supports tracks, routes, waypoints and separate track segments; timestamps and elevation are optional. FIT activity data includes session/lap structure and events. Preserve the relevant structure instead of flattening everything into one trace. [S1, S2]

Conceptual responsibilities:

| Model area            | Required responsibility                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Imported document     | Locally retained original file, detected format/subtype, source metadata, warnings and contained entities    |
| Activity or path      | Recorded activity versus planned route, sessions/laps, track and segment boundaries, source sport            |
| Source samples/events | Original sequence, timestamps, coordinates and available measurements; pause/timer events where present      |
| Derived analysis      | Calculated distance, gradient, speed, stop candidates, quality flags and metric results with method/settings |
| Comparison            | Selected entities/extents, spatial mappings, reference, time basis, exclusions and calculated deltas         |

These are responsibilities, not a mandate for exactly five interfaces or separate packages.

### 5.2 Values, units and provenance

Use explicit units internally: metres, seconds, metres per second, watts, beats per minute and degrees Celsius where relevant. Use a documented absolute timestamp representation; convert to display time zones at the presentation boundary. A timezone-less source value must not silently become a confidently known UTC instant.

Keep missing, invalid and genuine zero values distinguishable. Do not convert missing power to zero watts, missing altitude to sea level or missing time to a fabricated timestamp.

Keep device-reported distance, speed and totals separately from recomputed values. Label the basis shown in the UI. A discrepancy between source totals and calculation is not permission to overwrite the original.

Preserve source sample order and stable identifiers. Derived sanitised/smoothed/resampled arrays must remain traceable to their source. Invalid coordinates, non-monotonic time, duplicate timestamps and outliers need explicit handling rather than silent reordering.

Normalise cadence only when its meaning and units are known. Do not assume all running/cycling/device cadence conventions are interchangeable. Unsupported measurements may be recorded as available-but-not-interpreted; never promise all vendor fields are understood.

### 5.3 Capabilities and data quality

Determine capabilities from the selected data, not the extension alone. Examples include mappable geometry, time-based replay, elevation profile, HR chart, power chart and eligibility for a particular efficiency calculation.

Examples of required behaviour:

- A route without timestamps remains viewable, but timed performance comparison is unavailable.
- An indoor activity without coordinates may still show recorded distance, duration and sensor charts.
- An activity with incomplete HR remains viewable; analyses requiring adequate HR coverage may be unavailable.
- A file containing multiple selectable entities presents a selection step; it is not silently concatenated.

Quality warnings must identify the affected capability. Do not apply one opaque overall confidence number to unrelated aspects of the file.

### 5.4 Immutable source and derived outputs

Keep original contents unchanged throughout analysis. Smoothing, distance recalculation, stop exclusion, spatial alignment and chart downsampling create derived representations.

Downloads are new files, not mutations of originals. Retaining the original allows a user to recover their own source locally; it is not a promise of lossless round-trip conversion.

## 6. Parsing and file support

FIT, GPX and TCX are agreed formats. Exact versions, subtypes, extension coverage and resource limits must be published from tested implementation evidence.

Recommended compatibility baseline: GPX 1.1 and TCX v2 geographic/activity content, plus FIT activity files supported by the chosen decoder. Evaluate GPX 1.0 before claiming support. FIT workout/settings files must not be presented as corrupt activity recordings merely because they share the `.fit` extension.

Evaluate Garmin's official browser-compatible JavaScript FIT SDK as the first decoder candidate. Adoption remains subject to licence, bundle size, browser, worker and Jest compatibility checks; it is not yet a locked dependency. [S3]

Use maintained parsers where suitable. Keep their types behind adapters. Validate actual structure/signatures, not just filename extensions or browser MIME types.

Publish a compatibility matrix for known extensions, including supported HR/cadence/power fields. GPX extensions are not universally interoperable; export disclosures must distinguish standard GPX data from explicitly supported extensions. [S1]

Source data is untrusted. Do not execute markup, resolve arbitrary external references or load URLs embedded in activity files. Reject or safely handle XML external entities and expansion attacks. Render names and descriptions as text, not trusted HTML.

Set explicit maximum file size, point count, file count and processing limits after browser benchmarks. Fail gracefully before exhausting the device. These thresholds are open decisions, not arbitrary numbers to invent in landing-page copy.

Real fixtures must have permission for use and must not expose an unsuspecting person's home, routine, identity or health measurements in a public repository. Keep provenance/licence notes alongside fixtures. Synthetic cases complement real exporter files; they do not replace them.

## 7. Viewer requirements

### 7.1 Shared behaviour

Display file/entity identity locally, useful source metadata, available headline statistics, warnings, tracks/segments and available metrics. Make source versus calculated totals discoverable.

Offer only charts supported by the data: elevation, pace/speed, HR, cadence, power and temperature where implemented and interpretable. All three viewers reuse core infrastructure but need not display identical panels.

Allow a selected chart position to highlight a corresponding map position when a valid mapping exists. Discontinuities remain visible; do not draw a confident continuous line across a recording gap.

A failure to load the basemap must not prevent parsing, textual results, conversion or charts. Provide a clear map-unavailable state, and local route geometry on a neutral background where practical.

### 7.2 GPX viewer

Support selection and display of tracks/segments, routes and waypoints within the supported schema scope. Show geometric distance with its calculation basis. Derive duration/speed only from sufficient valid timestamps. Show elevation only where available.

Do not describe a planned route as a completed workout or sparse route waypoints as a precisely recorded journey.

### 7.3 FIT and TCX viewers

Surface supported session/lap structure, recorded summaries and richer metrics without forcing them into GPX's common minimum. Do not lose useful non-geographic training information just because a map is unavailable.

For multisession/multisport data, make entity selection explicit. A complete multisport analysis interface is not required in the initial viewer release, but source structure must be preserved and limitations stated.

## 8. Conversion and merge requirements

### 8.1 FIT→GPX and TCX→GPX

Users select a source, review selectable geographic content and warnings, then download a valid GPX file.

Preserve supported coordinates, timestamps, elevation and segment boundaries. Do not fabricate timestamps or link disconnected sections into a continuous track. Do not discard a metric that is promised as supported without warning.

Before download, summarise what is preserved and what is not carried into the chosen output. Report potential losses for unsupported fields; do not claim an exhaustive field-by-field audit unless implemented.

If an activity has no usable coordinates, explain why a geographic GPX export is unavailable while retaining useful viewer results. Do not generate an empty file and report success.

Keep original timestamps in normal conversion. Stop-exclusion settings in comparison must not silently alter converter output. Exporting time-adjusted workouts is outside V1.

Acceptance requires well-formed, schema-compatible output and independent checks of key data values and structure. Re-reading with our own parser alone is insufficient evidence of interoperability.

### 8.2 GPX Merge — conditional

Combine multiple GPX documents into one valid document while preserving distinct tracks/segments, routes and waypoints within supported scope. Preserve input order by default and make the resulting structure clear.

Do not interpolate travel between files, recalculate an imaginary complete workout or average unrelated source summaries. Handle names/metadata collisions predictably and disclose unsupported information.

Continuous track joining, overlap deduplication, timestamp repair and route editing are separate features, not hidden obligations of simple merge.

## 9. General activity comparison

Accept mixed FIT/GPX/TCX selections. Recommended default: allow 2–4 selected activity/path entities, matching the agreed performance-comparison limit and subject to measured resource limits.

Compare route geometry, distance, durations, elevation and available measurements without requiring the same route. Allow users to toggle tracks and select which metric to inspect.

Use explicitly labelled axes. Elapsed-time alignment, recorded-distance alignment and geographic route alignment are different operations. A distance-based overlay of two different routes does not mean that the athletes occupy equivalent places.

Do not align unequal arrays by sample index. Do not average per-sample values without considering irregular sampling. Label measurement coverage and time weighting where calculated.

Offer a route-performance action only when its required data is available; route eligibility is checked by that tool. Sharing parsed data between tools within the current session is desirable, not a requirement to create accounts or permanent history.

Keep raw comparison available when efficiency analysis cannot be justified.

## 10. Same-route performance comparison

### 10.1 Scope — agreed

Compare **2–4** recorded attempts in mixed supported formats, following the same or substantially similar complete route in the same direction. Accommodate normal GPS noise and modest start/end differences.

Whole-route acceptance must be conservative. Substantially different routes, reverse-direction attempts and ambiguous matches must not produce confident whole-route results.

V1 does not expose automatic common-climb discovery, arbitrary partial-route comparison, manual correspondence editing or general lap matching. The internal correspondence model must allow those later without replacing the core analysis model.

### 10.2 Spatial correspondence

Separate route matching from the product's acceptance policy. Matching produces explicit comparable sections and mappings from source samples/progress to a common comparison-distance coordinate. The V1 policy decides whether those mappings justify whole-route comparison.

Use sequence, direction and route topology, not proximity alone. Handle or conservatively reject loop, crossing, out-and-back and repeated-lap ambiguity. A nearby point on a parallel road is not automatically the same route location.

Do not require external road-network snapping. This is comparison of recorded paths, potentially including trails, not a route-planning product.

Keep route geometry and timing-reference selection separate. A change of timing reference should not unexpectedly reconstruct the geographical comparison.

Open gate: choose and benchmark the algorithm, similarity/coverage thresholds, allowed start/end offsets and handling of sparse or unreliable recordings. Write the rationale and numeric acceptance tests before shipping.

### 10.3 Comparison extent and reference

Show which portions are compared, with excluded start/end portions disclosed. A short shared overlap must not be marketed as whole-route similarity.

All activities start their comparison clocks at the accepted common start, not at the calendar time when each was recorded.

Agreed: default to the fastest eligible complete attempt as reference, with user override. Recommended clarification: determine the default by elapsed time over the accepted common comparison extent; retain that reference when stop settings change rather than silently switching it.

Show original whole-activity totals separately when they differ from the compared extent.

### 10.4 Timing semantics

Let `T_i(d)` be activity `i`'s time to reach comparison-route position `d` under the selected time basis. Define:

`delta_i(d) = T_i(d) − T_reference(d)`

Positive means **behind / took longer**; negative means **ahead / took less time**. Use the same sign convention in charts, tooltips, summaries and tests.

For a section from `a` to `b`:

`section_difference_i = delta_i(b) − delta_i(a)`

Positive means time lost within the section; negative means time gained. This is not the same as the total gap at the section end.

At a stationary route position, preserve arrival/departure semantics so the stop's time appears in subsequent deltas. Do not erase stationary duration by collapsing repeated positions. Define before/after-stop behaviour and test it explicitly.

Interpolation is allowed only over justified continuous data. No extrapolated race positions across unknown gaps or unmatched portions. Round displays to defensible precision while retaining numerical precision internally.

### 10.5 Replay and linked exploration

Show distinguishable route overlays and animated markers. Provide play/pause, scrubbing, replay reset and speed selection. Finishers remain identifiable after reaching the comparison end.

Two interaction concepts must remain distinct:

- **Race playback:** a shared elapsed or adjusted clock determines each activity's own position; markers can be at different locations.
- **Route-position inspection:** a selected comparison distance shows each attempt's arrival time and available section information at that place.

Synchronisation must not force all racers to the same location and destroy the race visualisation. Recommended default: during replay, the delta-chart cursor follows the reference's position. Scrubbing by route distance pauses replay and clearly enters inspection mode.

Show reference, time basis, excluded stop duration and comparison extent prominently. Switching settings updates calculations and replay without mutating source data.

### 10.6 Significant gains and losses

Identify important non-overlapping gains/losses against the reference, with section distance, time difference and relevant available metrics. A selected result highlights the corresponding map section and graph interval.

Recommended default: show up to three gains and three losses where justified. Avoid rankings dominated by GPS jitter or overlapping windows of the same incident. Define section selection/minimum significance in a tested method; do not invent precise arbitrary segment boundaries in UI code.

If HR, power, gradient or other explanatory measurements are absent, show the timing result without fabricating a cause. Finding where time changed does not establish why it changed.

## 11. Stops and adjusted time

### 11.1 User controls — agreed

Provide per-activity controls with three states:

1. Include all stops — default actual elapsed comparison.
2. Exclude all eligible identified stops.
3. Custom — exclude selected individual stops.

Show each selectable interval on an accessible list and, when location is available, on the map/timeline. Include duration, approximate location/progress, identification method and any uncertainty.

### 11.2 Different interval meanings

Keep device-recorded timer pauses, algorithm-detected stationary intervals and unknown recording gaps distinct. Garmin distinguishes elapsed, timer and moving durations; these are not interchangeable totals. [S4]

A timer pause proves the timer was paused, not necessarily that the person was stationary. Label it accordingly. Unknown recording gaps are not automatically rest stops and must not be included in “exclude all stops”.

Stops require a documented detection policy, including noise handling and minimum duration. Slow uphill running must not be automatically treated as resting. Users must be able to leave uncertain intervals included.

### 11.3 Adjustment calculation

Original timestamps remain immutable. Given comparison start `t0`, current original time `t`, and the union `U` of selected exclusion intervals:

`adjusted_time(t) = (t − t0) − duration(U ∩ [t0, t])`

Intersect exclusions with the compared extent. Merge overlapping intervals before subtracting so no second is removed twice. Keep adjusted time non-decreasing. Do not double-subtract a device pause already represented by the source timer total: adjusted replay derives from the original elapsed timeline and explicit intervals.

Exclusion updates final timings, section differences, delta curves and replay. Reset restores elapsed results exactly. Original-file downloads remain unchanged.

Label the outcome **comparison with selected stop time removed**, not a prediction of how the athlete would have performed without resting. Rest may affect subsequent performance; this tool only changes the accounting of recorded time.

Removing an interval does not justify inventing a path across missing positions. If a pause includes movement or unknown geometry, retain that limitation in replay.

## 12. Fitness & Efficiency Indicators

### 12.1 Product boundary — agreed

Offer optional indicators within general comparison, not a diagnosis or a definitive fitness score. They may compare activities on different routes, but require adequate data and comparable effort conditions.

Do not claim that two arbitrary files prove improved fitness. Do not generate VO2max estimates, training prescriptions or an opaque aggregate fitness score in V1.

Recommended interpretation style:

> Output relative to recorded heart rate was higher in Activity B over the analysed sections. This can be consistent with improved aerobic efficiency, but conditions, fatigue, pacing and sensor differences also affect the result.

Metrics must be restricted to same-person interpretation; do not silently assume two imported files belong to the same athlete. Require an explicit same-person acknowledgement or avoid personal longitudinal conclusions. Raw comparisons remain available regardless.

### 12.2 Sport/data policy

| Data/context                                                          | Intended treatment                                                                                              |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Running with adequate HR, speed and reliable gradient                 | Evaluate a documented grade-adjusted speed/pace versus HR method                                                |
| Cycling with adequate recorded power and HR                           | Prefer output-versus-HR indicators; use gradient as context, not another automatic multiplier on measured power |
| Cycling without reliable power                                        | Raw speed, HR and gradient remain descriptive; any efficiency inference requires a separately justified model   |
| Missing HR                                                            | Do not offer HR-based aerobic efficiency or cardiac-drift interpretation                                        |
| Different sports, heavily intermittent efforts or inadequate coverage | Suppress inappropriate indicators and explain why                                                               |

Gradient is a first-class input when relevant. Elevation source, smoothing and supported gradient range matter. Do not calculate a plausible-looking grade-adjusted metric from unreliable altitude or assume device temperature fully represents ambient conditions.

Heart-rate zones, thresholds, rider mass and other unknown parameters must not be invented. No remote weather, elevation or wind enrichment is required for V1.

### 12.3 Method and comparability gate

Possible indicators discussed include output/HR efficiency and aerobic decoupling. TrainingPeaks documents related metrics, but that does not validate our implementation or make arbitrary rides comparable. [S5]

Before a calculation ships, document its formula, units, aggregation/weighting, required coverage, effort-selection rules, pause/warm-up handling, HR lag treatment, exclusions and limitations. Verify any naming/licensing implications of branded metrics. Add known-answer and unsuitable-input tests.

Use data-quality and comparability labels, with reasons. A label such as “good comparability” is not a calibrated probability that fitness improved. Do not display invented confidence percentages or numerical fitness improvements.

This method-selection work is an explicit Stage 6 gate. Until it is resolved, withhold the affected indicator rather than substitute an improvised formula. The viewer and raw comparison must remain usable.

## 13. Privacy, security and third-party boundaries

### 13.1 Agreed boundary

Activity files and derived activity contents are processed locally in the browser. No server uploads, cloud activity storage, user accounts or API-backed activity analysis in V1.

Suggested public wording:

> Your activity files are processed in your browser and are not uploaded by this tool.

Do not expand that into “nothing ever leaves your device”. Website hosting, online basemaps and optional advertising/analytics generate network requests. Map tile requests may reveal the viewed area to the provider; that is a consequence of requesting the relevant geographic tiles, even though our GeoJSON stays local. Explain this distinction in the privacy information and supplier assessment. [S10]

Do not send activity coordinates, route geometry, filenames, file hashes, activity IDs, timestamps, sensor values or user-entered labels to analytics, advertisements or error reporting. Do not place those values in URLs, structured data, page titles or social metadata.

### 13.2 Implementation safeguards

Keep parser/analysis modules free of network dependencies. Restrict third-party integrations to explicit boundaries. No remote geocoding, road matching, elevation enrichment or activity-file URL fetching by default.

Use allowlisted coarse analytics events rather than automatic state capture. No session replay or DOM/form autocapture on activity tools. Scrub errors before transmission; raw parser messages can contain private values.

Use a documented content-security policy compatible with required workers/maps and later approved ads. Client-exposed provider keys are not secrets; restrict their scopes/origins where supported. Never include a secret in the static build.

Verify network behaviour before release and when adding any third-party script. A passing test should inspect relevant outbound requests with deliberately recognisable test data, not merely assert that our own code contains no upload function.

Do not claim that browser-only processing guarantees isolation from all third-party JavaScript. Minimise and review scripts, and re-test the promise after advertising is enabled.

## 14. Agreed stack and repository structure

| Concern                                              | Decision                                       |
| ---------------------------------------------------- | ---------------------------------------------- |
| Application                                          | Next.js App Router, React and TypeScript       |
| Package management                                   | pnpm                                           |
| UI                                                   | Chakra UI                                      |
| Maps                                                 | MapLibre GL JS; replaceable basemap provider   |
| Charts                                               | Recharts                                       |
| Domain tests                                         | Jest                                           |
| Frontend integration and appropriate component tests | React Testing Library with Jest                |
| Browser integration                                  | Focused Playwright where necessary             |
| Hosting                                              | Cloudflare Pages with a Next.js static export  |
| Runtime processing                                   | Browser-only; workers for expensive operations |

Use a single application repository initially, not a monorepo. Suggested responsibility boundaries:

```text
src/
  app/                  # Routes, static page content and metadata
  components/           # Shared product UI
  features/             # Tool-specific interactions
  domain/               # Canonical types and capability rules
  parsers/              # Format adapters
  exporters/            # GPX generation and preservation rules
  analysis/             # Geometry, timing, stops and metrics
  workers/              # Worker entry points and typed messages
  mapping/              # MapLibre integration and provider configuration
  charts/               # Chart adapters and display datasets
  telemetry/            # Allowlisted events; no activity contents
  content/              # Tool/help content if separated from route files
tests/fixtures/        # Permissioned/sanitised real and synthetic fixtures
docs/                  # Specification, decisions and methodology
```

The structure is illustrative; responsibilities matter more than folder names. Avoid wrapping every Chakra primitive. Create shared product components where they remove repeated behaviour.

Pin the pnpm version through `packageManager`, commit `pnpm-lock.yaml`, document a supported Node version and use frozen-lockfile installs in CI. Do not introduce another package manager, replace Jest with Vitest, or change the UI stack without approval.

Choose compatible stable dependency versions at implementation time and record them; this specification does not claim an exact latest release. Chakra documents current Next.js integration, and Next.js documents Jest/RTL setup. [S6, S7]

## 15. Static architecture, workers and charts

### 15.1 Static page/application separation

Use Next.js `output: 'export'`. Build-time HTML contains the title, useful explanatory content, metadata and navigation for each published tool. Browser-only interaction layers read local files and run maps/charts.

Static export produces deployable assets and runs applicable Server Components at build time. Do not introduce request-dependent server features, Server Actions, runtime API routes or server file processing into V1. Browser API access must occur at a safe client boundary. [S8]

Do not use disabling SSR for the entire tool page as a shortcut that removes its indexable content. Keep interactive code lazy-loaded where practical. A simple converter should not download the whole replay engine just to render its page.

### 15.2 Processing boundaries

Keep mathematics and format logic independent of React, Next.js, Recharts and MapLibre. Define typed worker requests/results, request IDs, cancellation and error handling. Discard stale results when inputs or settings change.

Move CPU-heavy operations off the main thread where benchmarks justify it. Avoid unnecessary full-size copies of large recordings. Do not require shared-memory infrastructure or a worker pool without evidence.

A future provider importer should be able to feed the same canonical model, but do not create OAuth, token handling, a backend or a generic plugin platform now.

### 15.3 Charts

Use Recharts for V1. It supports synchronised charts and custom synchronisation methods, but the application must own the selected time/distance state. Do not rely on array-index synchronisation for differently sampled activities. [S9]

Downsample display datasets independently from full-resolution analysis. Preserve important gaps, extrema and stop transitions. Ensure tooltips refer to a defined underlying measurement or interpolation, not an unexplained visual bucket.

Use numeric continuous axes and consistent units. Do not connect null values or smooth a line in a way that implies supported measurements through an unknown interval.

Benchmark before committing to display point limits. Replacing the renderer later must not require changing canonical data or analysis formulas.

## 16. Mapping and operating-cost controls

### 16.1 Settled architecture

MapLibre GL JS is the renderer. Application routes, stops, sections and animated markers are locally supplied overlays. Keep style/tiles, attribution, credentials and endpoint configuration separate from those overlays.

No provider-specific route-planning or geocoding API is needed. Basemap replacement should not require rewriting the analysis or interactions. Do not build a general mapping abstraction beyond these actual needs.

### 16.2 Provider is unresolved — first public map release gate

**Correction to the earlier discussion:** Mapbox's map-load free allowance for Mapbox GL JS is not the billing model for MapLibre. Mapbox documents individually billed tile requests when its maps are consumed through a third-party renderer. No 50,000-free-map-load assumption is authorised for this architecture. [S10]

Before adopting any hosted basemap, record commercial permission, supported renderer, attribution, storage/caching rights, free allowance, billing unit, overage behaviour, card requirement, hard limits and failure mode. Check current terms, not a remembered marketing headline.

Measure actual requests for representative initial views, zooms and comparison sessions. Do not equate visits with map loads or map loads with tile requests.

OpenStreetMap's public raster tile service is not this product's production backend. Its policy describes limited shared infrastructure rather than an unlimited hosted-map entitlement. This is an architectural risk decision, not a claim that OSM bans all commercial sites. [S11]

Development may use local/test tiles or an explicitly permitted development service. Demo endpoints must not accidentally become production dependencies.

### 16.3 Escape hatch and failure behaviour

Preserve compatibility with a future OSM-derived PMTiles/static-tile setup. This is an option, not a zero-cost promise or a V1 requirement. Storage, request delivery, styles, fonts, map-data updates, licences and maintenance would all need a separate assessment.

Provide an operator-controlled way to disable an external basemap. When unavailable or quota-limited, retain local analysis and explain the missing background map; never silently switch to a paid provider.

Do not describe client-side code or monitoring alerts as an enforceable supplier spending cap. Prefer a provider-side hard limit, a genuinely non-billable allowance, or an explicitly approved maximum exposure.

## 17. SEO and public content

Each published tool has a permanent independent URL, the actual usable tool, a unique title/description and helpful static content. Explain supported data, how to use the tool, output meaning, limitations, privacy and related tools.

Keep generic pages sport-neutral. Create sport-specific pages only for distinct useful content/functionality; do not generate duplicate run/ride pages with changed nouns. Useful content and avoidance of doorway pages align with Google's published guidance. [S12, S13]

Provide absolute canonical URLs and a sitemap of published routes using `https://gpsgoblin.com` as their origin. Use the same origin for Open Graph page URLs, site-hosted sharing assets and applicable structured-data site/page URLs; set the Open Graph site name to GPSGoblin. Use descriptive tool titles with the GPSGoblin brand, for example **“GPX File Viewer — GPSGoblin”**. Provide appropriate robots directives and structured data only where truthful and applicable. The production robots file must reference the sitemap on `https://gpsgoblin.com`. Exclude preview hosts, the production `pages.dev` hostname, unfinished tools and user-specific results from the sitemap. Never fabricate reviews or expect structured data to guarantee a search enhancement.

Keep the tool above lengthy copy. Do not impose an SEO word count or populate a blog to delay release. Publish focused guides later when they address a real user/search need.

The GPSGoblin homepage should explain the collection using the agreed descriptive tagline and list available tools. Recommended supporting pages: about/contact, privacy, relevant cookie/consent information and limitations/terms that reflect the actual service. Use a simple contact method; support-ticket infrastructure is not required.

Production metadata must never contain local activity data. Generated downloads and user-specific results are not public SEO pages.

## 18. Advertising and analytics

### 18.1 Advertising — agreed

Google AdSense is the intended initial mechanism, not a launch dependency or guaranteed approval. No paywall, subscription or account requirement in V1.

Make layouts ad-ready without leaving obstructive empty spaces before ads are enabled. No advertisements inside upload targets, maps, charts or result controls; no misleading download buttons or blocking interstitials. Avoid disruptive layout shifts.

The tools must work with rejected consent, blocked ads or an unavailable ad service. Do not artificially split a workflow into extra page views or refresh advertisements to manufacture impressions.

Before enabling ads, select and implement the applicable consent approach, review current publisher policies, and verify script/privacy behaviour. Google documents certified-CMP/TCF requirements for ads in the EEA, UK and Switzerland. A CMP choice does not by itself certify legal compliance. [S14]

No invented traffic minimum for AdSense approval belongs in the spec. Approval/content requirements must be checked at application time.

### 18.2 Analytics — agreed boundary; supplier unresolved

Use Google Search Console for available search impressions, clicks, queries and landing pages. Collect product signals only through a reviewed, minimal implementation.

Suggested coarse events:

`tool_started`, `file_loaded`, `processing_succeeded`, `processing_failed`, `comparison_completed`, `conversion_downloaded`, `related_tool_opened`.

Allowed properties should be small enumerations such as tool ID, recognised format and controlled error code. Do not send raw errors, activity details or arbitrary strings. Do not add invasive tracking solely to measure returning athletes.

Assess revenue by page/tool using the reporting actually available from the chosen advertising system. Attribution will be approximate; do not present it as exact profit per visitor.

Keep an external operating-cost/revenue record initially rather than building an admin dashboard. If analytics supplier or consent setup is unresolved, ship with product telemetry disabled rather than quietly adding a default tracker.

## 19. Testing and quality gates

### 19.1 Test allocation — agreed

**Jest:** parsers/adapters, exporters, capability rules, geometry, time calculations, stop handling, metric formulas, malformed data and numerical invariants.

**React Testing Library + Jest:** frontend integration flows and component behaviour where useful. Test semantic, user-visible interactions rather than internal state or implementation details.

**Focused Playwright:** browser file selection/download, actual worker integration, map/chart coordination, static-export navigation and representative mobile behaviour when unit/integration tests cannot establish them.

Next.js documents that Jest does not currently support async Server Components directly. Use static-output checks or targeted browser tests for those boundaries rather than switching the agreed test stack. [S7]

Do not impose a large E2E suite or arbitrary coverage percentage. Critical data correctness and failure behaviour matter more than the number of assertions.

### 19.2 Required fixture categories

Maintain permissioned/sanitised real recordings from multiple exporters, plus small synthetic known-answer cases. Cover:

- Continuous recordings, optional metrics, no timestamps, no GPS and no elevation.
- Multiple tracks/segments/sessions, planned routes and unsupported FIT subtypes.
- Duplicate/non-monotonic timestamps, malformed/truncated files and resource limits.
- Pauses, stationary GPS jitter, overlaps between detected and recorded intervals, unknown gaps and genuine slow motion.
- Same route with sampling/noise differences, small offsets, reversed routes, loops, crossings and ambiguous overlap.
- Real zero measurements versus missing measurements; irregular sampling; invalid sensor values.

Do not fabricate claims that real files were tested. Record fixture provenance and test commands/results.

### 19.3 Numerical acceptance examples

1. Two identical eligible recordings produce zero delta within a declared floating-point tolerance.
2. A known 60-second stationary interval produces a 60-second downstream elapsed disadvantage; excluding only it removes only that interval from the accounting.
3. Overlapping exclusions are unioned, never double-counted.
4. Resetting stop selections restores the original comparison exactly.
5. Different sampling frequencies on equivalent synthetic motion do not create artificial time gains.
6. A reversed route is rejected by the V1 whole-route policy rather than accepted because coordinates overlap.
7. Section differences reconcile with endpoint deltas, with gaps/exclusions explicitly represented.
8. Chart downsampling does not change analysis results.
9. A missing altitude or timestamp does not become a fictitious measurement.
10. Unsupported fitness comparisons produce a reason for unavailability, not a numeric score.

### 19.4 Common definition of done

A publicly released tool must have a useful complete workflow, documented compatibility/limitations, relevant automated tests, readable errors, mobile/accessibility checks and a verified static production build.

Check that useful content exists in returned HTML, public links work on direct load, third-party failures degrade safely and activity content is absent from outbound telemetry.

Verify deployment metadata and indexing on the actual hosts: released production pages use `https://gpsgoblin.com` canonical/Open Graph URLs and GPSGoblin branding; sitemap entries and its robots reference use that origin; production is not accidentally marked `noindex`. Check permanent redirects from the Cloudflare Pages production hostname for both the root and a nested tool path, preserving paths and query strings without loops. Verify `noindex` on preview deployments, including branch previews, independently of production. These checks are required for Stage 1 and relevant subsequent deployment changes.

Record measured file-size/performance limits on named test devices/browsers before advertising them. Do not claim universal device support or arbitrary processing times.

## 20. Hosting and custom domain

Deploy the Next.js static export directory (`out/`) to Cloudflare Pages. No Next.js runtime server, Pages Functions or Worker application backend is required for V1.

Cloudflare currently documents static asset requests as free and unlimited when they do not invoke Functions; platform limits still apply. This does not make third-party tiles, a domain or future object storage free. [S15, S16]

Use one build pipeline with documented pnpm/Node versions, type checking, linting, appropriate tests and static build verification. Preserve a straightforward rollback path.

The product name **GPSGoblin** and owned domain **`gpsgoblin.com`** are settled. The canonical production origin is **`https://gpsgoblin.com`**. A placeholder site is already live there; replace it with the useful Stage 1 release when the relevant public-release gates pass. Development/previews may use Cloudflare addresses.

Configure canonical URLs, sitemap entries, the robots sitemap reference and Open Graph/sharing metadata from a single public-origin setting fixed to `https://gpsgoblin.com`; do not derive the public origin from an incoming host or a preview deployment URL. Permanently redirect the Cloudflare Pages production `pages.dev` hostname to `https://gpsgoblin.com`, preserving the matching path and query string with an HTTP 301 or 308 response. Do not collapse nested tool URLs onto the homepage. Scope the redirect to the production hostname so preview deployments remain usable, and verify that the custom-domain destination does not redirect back or loop. Cloudflare documents both custom-domain setup and this redirect mechanism. [S17, S18]

Preview deployments, including branch previews, must remain non-indexable using a verified `noindex` robots directive (for example, an `X-Robots-Tag: noindex` response header). Cloudflare documents a default preview `noindex` header, which must be verified rather than assumed; a production canonical URL does not replace this requirement. Do not accidentally apply preview `noindex` directives to released pages on `https://gpsgoblin.com`. `noindex` is not authentication or access control. [S19]

The owner has already chosen GPSGoblin and purchased `gpsgoblin.com`; do not reopen name selection or domain purchase as a release gate. Retain domain registration and renewal costs in the operating-cost record, using the registrar's actual terms. New purchases, registrations, production supplier accounts or enabling billing still require the owner's action/approval; do not perform them autonomously.

## 21. Explicit non-goals and extension points

### Outside V1

Accounts, cloud activity history, OAuth or direct Garmin/Wahoo/Fitbit/Strava imports; social features; native mobile apps; paid subscriptions; AI-generated coaching; route planning; general GPX editing; file repair; offline map downloads; automatic weather/elevation enrichment; arbitrary new converters/calculators; export of manipulated performance records.

Partial-route/automatic common-segment comparison and general lap matching are future capabilities, not required first-release UI.

### Preserve only these relevant extension points

- New file/import adapters can produce the canonical model.
- Matching returns explicit sections rather than assuming complete activity equivalence.
- Time adjustment is separate from source recordings.
- Maps and charts consume derived data rather than owning the algorithms.
- Basemap provider configuration can change without replacing application overlays.
- Static deployment can be reconsidered if a future justified feature requires a server.

Do not implement empty services, speculative databases or a generic plugin framework just to demonstrate extensibility.

## 22. Open decisions and when they matter

O1 is retained below as a resolved decision for traceability. All other open items remain unchanged.

| ID  | Item / status                                                                                                                                                | Required by                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| O1  | Resolved: GPSGoblin; `gpsgoblin.com` purchased; canonical origin `https://gpsgoblin.com`. Record actual registration/renewal costs under operating expenses. | Name/domain selection and purchase are complete; verify production configuration before Stage 1 release |
| O2  | Production basemap: terms, attribution, actual metering, privacy, limits and graceful failure                                                                | First public map-enabled release                                                                        |
| O3  | GPX/TCX/FIT parser choices, licence checks and published format/extension coverage                                                                           | Each affected format release                                                                            |
| O4  | Benchmark-derived file/sample limits and browser support matrix                                                                                              | Each affected tool release                                                                              |
| O5  | Privacy wording, contact details, security headers and third-party inventory                                                                                 | First public release; update before new suppliers                                                       |
| O6  | Analytics supplier, consent/legal assessment and event implementation                                                                                        | Before product telemetry is enabled                                                                     |
| O7  | AdSense approval, ad placement, CMP and advertising privacy verification                                                                                     | Before advertisements are enabled                                                                       |
| O8  | Matching algorithm, correspondence/coverage thresholds, offsets and ambiguity rules                                                                          | Stage 5 release                                                                                         |
| O9  | Stop detector, interval eligibility and significant-section extraction methods                                                                               | Stage 5 release                                                                                         |
| O10 | Efficiency formulas, effort-selection rules, grade adjustment and interpretation validation                                                                  | Stage 6 release                                                                                         |
| O11 | Whether simple GPX Merge remains inexpensive enough                                                                                                          | Stage 3 scope checkpoint                                                                                |

Only the affected milestone is blocked by an unresolved item. For example, O10 must not delay the GPX viewer. O1 is settled; the domain, redirect and indexing checks in Sections 19–20 remain release requirements.

If a candidate cannot meet the no-unapproved-spend constraint, report the conflict. Do not quietly change the constraint or substitute another supplier.

## 23. Post-launch evaluation

Review actual search visibility, successful tool usage, user-reported problems, supplier costs, revenue and maintenance effort. Distinguish poor distribution from a tool people reach but cannot use successfully.

Choose additional tools/guides from observed demand and shared implementation leverage. Do not expand merely to increase the number of indexable URLs.

Recommended default: review monthly and at each stage boundary. No automatic kill date, feature spending limit or ranking target has been agreed. Set investment decisions using results and effort, not a promise that traffic will eventually appear.

Stop or reduce further investment if acquisition remains weak and there is no convincing low-cost improvement. A low-cost functioning site can remain online without an obligation to keep expanding it.

## 24. Instructions for the first Codex implementation session

Read this specification, inspect the actual repository before assuming anything exists, and preserve completed work.

Create or update a concise implementation plan for **Stage 1 only**, explaining how it respects the later canonical-model, comparison-section and time-adjustment boundaries without implementing those advanced features now.

Resolve stage-relevant technical choices with current primary documentation and small experiments. Record decisions and distinguish verified results from assumptions. Do not rewrite the agreed stack or re-ask settled product questions.

Implement a thin GPX-viewer vertical slice: static landing page, local import, canonical representation, useful summary, local route overlay, available elevation/timing displays, clear missing-data behaviour, tests and static build.

Use a permitted local/development map setup while O2 is open. Do not ship a guessed production tile provider, fabricate credentials or enable a paid account. Use GPSGoblin branding and `https://gpsgoblin.com` as the production origin from the first stage. Work on unblocked code while any remaining release gates are resolved; name and domain selection are already settled.

At the end of the stage report what works, tests actually run, build status, known limitations, open release gates and changes to this specification. Do not report the full V1 as complete because the first viewer works.

## 25. Primary-source register

These references support specific technical and policy facts, not a claim that the business will be profitable. Checked on 6 September 2026. Recheck pricing, policies and version compatibility when implementing or enabling the relevant service. URLs are included for the implementation agent.

**[S1] Topografix — GPX 1.1 schema documentation.** Tracks/routes/waypoints, segments, optional time/elevation and extensions.
`https://www.topografix.com/GPX/1/1/`

**[S2] Garmin — Decoding FIT activity files.** Activity/session/lap and recorded-data concepts.
`https://developer.garmin.com/fit/cookbook/decoding-activity-files/`

**[S3] Garmin — Official FIT JavaScript SDK repository.** Browser-compatible runtime, decoder and source for licence/dependency evaluation.
`https://github.com/garmin/fit-javascript-sdk`

**[S4] Garmin — Elapsed, timer and moving durations.** Distinct duration concepts.
`https://developer.garmin.com/fit/cookbook/durations/`

**[S5] TrainingPeaks — Advanced Analysis Metrics.** Reference definitions for related metrics, not validation of this product.
`https://help.trainingpeaks.com/hc/en-us/articles/204072154-Advanced-Analysis-Metrics`

**[S6] Chakra UI — Next.js App Router integration.** Current compatibility/setup guidance.
`https://chakra-ui.com/docs/get-started/frameworks/next-app`

**[S7] Next.js — Jest testing guide.** Jest/RTL setup and async Server Component limitation.
`https://nextjs.org/docs/app/guides/testing/jest`

**[S8] Next.js — Static exports.** Build-time HTML, output export and unsupported runtime features.
`https://nextjs.org/docs/app/guides/static-exports`

**[S9] Recharts — LineChart API.** Synchronisation options and default index behaviour.
`https://recharts.github.io/en-US/api/LineChart/`

**[S10] Mapbox — Use Mapbox APIs in MapLibre GL JS.** Third-party-renderer tile-request billing; tile request mechanics.
`https://docs.mapbox.com/help/dive-deeper/mapbox-in-maplibre/`

**[S11] OpenStreetMap Foundation — Tile Usage Policy.** Public tile infrastructure limits and conditions.
`https://operations.osmfoundation.org/policies/tiles/`

**[S12] Google Search Central — Creating helpful, reliable, people-first content.** Content principles.
`https://developers.google.com/search/docs/fundamentals/creating-helpful-content`

**[S13] Google Search Central — Spam policies.** Doorway/scaled-content boundaries.
`https://developers.google.com/search/docs/essentials/spam-policies`

**[S14] Google AdSense — Consent-management requirements for EEA, UK and Switzerland.** Certified CMP/TCF requirements; check the applicable publisher configuration before enabling ads.
`https://support.google.com/adsense/answer/13554020?hl=en`

**[S15] Cloudflare Pages — Pricing.** Static asset request pricing versus Functions.
`https://developers.cloudflare.com/pages/functions/pricing/`

**[S16] Cloudflare Pages — Limits.** Plan-specific platform constraints.
`https://developers.cloudflare.com/pages/platform/limits/`

**[S17] Cloudflare Pages — Custom domains.** Domain attachment.
`https://developers.cloudflare.com/pages/configuration/custom-domains/`

**[S18] Cloudflare Pages — Redirecting pages.dev to a custom domain.** Production canonical-host setup.
`https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/`

**[S19] Cloudflare Pages — Preview deployments.** Default noindex behaviour.
`https://developers.cloudflare.com/pages/configuration/preview-deployments/`
