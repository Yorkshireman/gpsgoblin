# Large-file implementation and evidence — issue #4

This report completes the implementation evidence begun in the
[import profiling](import-benchmarks.md) and
[chart performance](chart-performance.md) reports. The tested workloads are
examples, never application limits. No byte, point, XML complexity, structure
count or processing deadline has been added. The single-document workflow remains.

## Processing and ownership

The import worker now extracts the canonical GPX document in one strict SAX pass.
The previous validation pass followed by a DOM construction/traversal pass is
gone, along with `@xmldom/xmldom`. Unknown extensions still undergo XML validation
and remain in the original source, without building another element tree. DOCTYPE
declarations and malformed XML are rejected; markup and embedded URLs are never
executed or fetched. Tested field precedence, raw timestamps, names, identifiers
and error ordering remain unchanged.

The same worker calculates full-resolution distances, timing and measurements,
then keeps compact numeric columns and segment summaries. It sends the canonical
document to the page and releases its source objects and XML after that response.
Smoothing and unit/pace conversion also run in this worker. Numeric view buffers
are transferred rather than structured-cloned. Static analysis columns are sent
only until the receiving view has them; subsequent settings responses contain
display columns alone, avoiding an unnecessary 8 MB copy per update at 250,000
points. Cancelled initial responses do not mark those columns as received.
Original samples remain complete
on the page for source details and exact selection; chart reduction affects only
drawing. No stop exclusion or new pace policy is introduced here; that is #13.

Each imported file owns one measurement session. At most one settings calculation
runs and one newest request waits. Superseded results cannot overwrite the current
view, and settings changes retain the last completed chart with its matching units
until its replacement arrives. Pending feedback appears beside the Chart and
Smoothing labels without adding a layout row. Recoverable calculation failures
retain the previous view and provide a retry action.

Cancel terminates a pending import. A failed or cancelled replacement preserves
the existing file and its measurement worker. Successful replacement disposes the
old worker and remounts file-owned view state so previous selections and errors
cannot retain the previous recording. Clear and unmount terminate remaining work.

Phones mount a map only when View on map opens its dialog and dispose it on return.
Desktop mounts one inline map. Resizing switches between these branches while
preserving source selection. This removes the previous CSS-hidden desktop map
that remained mounted on phones and duplicated the dialog's map allocation.

Incremental file reading was considered after removing the transient DOM. The
current source-preservation contract retains the full original XML string, so
`File.stream()` alone would not remove that retained representation. The selected
change removes the measured second parse/tree while preserving that contract;
streamed source storage would need a separate, evidence-led model change.

## Measurement method

The final production static export is tested on Apple M2 / 16 GiB, macOS 26.6.2,
with Chrome 153.0.8010.36, Node 24.20.0 and pnpm 12.3.4. Timed browser trials run
separately from builds, tests and other profiling. Desktop content viewport is
1280×720; the phone layout probe is 390×844 on the same Mac.

`pnpm benchmark:imports` records worker creation through loaded controls and two
animation frames, an initial chart-paint proxy. Worker round trip now includes
parsing, full-resolution analysis, source copying and delivery. The subsequent
phase includes the first numeric view request as well as page rendering. Neither
phase isolates browser clone/transfer time. Node phase isolation measures a
structured clone separately; it is not interchangeable with browser timings.
The largest import Long Task and sampled page heap exclude later interaction
work. Keyboard selection, chart click and smoothing timings include automation
scheduling and two frames; smoothing waits for the completed worker view.
CDP 4× slowdown throttles page CPU, not worker CPU equivalently.

`pnpm profile:browser-memory` launches a fresh Chrome process per trial and samples
the sum of RSS for it and its descendants every 100 ms, through import, selection
and a one-second observation tail. RSS includes shared pages and process overhead,
may miss shorter peaks, and is not precise physical memory consumption. Paired
WebGL-enabled/disabled trials exercise the actual map fallback and estimate the
incremental map workload; they are not an exact isolated map-render timing.
Selected-marker readiness is also recorded separately from the chart-paint proxy.

Both harnesses accept a private path through `GPX_VERIFY_FILE`; outputs retain only
coarse metrics under `private-recording`, without its path or source values. See
the scripts and earlier report for workload settings. Automation timeouts bound
the investigation, not the application.

## Final timing results

Measured 12 September 2026. All 30 desktop trials and eight phone-layout trials
loaded successfully with complete source counts. Three desktop trials per case
and CPU rate are retained in [raw desktop results](benchmarks/finalImportsDesktop.jsonl).
Ranges below are milliseconds, except sampled page heap.

| Input | Worker → chart painted | Worker round trip | Largest main task | Keyboard selection | Smoothing completed | Page heap MiB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Complete private, 8,142 points | 216–254 | 59–66 | 76–82 | 67–73 | 82–100 | 21–22 |
| Complete sanitised, 8,142 | 205–218 | 45–47 | 77 | 67–70 | 83–84 | 20–21 |
| 10,000 points | 204–219 | 47–48 | 75–76 | 55–71 | 83–84 | 21 |
| 100,000 points | 831–833 | 254–258 | 93–94 | 59–67 | 100–117 | 68–80 |
| 250,000 points | 1,053–1,071 | 619–624 | 127–129 | 69–83 | 150 | 152–163 |

At 250,000 points, the previous chart-optimised slice loaded in 2,514–2,646 ms,
with a 298–315 ms largest main task. This final slice reduces those to about
1.1 seconds and 128 ms respectively. The original unreduced baseline was about
5.1 seconds and 2.9 seconds. Keyboard selection remains similar to the already
optimised chart slice. Native chart clicks take 120–137 ms at 250,000 points.

The desktop series preceded the final phone-map lifecycle correction. A
[fresh-browser desktop check afterwards](benchmarks/finalDesktopMapSmoke.jsonl)
loaded 250,000 points in 1,331 ms native / 2,340 ms slowed, with 128 / 500 ms largest
main tasks. Retain that variation alongside the main series. The phone results
below were rerun after the correction.

Workers do not necessarily shorten an individual settings round trip: completed
smoothing now takes 150 ms at 250,000 points, versus 116–117 ms in the earlier
synchronous chart slice. The update travels through the worker and back, while
the page retains a usable previous view and coalesces rapid requests. The final
harness explicitly waits for the completed view. These results do not establish
that every interaction became faster.

At 4× **page** CPU slowdown:

| Input | Worker → chart painted | Largest main task | Keyboard selection | Smoothing completed |
| --- | ---: | ---: | ---: | ---: |
| Complete private | 747–781 | 329–350 | 187–196 | 267–285 |
| 10,000 points | 711–736 | 316–320 | 170–177 | 266–267 |
| 100,000 points | 1,308–1,366 | 395–430 | 204–218 | 365–367 |
| 250,000 points | 2,312–2,400 | 512–532 | 200–217 | 482–483 |

The earlier 250,000-point chart slice took 4,253–4,323 ms to load with a
1,205–1,222 ms main task at this slowdown. Remaining pauses are still material
on constrained CPUs; these desktop measurements do not establish physical-phone
responsiveness. Post-initial-delivery time at 250,000 points is 429–452 ms native
and 1,634–1,714 ms slowed, including the asynchronous initial view and rendering.

The [phone-layout probe](benchmarks/finalImportsPhone.jsonl) used one trial per
case/rate on the same Mac, not a physical phone:

| Input | Native load | Native largest main task | Native selection | 4× load | 4× largest main task |
| --- | ---: | ---: | ---: | ---: | ---: |
| Complete private | 207 | 80 | 72 | 473 | 285 |
| Complete sanitised | 146 | 72 | 62 | 403 | 254 |
| 100,000 points | 833 | 83 | 61 | 973 | 344 |
| 250,000 points | 930 | 112 | 59 | 1,733 | 463 |

Phone-layout 250,000-point smoothing took 133 ms native / 417 ms slowed; chart
clicks took 108 / 226 ms. The position slider retained all 250,000 source samples,
while the line drew 1,824 vertices (3,619 on desktop).
The [earlier phone probe](benchmarks/phoneBeforeMapDeferral.jsonl) is retained to
show the map-deferral change: native load was 1,034 ms and sampled page heap
157 MiB before opening the dialog, compared with 930 ms and 126 MiB afterwards.
These are single probes, not distributions or physical-phone measurements.

The final [Node phase isolation](benchmarks/finalImportsPipeline.jsonl) runs the
actual modules without browser rendering, three trials per case:

| Input | GPX parsing | Structured clone | Analysis + packing | Initial view preparation | Heap just after parsing MiB |
| --- | ---: | ---: | ---: | ---: | ---: |
| Complete private | 36–42 | 6–7 | 9–12 | 1–3 | 26–54 |
| 10,000 points | 65–67 | 8–10 | 10–12 | 3–7 | 55 |
| 100,000 points | 633–704 | 62–65 | 86–90 | 6–9 | 98–153 |
| 250,000 points | 1,621–1,775 | 163–177 | 209–231 | 20–31 | 209–304 |

The original Node pipeline parsed 250,000 points in 3,789–3,850 ms and sampled
1,128–1,285 MiB immediately afterwards. Eliminating the temporary DOM substantially
reduces that transient allocation. Final forced-GC retained heap is 234–328 MiB
while this diagnostic harness deliberately holds original and cloned documents
and the prepared store/view. These are Node samples, not browser peak memory or
minimum device requirements; GC and JIT behaviour vary between runs.

In the saved third native 250,000-point CPU profile, sampled main-thread self time
attributed 79.8 ms to the import-response callback, 57.2 ms to MapLibre dispatch and
serialization, 49.3 ms to garbage collection, 27.8 ms to chart reduction and 25.5 ms
to numeric-column adaptation. Minified locations were matched to the corresponding
built chunks. The 4× figures were 350.2, 239.7, 137.6, 109.7 and 55.6 ms. These
categories are not complete phase timings; callback attribution does not isolate
structured-clone or transfer costs. Source delivery, map preparation and allocation
and rendering work remain after parsing and calculations move into the worker.

## Browser memory and map observations

All 36 initial paired RSS trials and 18 final phone trials loaded with complete
source counts and no sampling errors. Every normal-WebGL trial reached the selected
map marker. [Desktop trials](benchmarks/browserMemoryDesktop.jsonl) and
[structured-input trials](benchmarks/browserMemoryStructured.jsonl) use three runs
per mode; these precede the final phone-only map correction. Normal-map ranges:

| Input | Chart readiness ms | Largest main task ms | Peak sampled aggregate RSS MiB |
| --- | ---: | ---: | ---: |
| Complete private | 203–251 | — | 1,111–1,117 |
| Plain 250,000 points | 1,028–1,036 | 121–124 | 1,550–1,594 |
| Extensions, 50,000 points / 25,200,139 bytes | 821–825 | 81–89 | 1,282–1,329 |
| Fragmented, 50,000 points / 2,500 segments | 504–559 | 205–239 | 1,284–1,321 |

At 250,000 points, sampled RSS growth above the fresh-browser baseline was
565–609 MiB with the map. WebGL-disabled pairs reached chart readiness in
890–897 ms and sampled 1,376–1,447 MiB aggregate RSS. Paired differences were
138–141 ms in readiness and 143–209 MiB in RSS growth. They estimate the incremental
map workload, with GC and sampling uncertainty. Fragmented input's chart-readiness
differences ranged from −1 to 102 ms, so no precise causal saving is assigned there.
Its selection took 162–179 ms and its larger main tasks remain a practical cost of
preserving many separate fragments.

The original phone probe exposed the duplicate map allocation. After correcting
it, [three final phone trials per mode](benchmarks/browserMemoryPhone.jsonl) gave:

| Input | Chart readiness ms | Keyboard selection ms | Explicit map opening → marker ms | Peak sampled aggregate RSS MiB |
| --- | ---: | ---: | ---: | ---: |
| Complete private | 137–163 | 65–66 | 171–201 | 1,102–1,106 |
| Complete sanitised | 123–129 | 48–49 | 152–187 | 1,099–1,104 |
| Plain 250,000 points | 898–1,321 | 80–82 | 267–285 | 1,534–1,540 |

One 250,000-point trial in each mode took approximately 1.3 seconds; the full ranges
are retained. Since the map is now created only after the button is used, normal
versus WebGL-disabled initial chart timing is variation, not an initial map cost.
Map timing includes dialog interaction and two frames after the selected marker
appears; it does not prove complete route-geometry drawing.

Final 250,000-point post-map page heap was 155–160 MiB, versus 198 MiB in the
[earlier single phone probe](benchmarks/browserMemoryPhoneBefore.jsonl). Aggregate
RSS was 1,534–1,540 MiB versus 1,626 MiB. This is directional diagnostic evidence,
not a confidence interval from matched multi-run baselines. Without opening the
map, the final WebGL-disabled trials sampled 128 MiB page heap. Aggregate RSS
includes shared pages and substantial browser overhead; it must not be treated
as unique physical RAM or a minimum phone memory requirement.

## Evidence boundary

The owner's complete 8,142-point recording is an ordinary baseline. Compatibility
checks also exercise 12-hour and 48-hour recordings, ignored structured extensions,
and 50,000 samples spread across 2,500 segments with missing measurements. The
250,000-point performance workload represents about 69 hours at one-second
sampling; duration alone does not predict file complexity.

Chrome, Playwright Firefox and WebKit engine checks on this Mac do not establish
native Safari, iOS Safari or physical Android/iPhone performance. Phone viewports
and touch-enabled contexts are emulation. Sustained thermal pressure, operating
system memory eviction and every exporter/extension combination remain unverified.
O4's public support matrix must retain those distinctions. Browser memory is finite;
no measured workload is a universal support promise or an approved rejection limit.

Full source retention still costs memory proportional to input size. Main-thread
source delivery, object adaptation, display reduction and map preparation still
exist. Highly fragmented data can retain many drawing vertices to preserve gaps,
extrema and zero-speed transitions. Measurements below must be read with those
remaining costs in mind.

## Compatibility and interaction evidence

Final engine checks use Chrome 153.0.8010.36, Playwright Firefox 155 and WebKit
26.6 on this Mac, at 1280×720 and touch-enabled 390×844. All of these workloads
loaded with their complete source sample counts in all six engine/viewport
combinations:

| Synthetic recording | Points | Bytes | Additional coverage |
| --- | ---: | ---: | --- |
| 12 hours at 1 Hz | 43,201 | 3,801,870 | Failed replacement preserves the file |
| 48 hours at 1 Hz | 172,801 | 15,206,670 | Complete position range |
| Structured extensions | 24,001 | 13,464,743 | Unknown fields ignored; embedded URL never fetched |
| Fragmented track | 50,000 | 4,315,165 | 2,500 segments, missing data, 5,000 elevation fragments |

The complete private recording also passed both final Chrome browser projects;
its permitted sanitised fixture remains complete at 8,142 points. See
[fixture provenance](../tests/fixtures/gpx/README.md). Synthetic extension coverage
does not establish support for every vendor export or interpretation of sensors.

Whole-page viewport screenshots and actual interactions cover 1440×900, 1280×720,
390×844 and 375×667. After aligning the chart region with the viewport, selected
values and Smoothing remain visible through rapid chart, unit, smoothing and
overlay changes. Desktop shows the linked map marker beside the chart. Phones use
the explicit View on map action; return preserves selection and focus. When the
Smoothing control is centered instead, its adjacent Updating status remains
visible even though the selected summary and top chart controls are above the
viewport. No horizontal overflow was observed. Long names, missing measurements,
warnings and enlarged text remain covered by the workspace checks.

Two interaction regressions were diagnosed and fixed rather than hidden behind
test waits: a transient pending-status row triggered native checkbox-focus scroll
jumps, and Firefox could miss a zero-speed vertex exactly at the lower plot edge.
Pending feedback now shares an existing label row. The invisible selection rim
extends four CSS pixels beyond the plot, using the SVG screen transform for
coordinates so engine differences in stroked bounds do not shift hit testing.
Peak, zero-speed edge and original-sample selection pass in all three engines.

Real-worker integration tests hold the message boundary to exercise rapid changes,
cancelled first views, display-only later responses and stale results. Separate
tests send one invalid entity request through the actual worker, then verify that
successful replacement clears its error and starts a usable session. Same-name,
same-identifier replacement resets file-owned selection and controls. These are
functional lifecycle checks, not garbage-collection measurements.

## Final verification

- `pnpm test --runInBand --silent`: 147 tests in 10 suites passed.
- `pnpm tsc --incremental false`, `pnpm lint`, `pnpm knip`: passed; no Knip findings.
- `pnpm build`: final production static export passed.
- `GPX_VERIFY_FILE=… pnpm test:browser --workers=2`: 66 passed, including both
  complete-private-recording checks; no skips.
- `pnpm test:browser:compatibility tests/browser/largeImportCompatibility.spec.ts
  tests/browser/measurementWorker.spec.ts tests/browser/measurementReplacement.spec.ts
  tests/browser/largeChart.spec.ts`: 54 passed across all six projects.
- Additional recovery checks passed in all three engines; targeted whole-workspace
  and edge-selection follow-up passed 10 cases in Chrome/Firefox.
- After the final map correction, compatibility checks for `mapLifecycle.spec.ts`
  and `workspace.spec.ts` passed 15 cases across Chrome, Firefox and WebKit, covering
  all four viewport sizes, lazy mounting, disposal, resizing and preserved selection.
- JSDOM uses static media-query/ResizeObserver shims; actual responsive behaviour
  is established by the browser tests. `git diff --check` passed.

Standards review: zero outstanding findings. Review identified redundant static
analysis copies and duplicated summary policy; both are resolved. Spec review:
zero outstanding findings. Its replacement-state retention finding is resolved
and covered by real-worker regression checks. These reviews concern #4's local
implementation; they do not approve deployment or close unrelated release gates.
