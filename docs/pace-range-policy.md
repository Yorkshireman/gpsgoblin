# Suggested pace range

Implemented viewport policy, 14 September 2026. This changes the initial pace axis,
not the recorded activity, smoothing, stop classification or summary calculations.
The complete recording remains the default data view.

## Policy

Use the full-resolution, currently displayed pace after smoothing and recording-gap
masking. Weight each finite positive pace value by the horizontal distance in its
underlying source interval. Sort by pace and take the first value whose cumulative
weight reaches 95% of eligible distance. Add 25% headroom and round upwards to a
whole minute per kilometre. Convert that maximum for imperial display; changing
units must not choose a different part of the route. Ignore unavailable pace and
zero-distance intervals when estimating the range, but retain them in the underlying
data and existing presentation. Fall back to the full range if no usable estimate
exists. The worker computes the suggestion before chart downsampling.

Suggested mode updates for selected entity/segment and smoothing changes. Explicit
Full range and Custom maximum choices remain in effect across smoothing changes.
The custom maximum retains its existing conversion behaviour when units change.

The initial view shows the suggested limit and a direct **Show full range** action.
Manual settings are under **Chart options**, with Suggested, Full range and Custom
maximum choices. A visible notice identifies slower values above the selected range.
Arrow markers and source-point selection retain access to actual clipped values.
**Use suggested range** restores the suggestion. The expandable pace explanation
uses these labels and explains the meaning of high pace values.

## Why distance weighting

A long stop can contribute many points and substantial time while contributing
little distance. A sample-count or time-weighted percentile can therefore remain
controlled by that stop. A fixed cap can instead cut away most of a slow hike.
Distance weighting is a display choice about the majority of the route, not a claim
that low-distance intervals are unimportant or stationary.

At one-minute smoothing, independent trials on the two permissioned local exports
produced these maximums (min/km, rounded upwards with 25% headroom for percentiles):

| Candidate | Variable-frequency export | Near-one-second export |
| --- | ---: | ---: |
| Fixed maximum | 30 | 30 |
| Sample-count 95th percentile | 53 | 287 |
| Time-weighted 95th percentile | 81 | 285 |
| Distance-weighted 95th percentile | 54 | 32 |
| Full displayed maximum, approximately | 166 | 3,839 |

The distance-weighted choice places about 2.10% and 2.03% of eligible interval
distance above the axis, respectively. These are not percentages of stopped time.
At zero/ten-minute smoothing, suggested maximums are 56/48 for the first export and
30/30 for the second. The working viewer independently reproduces the 54 and 32
min/km initial suggestions with the actual parser and worker.

Synthetic comparisons show:

- A steady 60 min/km hike gets 75 min/km, keeping its slow movement visible.
- A route split equally by distance between 15 and 60 min/km also gets 75 min/km.
- Adding many tiny drift intervals at 600 min/km to the steady slow hike leaves
  its suggested maximum at 75 min/km; count/time percentiles rise to 750 min/km.
- A run at 6 min/km with tiny drift intervals at 500 min/km gets 8 min/km.
- A genuinely slow 90 min/km section covering only 4% of a route otherwise at
  15 min/km is clipped by the 19 min/km suggestion. It remains selectable and is
  immediately restored by Show full range. This is an intentional, disclosed
  limitation of a viewport covering most of the distance, not stop exclusion.

Neither 95% nor 25% headroom is a scientifically calibrated optimum. These are
conservative presentation parameters validated against the documented cases.
Large GPS drift, heavy resampling, highly irregular distance distribution or short
slow sections can still produce an imperfect initial view. No sport is inferred.

## Reproduction

`python3 scripts/investigatePaceRange.py` runs the synthetic comparison. Append
quoted local GPX paths for the two single-segment exports. The diagnostic reuses the
local research readers and gap rule; it does not replace production parsing. Output
uses recording numbers and aggregate values, with no filenames, coordinates, activity
dates or health measurements. Private recordings and screenshots stay local.

## Implementation verification

- `pnpm test --runInBand`: 169 tests passed in 13 suites. Known-answer tests cover
  sustained slow hiking, mixed climbs, drift, short slow sections, sampling-density
  invariance for equivalent distance/pace inputs, unavailable values, unit conversion,
  worker settings-only results and unchanged summaries.
- `pnpm tsc`, `pnpm lint`, `pnpm knip` and `pnpm build` passed. Knip had no findings;
  the build produced the static export. `git diff --check` passed.
- Chrome browser checks ran against that export at 1440×900, 1280×720, 390×844 and
  375×667 with mouse, keyboard and emulated touch. Suggested-range tests inspect
  an actual overflow arrow, show the unchanged selected value above range, restore
  full range, restore the suggestion, and convert units. Existing custom-range
  checks exercise manual entry, invalid input, source selection and restoration.
- The initial and selected screenshots were visually inspected at all four sizes.
  Manual options stay collapsed initially. After scrolling the workspace into view
  on short screens, the selected value and overflow arrow remain visible together;
  initial short windows still require scrolling to the lower graph and controls.
  Show full range stays outside the disclosure. The shorter suggested-limit label
  keeps it on the same row on the tested phones. Physical devices and non-Chrome
  engines were not tested in this change.
- Both local exports were inspected with the actual importer/worker; their initial
  limits are 54 and 32 min/km. On the export with gaps, gap buttons have a separate
  row above overflow arrows; a browser assertion verifies their targets do not
  overlap. Neither the inputs nor private screenshots were added to the repository.
- `suggestedPaceRange.spec.ts paceRange.spec.ts largeChart.spec.ts measurementWorker.spec.ts`
  passed 13 browser cases, including existing 50,000-point chart and worker checks.
  After marker-row separation and edge clamping,
  `suggestedPaceRange.spec.ts paceRange.spec.ts recordingGaps.spec.ts` passed all
  14 cases. Runs used the temporary port-4174 static-server configuration already
  used for local gap verification because the normal port was occupied.

This is a reversible viewport default with disclosed limitations. It does not
implement the deferred stop detector or moving-only data view.
