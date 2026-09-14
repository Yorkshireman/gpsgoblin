# Recording-gap investigation

Investigation for [#14](https://github.com/Yorkshireman/gpsgoblin/issues/14), 14 September 2026. **Status: investigation retained below; the working-tree implementation and validation are recorded at the end. Detector calibration remains limited to the documented evidence.** Product requirements remain in [section 7.2](product-spec.md#72-gpx-viewer).

## Recommendation

Evaluate a gap when its duration is **strictly greater than both 120 seconds and ten times the local reference interval**. Compute that reference as the larger of the median durations on either side, taking at most 20 intervals per side and excluding the candidate itself. Require at least five intervals on each nonempty side; at the exact start/end of a usable run, use the available side. Otherwise abstain. These context sizes are provisional engineering choices, not statistically calibrated constants.

Use full-resolution valid timed intervals within each track segment. Unusable times break the run; do not reorder samples or bridge invalid timestamps or segment boundaries. Classification must be independent of smoothing, units, chart downsampling and track/segment selection. Do not classify planned-route timing as evidence of a recorded journey. Do not use speed, endpoint distance or elevation to decide whether a timestamp interval is a gap. This preserves slow movement when observation frequency remains normal.

Prefer the local reference to one median over the whole segment: a sustained switch to a slower recording frequency should not create a sequence of false gap markers. Taking the larger side median conservatively protects either direction of that transition.

## Evidence and threshold sensitivity

The reproducible standard-library diagnostic is [investigateRecordingGaps.py](../scripts/investigateRecordingGaps.py). Two owner-provided exports were inspected locally. The repository contains no copies of them, paths, coordinates, dates of activity or health measurements. A denotes the variable-frequency export; B denotes the near-one-second export. These are observation intervals, not labelled stop durations.

| Observation | A | B |
| --- | ---: | ---: |
| Valid timed intervals | 1,610 | 8,141 |
| Median interval | 11 s | 1 s |
| Usable runs | 1 | 1 |
| Unusable timestamps found by diagnostic | 0 | 0 |
| Proposed local rule: flagged intervals | 9 | 0 |
| Flagged duration | 7,492.003 s | 0 s |
| Flagged interval range | 349.999–1,954.001 s | — |

All tested absolute floors of 120, 180 and 300 seconds, combined with factors of 5, 10 and 20, identify the same nine intervals in A under both global and local rules. B has no flags for any tested setting. Consequently these files **cannot establish that 120 seconds or factor 10 is optimal**. At a 60-second floor, factor 5 flags 20 intervals globally and 16 locally; factor 10 flags 12 globally and nine locally. Conservative settings avoid treating the shorter sampling variation as gaps.

The proposed 120-second/10× rule gives these synthetic results:

| Synthetic interval schedule | Whole-run median | Local reference |
| --- | ---: | ---: |
| Regular 1 s or regular 300 s | 0 flags | 0 flags |
| One 600 s interval among 1 s intervals | 1 | 1 |
| One 3,600 s interval among 300 s intervals | 1 | 1 |
| 100 intervals at 1 s then 40 at 300 s, or reverse | 40 | 0 |
| Alternating 1 s and 300 s | 0 | 0 |
| Three 300 s intervals among 1 s intervals | 3 | 3 |
| Three intervals: 1 s, 600 s, 1 s | 1 | 0 (insufficient context) |
| 600 s at exact start/end, 40 neighbouring 1 s intervals | 1 | 1 |
| 600 s after only three 1 s intervals, then 40 at 1 s | 1 | 0 (conservative abstention) |
| Exactly 120 s among 1 s intervals | 0 | 0 |
| Exactly ten times the 20 s reference | 0 | 0 |

One-second observations labelled stationary or slow walking have identical timing inputs and neither is flagged. This is timing-only evidence, not a spatial stop-detection test. Separate regular runs are analysed independently.

## Limits and unresolved validation

A short, legitimate change to sparse recording is indistinguishable from missing observations with the same timestamps. The three-interval example deliberately exposes this limitation. Distance-based recording during very slow movement can produce such a pattern too. Label the interval by the lack of observations, never as a known stop, and leave totals intact. No threshold guarantees recovery of the recorder's intent.

The local rule can miss real gaps near run edges with insufficient context, in heavily sparse regions, or among many neighbouring long intervals. Its first-interval/near-edge discontinuity is a consequence of explicit abstention, not evidence of greater certainty at a file boundary. The context policy needs further representative validation before release; do not present these trials as precision/recall measurements.

The diagnostic parser is deliberately narrower than the application contract: it handles the two supplied GPX 1.1 exports using Python ISO timestamp parsing. It is not a replacement for readTimestamp, schema validation or the application's malformed-input tests. No external service's proprietary graph algorithm was inferred or reproduced.

## Implementation implications

- Keep raw interval distance/time and complete-recording summaries intact in analyseMeasurements and createMeasurementStore. Store gap evidence separately with stable source endpoint identifiers. Simply nulling raw interval values would alter the per-segment summaries and lose information needed by marker details.
- Mask gap speed only in the display/smoothing input, including the zero-smoothing path. averageSpeeds already resets after null input. The first subsequent eligible interval starts a fresh window; a gap's endpoint is still a real selectable sample.
- Preserve gap metadata through packed worker responses and chart downsampling. MeasurementPlot already uses connectNulls=false, but an imperceptibly narrow break is insufficient: markers and accessible details still require implementation.
- Loaded view: keep the distance axis and complete-recording summary; add understandable gap markers without new configuration controls. Selection by mouse, keyboard or touch must reveal duration and endpoint distance beside the chart. Use real endpoints for any map indication, not an inferred interior point. Define overlapping-marker selection during UI implementation.
- Changing smoothing, units or selected track/segment must preserve the meaning and traceability of gaps. Returning to the chart from the mobile map must retain selection. Test these at 1440×900, 1280×720, 390×844 and 375×667, including adjacent controls and visible feedback.

## Reproduction and checks

Run `python3 scripts/investigateRecordingGaps.py` for synthetic schedules and assertions. Append one or more quoted local GPX paths to reproduce the aggregate threshold sweep. Output identifies recordings by argument order only; it does not print input filenames or route coordinates. Real-file results were produced with both owner-provided paths. Private raw output remains local.

The investigation ran the synthetic assertions and both real-file sweeps successfully. No application/UI behaviour changed; viewport interactions, production classification, smoothing/summary regressions and large-file performance have **not** been validated for a new implementation. #14 remains open; moving-only presentation and stop detection remain deferred in #11/#13.

## Implementation and verification — 14 September 2026

The candidate local rule above is now implemented for recorded tracks in the working
viewer, with its limitations retained. The preceding investigation describes the
pre-implementation evidence; it does not establish universal detector accuracy.
Raw interval values and track/segment totals remain intact. Gap metadata is carried
separately through the worker, masks display motion, resets smoothing even when
returning from a settings-only response, and survives chart downsampling. Planned
routes retain their existing timing presentation.

The interface adds Gap buttons and an Inspect recording gap selector only when gaps
exist. Markers use 44×44 CSS-pixel targets, clamp inside the plot at route endpoints,
and group nearby gaps; repeated activation cycles through the group in source order.
The selector reaches each gap directly. Selection shows interval duration, endpoint
distance and uncertainty beside the chart, with the map at the real ending sample.
Hovering/selecting a gap suppresses unrelated neighbouring-speed tooltips. No stop
filter, new axis control or moving-time total has been added.

Verification on the local Chrome static export:

- Four content viewports: 1440×900, 1280×720, 390×844 and 375×667. Inspected loaded and selected screenshots; clicked/tapped actual grouped markers, used keyboard Enter to cycle, selected individual gaps, changed units and speed/pace, set smoothing to zero and opened/closed the mobile map with selection retained. Gap details and their marker remain visible together immediately after selection. No horizontal overflow was found.
- At 1440×900 the chart and selected map endpoint are visible together. At 390×844 the selected gap, graph and smoothing control fit in the captured screen. At 1280×720 and 375×667 the initial page still requires scrolling to see the lower plot/controls; this is not a claim that the entire workspace fits above the fold. No automatic selection scrolling was introduced. Physical mobile hardware and non-Chrome engines were not tested in this change.
- Both permissioned local exports were opened in the actual worker-backed viewer. A shows nine gaps with 17.3 km, 8 h 19 min 18 s and 2.1 km/h unchanged. B shows no recording gaps; its stationary dip remains. Private files/screenshots remain local. External tiles were blocked; local geometry/selection and map-unavailable behaviour remain usable.
- `pnpm test -- --runInBand src/analysis/measurements src/analysis/prepared-measurements`: 38 tests passed during implementation. Final `pnpm test --runInBand`: 164 tests passed, 12 suites. Includes gap policy, raw-summary invariants, smoothing/units/segment views, planned-route exclusion and retention of consecutive gap markers during downsampling.
- `pnpm tsc`, `pnpm lint`, `pnpm knip`: passed; Knip reported no findings. `pnpm build`: successful static export. `git diff --check`: passed.
- Playwright ran `recordingGaps.spec.ts workspace.spec.ts measurementWorker.spec.ts largeChart.spec.ts`: 13 passed. This includes the existing 50,000-point source-selection/resizing checks. Following the tooltip/contrast refinement, all five gap-specific browser cases passed again. A temporary configuration used port 4174 because 4173 was occupied; all other project browser settings were preserved. GPX paths were supplied through local environment variables, never embedded in public test fixtures.

Further calibration across recording devices remains open. This completes the
bounded gap-presentation implementation, not stop detection or the broader release
gates. No commit or production deployment was performed by this implementation task.
