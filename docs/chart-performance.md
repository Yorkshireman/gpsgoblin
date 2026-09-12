# Large GPX chart performance — issue #4

Historical slice report. The [large-file completion report](large-file-support.md)
supersedes its outstanding implementation work and records final evidence.

Measured 12 September 2026, following `9b27be2`. This completes the chart slice
identified in the [initial profiling](import-benchmarks.md). Issue #4 and O4 remain
open for analysis, parser memory and broader device evidence. No file-size,
point-count, structure-count or processing-time limit has been introduced.

## What changed

The chart draws a projection based on its container width. Each distance bucket,
about one CSS pixel wide, retains its first and last measurements and the minimum
and maximum of both motion and elevation. Segment boundaries, missing-value
transitions and calculated zero-speed transitions split buckets into separate
fragments, preserving each fragment's extrema. Isolated readings remain visible.
Highly fragmented data can retain many or all points: this is not an output cap.

Original measurements and analysis remain complete. Smoothing still operates on
full-resolution data. Selection changes reuse the drawing dataset; a separately
rendered marker can show an original sample omitted from the line. The position
slider still accesses every sample. Pointer selection searches the original data
by cumulative distance, preferring an actual measurement within four CSS pixels
of the target, then falling back to nearest distance with vertical tie-breaking.
This handles touch-coordinate rounding around narrow peaks. Long equal-distance
runs may still require scanning many samples. No interpolated sample is created.

The chart also supplies an empty vertical-grid coordinate generator, avoiding
unused tick preparation despite vertical grid lines already being disabled.
See the [Recharts CartesianGrid API](https://recharts.github.io/en-US/api/CartesianGrid/).
Installed source and sampled stacks established the unnecessary work; this is
an implementation detail, not a change to displayed axes or analysis.

## Method and results

Same production static export, Apple M2 / 16 GiB / macOS 26.6.2, Chrome
153.0.8010.36, Node 24.20.0 and pnpm 12.3.4 as the baseline. Desktop viewport
1280×720, three fresh pages per case and CPU rate. No tests/builds ran concurrently
with these trials. The complete private 8,142-point recording was read locally;
only coarse metrics are retained. Synthetic 250k points represent about 69 hours
at one-second sampling, not a maximum supported activity duration.

[Desktop raw trials](benchmarks/chartDesktop.jsonl) and
[phone-viewport raw trials](benchmarks/chartPhone.jsonl) retain all observations.
Reproduce with `pnpm benchmark:imports` after building and serving `out`; see the
initial report for environment options. Use `GPX_PROFILE_DIR` to preserve separate
baseline and follow-up profiles. Private paths and contents are not in results.

Native CPU ranges across three runs; milliseconds except heap:

| Input | Load before → after | Largest main task before → after | Keyboard selection before → after | Page heap MiB before → after | Drawn vertices after |
| --- | ---: | ---: | ---: | ---: | ---: |
| Complete private, 8,142 points | 414–472 → 378–421 | 162–169 → 93–99 | 86–102 → 59–91 | 29–33 → 22–25 | 2,774 |
| Complete sanitised, 8,142 points | 354–367 → 283–300 | 161–163 → 88–91 | 79–89 → 64–69 | 27–31 → 20–21 | 2,708 |
| 10,000 points | 369–384 → 284–330 | 177–179 → 88–97 | 90–105 → 65–73 | 32–34 → 20–21 | 2,303 |
| 50,000 points | 1,083–1,128 → 815–875 | 531–558 → 122–148 | 241–273 → 59–69 | 127–132 → 40–50 | 3,154 |
| 100,000 points | 1,916–1,949 → 1,314–1,326 | 985–1,007 → 177–179 | 431–525 → 60–62 | 251 → 87–89 | 3,625 |
| 250,000 points | 5,052–5,144 → 2,514–2,646 | 2,907–2,978 → 298–315 | 1,076–1,095 → 66–85 | 532–537 → 179 | 3,619 |

Load is worker creation through loaded controls plus two animation frames: a
chart-paint proxy. The initial screenshot can precede map-worker drawing.
Page heap is sampled after import, not peak/process/worker/GPU memory. Drawn
vertices count SVG line M/L commands; source slider counts remain unchanged.

At 4× **page CPU** slowdown (worker CPU is not equivalently throttled):

| Input | Load before → after ms | Largest main task before → after ms | Keyboard selection before → after ms |
| --- | ---: | ---: | ---: |
| Complete private | 1,178–1,189 → 855–890 | 677–691 → 370–373 | 271–285 → 170–184 |
| 50,000 points | 2,942–3,026 → 1,372–1,423 | 2,111–2,168 → 522–551 | 964–993 → 186–201 |
| 100,000 points | 5,265–5,337 → 2,076–2,120 | 3,920–3,958 → 679–726 | 1,813–1,869 → 192–204 |
| 250,000 points | 14,851–14,900 → 4,253–4,323 | 11,754–11,864 → 1,205–1,222 | 4,307–4,355 → 198–202 |

New interaction measurements at 250k: desktop chart click 119–123 ms native /
273–288 ms at 4×; smoothing 116–117 / 350–366 ms. These include Playwright action
scheduling, possible scrolling and two animation frames, not just handler CPU.
No matching click/smoothing baseline was recorded, so no speedup is claimed for
them. Import CPU profiles and Long Tasks finish before these interactions.

Phone viewport 390×844, one fresh page per case/rate on the same Mac:

| Input | Native load ms | Native selection ms | 4× load ms | 4× selection ms | Drawn vertices |
| --- | ---: | ---: | ---: | ---: | ---: |
| Complete private | 347 | 64 | 796 | 173 | 1,813 |
| Complete sanitised | 271 | 60 | 738 | 154 | 1,755 |
| 100,000 points | 1,316 | 60 | 1,948 | 184 | 1,820 |
| 250,000 points | 2,509 | 71 | 4,880 | 174 | 1,824 |

The phone 250k trial had a 290 ms native / 1,303 ms slowed main task. Chart click
was 103 / 253 ms and smoothing 99 / 383 ms. A single trial is a layout probe,
not a distribution or physical-phone claim. Touch correctness uses separate
50k-point browser tests with touch-enabled contexts.

## Remaining bottlenecks

At native 250k, worker round trip is still 1,931–2,085 ms; post-delivery work is
550–583 ms. One final native CPU profile attributes about 103 ms self time to the
strict timestamp parser, 86 ms to the worker message callback and 61 ms to GC;
`getBoundingClientRect` self time is about 5 ms. Minified function locations were
checked against the built source. Sampling and callback attribution do not isolate
transfer/clone costs or add up to a complete phase decomposition.

Full-resolution analysis, timestamp parsing and display conversion still run on
the main thread. The remaining 1.2–1.3-second slowed main tasks are significant;
this slice does not establish acceptable responsiveness everywhere. The next
performance work should evaluate worker-owned analysis and settings updates,
then direct SAX extraction to remove the parser's second pass and transient DOM.
The original parser-memory findings remain applicable because parsing did not
change here. Preserve immutable source data, validation, cancellation and recovery.

Physical phones, Safari/Firefox, peak worker/browser memory, isolated map drawing,
extension-heavy exports, highly fragmented data and sustained memory pressure
remain unmeasured. No benchmark boundary is an approved resource restriction.
Any proposed hard limit still requires owner discussion and agreement first.

## Correctness and UX evidence

New browser regressions first failed against unreduced drawing, distance-only
hit testing and cross-fragment bucket extrema respectively. They now cover 50k
samples, original-sample selection omitted from the line, resizing, endpoints,
segment and missing-elevation gaps, isolated readings, narrow peaks/troughs,
zero-speed transitions, units/smoothing changes and exact linked map coordinates.
A compressed-fragment fixture ensures separate segments and missing-data breaks
inside one pixel retain their own extrema.

Whole-page checks cover 1440×900, 1280×720, 390×844 and 375×667 content viewports,
keyboard controls and touch. Loaded screenshots are captured before scrolling;
selected workspace screenshots have the chart region aligned with the viewport.
Selection feedback and smoothing stay visible together in those workspace checks,
without selection-induced scrolling; desktop map feedback is alongside the chart.
Large-data screenshots also cover initial desktop import and selected phone states.
On phones, map access remains an explicit action; returning preserves selection
and focus. Map-return screenshots are scrolled to that control, so the full selected
summary can be above the fold, especially at 375×667. The tests wait for the closing
backdrop to disappear before capturing these states. No persistent overlay or
horizontal overflow was observed. Long metadata and enlarged text are also covered.
Screenshots are local, ignored artifacts. Existing broader layout work stays in #10.

## Verification

- `pnpm test --runInBand --silent`: 136 tests across nine suites passed.
- `pnpm tsc --incremental false`, `pnpm lint`, `pnpm knip`: passed, no Knip findings.
- `pnpm build`: production static export passed with the final chart implementation.
- `GPX_VERIFY_FILE=… pnpm test:browser --workers=2`: 44 passed, including both
  complete private-recording checks; no skips.
- JSDOM lacks ResizeObserver/layout; its setup stubs that browser API. Actual
  resizing, drawing and pointer correctness are verified in Chrome.
- `git diff --check`: passed.

## Standards

0 outstanding findings after targeted review of the final hit testing and naming.

## Spec

0 outstanding findings for this slice. Review found cross-fragment extrema loss;
that was fixed, covered by a failing-then-passing browser regression and rechecked.

Review totals: Standards 0; Spec 0. Issue #4 and O4 remain open for the work above.
