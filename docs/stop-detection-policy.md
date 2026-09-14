# Stop-detection policy investigation

Research for [#13](https://github.com/Yorkshireman/gpsgoblin/issues/13), begun 12 September 2026 and extended 14 September 2026. Related: [#11](https://github.com/Yorkshireman/gpsgoblin/issues/11), calculated Moving time. **Status: conservative viewer policy agreed and implemented; Include stops remains the default.** The agreed implementation below supersedes the historical proposal and sequencing statements retained afterwards.

## Agreed viewer implementation

The owner accepted keeping Include stops as the initial view and requiring individual confirmation of possible stops after reviewing the false-exclusion evidence. This is a useful review aid, not validated automatic stationary classification. No uncertainty is silently converted into an exclusion. The comparison/replay engine and #11's separate summary UI remain outside #13.

The public measurement-analysis seam finds candidates in full-resolution recorded tracks. Require a continuously usable run: finite valid coordinates, qualified increasing timestamps, no interval greater than 10 seconds and no segment boundary. Missing, invalid, duplicate and backwards timestamps interrupt observation continuity through the existing timestamp high-water policy. Routes are ineligible. The density guard controls evidence eligibility only; it is neither a file-size limit nor the recording-gap detector's rule. Sparse recordings remain viewable, with detection coverage and unclassified intervals disclosed.

Within each run, use a sliding spatial window of at least 60 seconds with bounding-box diagonal at most 10 metres. Overlapping qualifying windows form one episode; retain its longest confined core, choosing the earliest on a duration tie. Leave the rest included. Production coordinates use a spherical Earth-centred Cartesian projection (radius 6,371,008.8 m), so the extent calculation handles longitude wrap and poles. This bounding diagonal is orientation-dependent and can be more conservative than the diagnostic's local horizontal box; it is a confinement bound, not travelled distance or a 3D pace calculation. Original latitude, longitude and elevation remain intact.

Every candidate has stable source endpoints, observed duration and uncertainty. The viewer flags missing elevation or a recorded elevation range greater than 5 m; these are explanations for review, not classifiers. A smaller range still carries the warning that flat elevation does not prove rest. The diagnostic's median-bin and directional screens are not used to certify automatic exclusions: **all** candidates require confirmation, including climbing/drift counterexamples. No sample-weighted statistic decides automatic removal under irregular sampling.

In Exclude detected stops mode, only confirmed candidates mask intervals strictly after their starting sample through their ending sample, `(start, end]`. A byte mask unions selections, so overlaps or duplicate confirmations cannot remove time twice. Smoothing resets at each masked interval, recording gap or unusable interval; no values are interpolated inside a break. Include stops ignores confirmations and exactly restores its calculation for the same smoothing settings. Confirmations are retained while toggling the calculation in the same selected track/segment workspace; changing workspace resets these display choices. Replacing or clearing a file destroys its session.

The Distance axis retains complete cumulative horizontal distance. The Time axis uses original elapsed offsets for Include stops, or cumulative eligible interval duration for Exclude detected stops. A complete elapsed projection is unavailable with unusable or backwards times; the viewer falls back to Distance and explains why. Filtered time can be a partial estimate: recording gaps are removed from both eligible duration and distance, disclosed separately from confirmed-stop duration, and kept as visible chart breaks. Missing timing and unobserved inter-segment time never become proven rest or a confidently known whole-activity moving total. The active average uses eligible distance divided by eligible duration, with an unavailable result for zero eligible duration. No physical motion is inferred merely because an interval remains eligible.

Candidate assessment stays in the file's worker and is independent of chart smoothing, units, viewport range and axis. Linear scans and monotonic extrema queues avoid searching every possible window. Packed replies keep source indexing, selected stop boundaries and every source point available. Suggested / Full range / Custom maximum remain independent presentation settings; the average reference and overflow selection use the active calculation.

The stop review dialog keeps the selected interval, explicit confirmation and graph together, returns focus to its opener, and lets the person restore any interval. Source-point selection remains a separate interaction. Unknown recording gaps retain their own markers and explanation. Main-page Chart options contain the calculation and axis settings; moving-view basis, excluded duration and consequential coverage remain visible with options closed.

## Viewer verification, 14 September 2026

`pnpm test --runInBand` passed all 174 tests in 14 suites. `pnpm tsc`, `pnpm lint`, `pnpm knip` (no findings), `pnpm build` and `git diff --check` passed. Standards and specification reviews found no remaining issues after correcting unavailable-assessment disclosure and dialog return focus.

Chrome browser checks passed 29 cases across `movingMeasurements`, `recordingGaps`, `workspace`, `measurementWorker`, `largeChart`, `paceRange`, `suggestedPaceRange` and `chartSelection`. They used the static export served locally, with both permissioned recording environment variables set. The six moving-measurement cases passed again after reducing dialog spacing and adding a complete-axis visibility assertion. Whole-page viewport screenshots were inspected at 1440×900, 1280×720, 390×844 and 375×667. Keyboard activation, touch confirmation, restoring an interval, switching calculation/axis/units/ranges, overflow selection and focus returning to the original opener were exercised. The review dialog shows the confirmation, calculation basis, graph and distance-axis label together at all four sizes. At the initial top-of-page position, complete totals and the start of the graph are visible; short phones require scrolling for the full main-page chart. No automatic jump to the map is introduced. These are Chrome content-viewport checks with touch emulation, not physical-device or cross-browser certification.

The original permissioned recordings were copied unchanged into the git-ignored `private-recordings/` directory and used locally. The continuous recording produces five possible stops; the recording-gap example produces none. The browser test confirms the 638-second summit candidate can be excluded and restored while retaining the original 2 h 16 min 7 s duration and access to all 8,142 source samples. This tests the feature against the known event; it does not validate the extra 38 boundary seconds or the other four candidates as ground-truth stops. Neither original files nor private screenshots are published.

The Node pipeline profile ran three times each for the original continuous recording, sanitised fixture and synthetic 50,000/100,000-point recordings (`GPX_BENCHMARK_POINTS=50000,100000 GPX_VERIFY_FILE=<local-file> node --expose-gc scripts/profileGpxPipeline.mjs`). Analysis and packing took 127–173 ms for 50,000 points and 232–372 ms for 100,000 points; display materialisation took 26–40 ms and 23–61 ms respectively in Node 24.20.0 on this workstation. Browser large-chart checks retained full source selection and responsive worker updates. These measurements establish a local regression baseline, not mobile memory or timing guarantees. Automatic stop accuracy and broader labelled climbing data remain unresolved; every exclusion still requires confirmation.

## 14 September validation and decision proposal

The owner authorised validation and bringing the #13 viewer feature forward, using one feature branch and PR through eventual squash merge. The comparison/replay engine remains deferred. The ticket still requires agreement on detection policy before product implementation.

Re-ran the existing synthetic harness and extended it with a reproducible 189-trial matrix: seven labelled scenarios, three schedules (1 s, 5 s and a dense irregular schedule), three minimum durations (30/60/120 s), and three spatial extents (5/10/20 m). Each trial applies compact-window detection, bounded-core refinement and movement/elevation screening. The invented 600-second observations contain no private data. Candidate duration is the number of seconds that would be falsely excluded for a known moving scenario if surviving candidates were excluded automatically.

| Known scenario | Trials with surviving candidates / 27 | Surviving candidate duration range |
| --- | ---: | ---: |
| Stationary with jitter | 27 | 599–600 s |
| Walking at 1 m/s | 0 | 0 s |
| Slow progress at 0.05 m/s | 6 | 0–100 s |
| Very slow progress at 0.005 m/s | 27 | 599–600 s |
| Vertical climb with recorded elevation rise | 0 | 0 s |
| Vertical climb with flat recorded elevation | 27 | 599–600 s |
| Movement in a 3 m radius circle | 18 | 0–600 s |

These are deliberately selected counterexamples, not population error rates. At some irregular window boundaries the accepted core begins one second late; even synthetic candidate duration should not be described as exact stopped time. The slow-progress result extends the earlier single-operating-point result: changing duration/extent can defeat its directional safeguard. No tested parameter combination separates stationary jitter from the flat-elevation climb or very slow progress across these schedules. This does not prove that every possible estimated detector is unusable.

The earlier permissioned summit evidence remains relevant, but no original private recording was re-read in this extension. Its 600-second confirmed event is not independent ground truth for the full 638-second candidate or other events. Broader labelled hiking/climbing recordings, boundary accuracy, timestamp eligibility, browser performance and production integration remain unvalidated.

### Proposed policy for agreement

- **Default:** retain Include stops. The current evidence fails the moving-only-default gate; no spec change to that default is recommended.
- **Candidate detection:** use the existing 60 s minimum / 10 m bounding-box diagonal as an explicitly provisional candidate-finding setting. Preserve the longest confined core, full-resolution source endpoints and uncertain edges. Do not treat confinement or flat elevation as proof of rest. Keep the sensitivity matrix as evidence of limitations.
- **Observation eligibility:** for this initial candidate finder, require valid coordinates and strictly increasing, timezone-qualified timestamps in one recorded track segment, with no adjacent observation interval over 10 s. Break runs at invalid/missing/duplicate/backwards timestamps, segment boundaries and recording gaps, preserving the timestamp high-water mark as in the existing measurement analysis. Planned routes are ineligible. The 10 s density guard means insufficient evidence for stop analysis, not an import limit or a new recording-gap classification. Sparse data remains viewable. Validate this policy through the application's timestamp/measurement seam before shipping; the diagnostic reader does not provide those guarantees.
- **Evidence and overrides:** vertical change, directional progress, missing elevation and doubtful observations retain a candidate for review. With the current evidence, remaining confinement candidates also require user confirmation before exclusion. Label them as possible stops, disclose duration and uncertainty, and allow every exclusion to be restored. Do not automatically bulk-exclude the unconfirmed flat-elevation candidates that fail the cases above. This is a proposed initial interpretation of Exclude detected stops that needs owner agreement; it offers less automation than the eventual preference.
- **Derived calculation:** confirmed source intervals form the exclusion set. Unknown recording gaps are disclosed separately and removed from both eligible distance and duration in the moving view. Invalid timing and segment boundaries remain breaks. Mask excluded intervals and reset smoothing; never change original values or complete totals. Incomplete coverage must be labelled as an estimate over eligible recorded intervals, not a known whole-activity moving total. #11 can consume the same interval meanings without adding its summary UI to this ticket.
- **Verification seams to agree for TDD:** the existing public `analysis/measurements` entry point for interval evidence; `analysis/prepared-measurements` for exclusions, smoothing, axis projection and averages; the viewer's user controls and chart selection for integration. No new production tests or interface design have been committed before this agreement.

An initial feature requiring confirmation of possible stops is the conservative recommendation. If automated exclusions are required in the first iteration, obtain representative labelled recordings and agree an acceptable false-excluded-duration tolerance before implementing that behaviour. Do not tune thresholds merely to remove the summit spike.

### Source verification and commands

Rechecked the [GPX 1.1 schema](https://www.topografix.com/GPX/1/1/), [Strava elevation documentation](https://support.strava.com/en-us/articles/15401909-elevation) and [archived GPS.gov accuracy explanation](https://archive.gps.gov/systems/gps/performance/accuracy/). They support optional elevation/quality evidence, the possibility of elevation derived from horizontal position, and receiver/environment-dependent errors. They do not identify the private recording's elevation provenance or validate numeric thresholds. The identical-input counterexample is an inference from those possibilities, not a measured real-world false-positive rate.

`python3 scripts/investigateStops.py` runs the original synthetic assertions plus the new matrix and observational-equivalence assertions; it passed. Aggregate output was kept locally in `/tmp/gpsgoblin-stop-synthetic-13.json`. `pnpm tsc`, `pnpm lint` and `pnpm knip` passed, with no Knip findings. `pnpm test --runInBand` passed all 169 tests in 13 suites; `git diff --check` passed. No application or UI changed; the static build and browser checks were not rerun. Production detector accuracy, mobile interaction and large-file responsiveness are not established by this research.

## Recommendation

Evaluate stop candidates using sustained spatial confinement, observation continuity, evidence of horizontal progress and elevation change. Use elevation to protect possible climbing: sustained ascent **or descent**, or uncertain vertical behaviour, should keep an interval included unless the user chooses otherwise. Flat elevation alone must not certify a stop.

Build the first viewer iteration as an **opt-in exclusion mode with per-interval overrides**. The 14 September agreement supersedes this investigation's earlier eventual-default proposal: **Include stops remains the default**, with advanced options disclosed near the chart. Implement recording-gap presentation first; stop detection and moving-only views remain deferred. See [product specification section 7.2](product-spec.md#72-gpx-viewer) and the [recording-gap investigation](recording-gap-investigation.md). The experiments below show useful detection, but also false-positive cases. There is no universal threshold established by this investigation.

## Evidence from the permissioned recording

The owner confirmed that the dominant spike corresponds to a summit break, not climbing. This confirms the nature of that event, not exact arrival/departure timestamps or other detected candidates.

| Observation | Result |
| --- | --- |
| Recording | 8,142 points, one segment, 8,167 seconds elapsed |
| Dominant ten-minute pace window | 600 seconds, 601 observations |
| Accumulated horizontal path | 43.277 m |
| Maximum distance from the window's first position | 2.536 m |
| Spatial bounding-box diagonal | 5.289 m |
| Identical consecutive coordinates | 411 of 600 intervals |
| Elevation range in that window | 0.1 m, at the recording's maximum elevation |
| Resulting pace | 231.070 min/km, approximately 231:04 |

The observation density and confinement agree with the owner's account. Summing GPS jitter into path length explains why this is a large finite pace, rather than zero speed. This arithmetic uses independent spherical distance calculations, consistent with the earlier application diagnosis.

Across the whole recording, 8,137 sampling intervals are one second, two are two seconds, one is ten seconds and one is sixteen seconds. The ten-minute peak window contains only one-second intervals. Every point has elevation and time; none has a core GPX fix/DOP/satellite-count field. The application model does not establish elevation provenance. Do not infer barometric origin from the presence or stability of elevation.

### Threshold sensitivity

The diagnostic first finds compact trailing windows and unions overlaps. These are **candidates**, not measured stopped time. Spatial extent here means the diagonal of an axis-aligned local bounding box, not a radius.

| Minimum window | 5 m extent: candidate seconds | 10 m extent: candidate seconds | 20 m extent: candidate seconds |
| --- | ---: | ---: | ---: |
| 30 seconds | 1,274 | 1,693 | 2,606 |
| 60 seconds | 910 | 1,028 | 1,495 |
| 120 seconds | 612 | 770 | 856 |

The totals vary too much to select thresholds solely because a chart looks better. A 60-second/10-metre experiment produces five candidate intervals. Only the summit event has owner confirmation; this investigation cannot report precision, recall or total true stopped time.

Unioning compact windows can gradually absorb real movement and make the complete candidate exceed the intended spatial extent. Rejecting that entire union also rejects the summit break. A second experiment selects the longest fully confined core inside each union, leaving its edges for review rather than repeatedly chopping the remaining data into putative stops. It yields five cores totalling 1,015 seconds; the largest is **638 seconds** and contains the confirmed 600-second window. Its additional 38 seconds are not independently labelled. The other four candidates remain unverified.

## Controlled counterexamples and elevation safeguard

The reproducible harness is [scripts/investigateStops.py](../scripts/investigateStops.py). All parameters in it are research settings, not product constants or user-facing limits.

The initial operating point is 60 seconds, 10 m extent and no observation gap over 10 seconds. After core refinement, the experiment screens for movement using median positions in three equal-duration blocks: two successive shifts over 2 m in similar directions (cosine greater than 0.8) retain the candidate for review. Elevation screening uses the span of median elevations in ten-second bins; a span over 5 m retains the interval. It examines the whole interval, so ascent followed by descent is not missed merely because net gain is zero. Missing elevation also retains the candidate for review in this conservative experiment.

These sample medians are a diagnostic convenience. Production treatment of irregular sampling, time weighting, short edge bins, outliers and noisy elevation still needs specification and validation. A noisy or drifting height trace should cause abstention, not a confident claim of climbing. Trial spans of 3, 5 and 10 m do not distinguish the real candidates, whose elevation changes are small; this recording cannot calibrate an elevation threshold.

| Synthetic 600-second case | Result after core and movement/elevation screening |
| --- | --- |
| Stationary, small GPS jitter | Remains a candidate for all 600 seconds |
| Continuous movement at 1 m/s | No candidate |
| Slow directional movement at 0.05 m/s | Retained in pace by directional-progress safeguard |
| Near-vertical climb, recorded elevation rises 60 m | Retained by elevation safeguard |
| Climb then descend to original elevation | Retained by elevation safeguard |
| Stationary with elevation drifting 60 m | Retained for review; conservative false negative |
| Climb with missing elevation | Retained for review, without claiming movement |
| Stationary with missing elevation | Also retained for review; reduced stop coverage |
| Climb with flat terrain-derived elevation | **Remains a candidate: unresolved false positive** |
| Movement in a 3 m radius circle | **Remains a candidate: unresolved false positive** |
| Two identical positions 600 seconds apart | No candidate; intervening behaviour unknown |
| Stationary sampled at 1 s, 5 s or the tested dense irregular schedule | Candidate duration remains 600 seconds |
| Stationary sampled at 15 s | No candidate under the experimental 10 s observation-gap rule |

A flat-elevation vertical climb can have exactly the same input series as a stationary person. Without an independent signal, no rule can distinguish those two cases. Likewise, an altitude drift can duplicate a genuine climb. This is why elevation is useful evidence but cannot guarantee correct classification. The small-loop failure separately shows that bounding extent and coarse directional progress do not establish stationarity. Real climbing recordings, correlated drift and movement inside small areas are still needed before recommending automated exclusions as the initial view.

## Proposed production policy to agree

1. **Evidence and eligibility.** Analyse full-resolution unsmoothed samples independently of chart settings. Preserve segment boundaries and source order. Missing, invalid, duplicate or backwards times break eligibility. Suspect observation gaps remain unknown; a paused timer does not establish rest. Do not reject the file when stop analysis is unavailable. Agree a density/coverage policy after testing sparse recordings, rather than copying the harness's ten-second gap setting.
2. **Candidate and boundaries.** Require sustained confinement and examine movement throughout the interval. A returning endpoint is insufficient. Establish a bounded stationary core; extend only while spatial, horizontal-progress, elevation and coverage evidence remain compatible. Keep uncertain arrival/departure edges included, retain source sample boundaries, and report interval uncertainty. Do not let repeated moving windows extend a stop indefinitely.
3. **Elevation.** Use robust sustained vertical change in either direction to veto automatic exclusion, even when horizontal movement is tiny. Examine subintervals as well as net change. Treat missing, suspiciously flat, noisy or unknown-provenance elevation as limited evidence. Never silently replace horizontal pace with a new 3D distance calculation. User-confirmed inclusion/exclusion overrides a heuristic.
4. **States and overrides.** Keep candidate evidence, inferred eligibility and user choice separate. An eligible heuristic result is still an estimated stop, not a certainty. Ambiguous candidates remain included and can be excluded explicitly. Users can also include any proposed exclusion. An opt-in bulk action must disclose that detection is estimated and make individual corrections easy. The evidence does not yet justify deciding which unconfirmed candidates are safe to exclude automatically.
5. **Pace behaviour.** Exclusions mask derived timed intervals, leave visible gaps and reset smoothing. Leave ambiguous boundary intervals included; never remove an interval merely because one endpoint is near a stop. Union overlapping selected exclusions to avoid double-counting duration. Restore Include stops exactly for the same smoothing settings. Original points, timestamps, distances, totals and downloads stay unchanged. The independent custom pace maximum remains available.
6. **Shared analysis.** Coordinate interval evidence and method with #11, while keeping its Moving time summary separate. Do not call elapsed time minus detected stops a proven total of physical movement when observation coverage is incomplete. Comparison/replay implementation is outside this viewer task.

The 60 s / 10 m starting point is worth evaluating further, not approving as a default. The 30/60/120 s and 5/10/20 m matrix should remain part of validation. The five-metre elevation screening parameter is equally provisional. Prefer missed exclusions and visible review over erasing uncertain climbing time.

## Proposed user flow and acceptance evidence

Place the calculation choice beside the pace range controls. After opting in, show the changed chart and a nearby summary such as “Estimated stops excluded · [duration] · Review stops”. Each review item shows its interval, location/progress where known, inclusion state and short reason; uncertainty and missing evidence must be readable, not encoded only by colour. Include a clear action to restore an interval. Changing it immediately updates the selected pace, excluded-duration summary and chart gap without losing focus or selection.

Missing eligible timestamps should leave ordinary viewing available with a nearby explanation. If detection is running on a large file, communicate progress and allow cancellation; replacing the file must discard stale results. Mobile users need chart feedback and stop selection without a forced jump to an off-screen map. On desktop, show linked context where space allows.

Before adopting a default, obtain independently labelled real stops and slow/vertical movement from different recording conditions. Measure false-excluded **seconds**, missed stop seconds and arrival/departure error, alongside coverage and sensitivity; candidate counts alone are inadequate. The owner-confirmed summit case establishes one positive event, not exact second-by-second ground truth. The existing sanitised Strava fixture replaces geometry, times and elevation, so it cannot validate this real stop behaviour. Keep the original recording and private screenshots local.

Agree acceptable false exclusion and boundary error with the owner, plus Stage 1/Stage 5 sequencing, before changing the specification or initial default. A useful opt-in feature can precede validated automatic behaviour; it still needs tested, documented eligibility and corrections. UI implementation must be checked at 1440×900, 1280×720, 390×844 and 375×667 with relevant keyboard, mouse and touch interactions. No UI was changed or visually tested in this investigation.

## Codebase findings and verification

`analyseMeasurements.ts` currently accepts any positive adjacent timestamp interval; it has no long-observation-gap detector. A positive timestamp interval must not automatically become evidence of continuous observation for stop classification. `averageSpeeds.ts` already resets at unavailable measurements or segment changes, providing a useful integration seam for a future derived exclusion mask. No integration was implemented.

The standalone diagnostic uses Python 3.14.3 and only the standard library. Its private-file reader deliberately supports one well-formed GPX 1.1 segment with increasing timestamps; it is not an alternative product importer. Local planar coordinates approximate spatial extent for this recording and are not suitable for arbitrary worldwide routes. Spherical distances are used for the quoted pace arithmetic. The compact-window and core searches use monotonic deques; this is not a browser, peak-memory or large-device performance claim.

Commands run:

- `python3 scripts/investigateStops.py` — synthetic cases and known-answer assertions passed.
- `python3 scripts/investigateStops.py --gpx <permissioned-local-file>` — all nine spatial/duration combinations, elevation screening and core refinement completed; emits aggregates without source coordinates, absolute dates, names or paths. Full local output retained in `/tmp/gpsgoblin-stop-policy-results.json`.
- An independent seeded brute-force cross-check — 240 window comparisons passed; refined cores satisfied their duration and extent bounds.
- `pnpm knip` — exited successfully with no findings.
- `git diff --check` and whitespace checks on the new research files — passed.

Application source, dependencies, defaults and GitHub issues were not modified. A build and browser suite were not rerun for research-only artifacts. No source file or private trace was uploaded to a research service.

## Primary-source evidence


### 1. GPX does not guarantee the observations needed to distinguish stops from climbing

GPX 1.1 track points require latitude/longitude but make time, elevation, fix, satellite count and dilution-of-precision fields optional. Its core point structure has no dedicated structured elevation-provenance field; arbitrary extensions may contain extra information. Segment boundaries represent separate continuous spans, including reception loss or the receiver being off. A segment boundary therefore does not identify a rest. [Topografix GPX 1.1 schema](https://www.topografix.com/GPX/1/1/)

**Implication:** inspect capabilities and quality, preserve boundaries, and represent missing evidence explicitly. Do not interpret an absent elevation change as proof of no vertical movement. DOP fields should retain their documented meaning, rather than being treated as a measured error radius in metres without an additional error model.

### 2. GPS error varies with receiver and environment

GPS.gov identifies satellite geometry, signal obstruction, atmospheric conditions, receiver characteristics and reflected signals as accuracy factors. Its signal-in-space performance commitments do not guarantee the accuracy of a consumer receiver's calculated position or speed. The archived page has an update notice and is used here for these technical distinctions, not current device performance. [GPS.gov accuracy explanation](https://archive.gps.gov/systems/gps/performance/accuracy/)

**Implication:** no single radius follows from a GPS-wide guarantee. A tight spatial cluster is evidence compatible with a stop; broadening its radius to absorb poor reception can also absorb real slow movement. Repeated identical coordinates may reflect quantisation or processing. Summed point-to-point distance and isolated low speeds are weak stand-alone classifiers.

### 3. Elevation presence does not establish independent vertical evidence

Strava describes using recorded barometric elevation for recognised barometric devices, or looking up elevation from GPS positions for other activities, with smoothing. It documents barometric drift due to weather and issues caused by sensor blockage, as well as basemap limitations. These are statements about Strava's activity processing, not proof of the provenance of a particular exported GPX file. [Strava elevation documentation](https://support.strava.com/en-us/articles/15401909-elevation)

**Implication:** a flat elevation trace might be a processed ground-height lookup rather than an independent measurement of a climber's height. A convincing sustained change can conservatively veto automatic stop exclusion; flat, missing or unknown-provenance elevation cannot certify a stop. Even known barometric provenance still requires quality checks. This is a proposed asymmetric use of elevation, not a validated detector.

### 4. Spatial extent plus elapsed duration is an established candidate-detector pattern

MovingPandas defines stops through a maximum spatial extent and minimum duration. Its versioned API accepts both as caller parameters. The v0.23.0 implementation uses a minimum-rotated-rectangle diagonal check, timestamps for duration, and the previous observed point as the end when a candidate fails the spatial test. It does not add an elevation safeguard or explicit maximum inter-sample-gap parameter in this detector. [MovingPandas API](https://movingpandas.readthedocs.io/en/v0.23.0/api/trajectorystopdetector.html), [v0.23.0 implementation](https://github.com/movingpandas/movingpandas/blob/v0.23.0/movingpandas/trajectory_stop_detector.py)

**Implication:** this supports evaluating spatial confinement over time instead of copying a low-speed cutoff. Its example settings are demonstrations, not hike/climb validation. GPSGoblin would still need sampling/continuity guards, movement evidence, explainable boundaries and performance checks. No dependency addition or direct code adoption is proposed.

### 5. Moving time is method-dependent

Strava describes deriving moving time from GPS positions, distance and speed, with sport-dependent handling and respect for recorded timer pauses in uploaded runs. It acknowledges that GPS drift and signal loss affect the result and that devices/platforms can calculate resting time differently. Competitive segments and best efforts use elapsed time. [Strava moving time, speed and pace calculations](https://support.strava.com/en-us/articles/15401804-moving-time-speed-and-pace-calculations)

**Implication:** another platform's moving-time total is a useful comparison, not ground truth for training a detector. Avoid claiming an exact match or labelling all remaining time as proven physical movement. The proposed viewer should identify that it excludes selected detected intervals, and retain its original elapsed totals.

### 6. Timer state records timer operation

Garmin's API distinguishes a stopped recording timer from an Auto-Pause state and a running timer; it exposes elapsed time and timer time separately. Its FIT course documentation separately defines elapsed duration including pauses and timer duration excluding them. [Garmin activity timer states](https://developer.garmin.com/connect-iq/api-docs/Toybox/Activity.html#TimerState-module), [Garmin activity values](https://developer.garmin.com/connect-iq/api-docs/Toybox/Activity/Info.html), [Garmin FIT duration fields](https://developer.garmin.com/fit/file-types/course/)

**Implication:** a timer pause is evidence of timer operation, not a verified stationary location. This supports the existing specification's separation of timer pauses from detected stops. Garmin's durations cookbook currently returned only navigation through the web reader, so this investigation does not claim to have reverified its article body.
