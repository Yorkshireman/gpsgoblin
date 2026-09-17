# GPX support

## Parser and supported content

GPSGoblin uses ISC-licensed `saxes` 6.0.0 behind the `parseGpx` adapter,
running in a dedicated Web Worker. One strict SAX pass validates XML and extracts
supported values without constructing a temporary DOM tree. Unknown extensions
are validated but not interpreted or retained as a second tree. XML is not silently
repaired. Files stay local. GPX 1.1 tracks, separate track segments, planned routes,
waypoints, names/descriptions, coordinates and optional elevation are supported.
The original file contents, source point order, stable identifiers and raw point
timestamps remain available. Missing elevation differs from genuine zero elevation.

Malformed XML, non-GPX documents, unsupported versions, `DOCTYPE` declarations,
missing/invalid/out-of-range coordinates, and empty/non-numeric/infinite elevation
values are rejected explicitly. This is not complete GPX schema validation.

GPX 1.0 and vendor extensions are not interpreted. Device-reported totals and
extension speed are not treated as calculated totals. Original XML is retained;
this does not promise a lossless conversion or support for every vendor field.

## Timing and measurement basis

Timing accepts calendar-valid four-digit positive years, hours 00–23, minutes and
seconds 00–59, fractional seconds, and an explicit `Z` or numeric UTC offset up to
14:00. Leap seconds and 24:00 notation are not currently interpreted. A missing
offset is an unknown timezone; the browser's local timezone is never substituted.
Invalid, empty and missing timestamps remain distinct from valid values.

Interval speed is horizontal great-circle distance between adjacent points divided
by their positive timestamp difference. Average speed uses the sum of those valid
intervals within each selected segment, excluding segment gaps and unusable intervals.
The displayed Duration is the last point's time minus the first point's time in the
selected track, segment or route, including pauses and gaps. It requires at least
two points with valid, timezone-qualified endpoint timestamps and a finish no earlier
than the start; otherwise it is unavailable. Neither duration is moving time. No sport is inferred
from the filename or extensions. A timed planned route is not evidence of a
completed activity.

Duplicate/backwards timestamps are flagged without sorting or repairing the source.
After a backwards timestamp, timing resumes only with adjacent valid points beyond
the latest accepted time in that segment. Missing or invalid timestamps break
adjacency. The UI reports the number of timed intervals and data-quality warnings.
Raw intervals and complete-recording totals retain the entire time between adjacent
valid points. For recorded tracks, chart presentation separately identifies observation
gaps using the local timing policy below; these are not detected stops.

Speed converts to km/h or mph. Pace is minutes per kilometre or mile, displayed as
minutes:seconds. Unsmoothed stationary intervals retain zero speed and unavailable pace, not an
infinite chart value. Elevation uses metres or feet. Conversion constants are
1 mile = 1609.344 metres and 1 foot = 0.3048 metres.

## Charts and selection

Recharts uses labelled numeric distance/value axes. Null measurements and segment
boundaries break lines. Dense recordings use lines instead of a marker at every
point: overlapping white marker outlines previously obscured the elevation line.
Clicking a chart position or using the keyboard-accessible position slider selects
the nearest source point and highlights it on the map. Selection never fabricates
a location in a missing-measurement gap. The selection layer sits above rendered
lines, fills and markers, so clicking directly on the trace selects a point too. Isolated measurements may use a small dot.
Changing the entity, segment or imported data clears the old selection. Textual
results remain available when WebGL fails.

Speed and pace default to a labelled 1-minute trailing average. A smoothing slider
directly below the chart offers 0–10 minutes, with five-second steps up to two
minutes and thirty-second steps thereafter. The selected duration appears in its label
in minutes and seconds. Zero shows calculated interval speeds, with recording gaps still masked. Averaging is time-weighted
(distance divided by time), including zero speed, and restarts after unusable time
or a segment boundary, and after an identified recording gap. The start of a section uses the time available. A window
boundary inside an interval uses a proportional share of that interval, assuming
its calculated average speed is constant during the interval. Averaging can soften
brief changes and delay stop/start transitions by up to the window length; the
unsmoothed view remains available to inspect them. Pace is calculated from the
averaged speed, rather than averaging individual pace values. The selected
measurement and tooltip use the same displayed value, tied to the ending source
point of the averaging window. Source values and full-resolution totals do not
change. Elevation is not averaged.

Pace uses minutes:seconds throughout, including values over an hour. Selected
values and tooltips explicitly show min/km or min/mi, matching the axis unit.
The pace axis defaults to a Suggested range, calculated in the worker from the
95th percentile of displayed pace weighted by eligible source-interval distance,
plus 25% headroom, rounded up in min/km before unit conversion. See the
[policy, evidence and limitations](pace-range-policy.md). The suggestion adapts to
smoothing and selected entity/segment, independently of screen width. The full
recording, including recorded stops, remains the underlying data view.

Show full range is directly available; Chart options contains Suggested, Full range
and Custom maximum controls. Empty or invalid custom input uses the full range and
invalid values show an explanation. Unit changes preserve the chosen maximum's
meaning and leave the options disclosure open. Slower values above the axis are
explicitly identified; Use suggested range restores the suggested view.

Suggested and custom maximums change only the visible axis range. Original line coordinates
are clipped outside that viewport, not flattened onto the ceiling. Upward arrow
buttons mark the highest original sample in nearby overflow sections of the
width-adapted drawing. Indicators within 32 screen pixels are grouped to keep
the touch targets separate. Selecting an arrow shows its actual pace and an “Above
visible maximum” explanation. The keyboard position control can still select any
source sample, with an arrow for that selected sample if it is above the range.
Missing data and segment gaps still split runs. Source data, smoothing and totals
are unchanged; this is independent of any future stop detector. Units and smoothing
remain user controls. Unit labels sit above the plot.

A smoothing window containing only exact zero-speed intervals returns exact zero
speed and unavailable pace, avoiding subtraction residue being inverted into an
enormous pace. This uses the actual interval values, not a small-speed threshold.

The Speed chart also shows a dashed overall average-speed line with its value in
the legend. It uses distance divided by duration over the same usable timed
intervals, including recorded stops and time in recording gaps, for the selected track or segment. Untimed
distance and gaps between segments are excluded. This reference does not change
with smoothing and converts with the selected display units.

There is one adjustable speed trace plus the fixed overall average. Longer
smoothing windows show sustained speed changes. The tooltip renders one
content block instead of unkeyed children through Chakra's tooltip list renderer.

The Speed and Pace charts share a “Show elevation” switch above the plot, off by
default, retaining its setting when switching between them. When enabled, a subtle
filled elevation profile using theme tokens sits behind the speed or pace
line, sharing its distance axis and using an independently labelled elevation axis
on the right. It preserves missing readings and segment breaks and converts with
metric/imperial units. The switch is absent when elevation is unavailable. The
separate elevation chart remains available.

The primary helper copy explains chart/map selection and missing measurements.
Calculation details are behind “How speed is calculated”.

Display values remain available at full resolution for calculations and selection.
The drawn chart adapts to its container's CSS width: each distance bucket retains
its first/last samples and the minimum/maximum elevation and motion values.
Segment boundaries, missing-measurement boundaries and transitions into/out of
calculated zero speed start a new fragment, whose extrema are retained separately.
This preserves narrow peaks and isolated readings even when separate fragments
share a screen pixel. It is display reduction, not physical stop detection or a
hard point limit; heavily fragmented inputs may retain many drawn points.

Click/tap selection searches the full-resolution data. It prefers an original
measurement within four CSS pixels of the target, then falls back to the nearest
distance with vertical proximity breaking ties. Missing values remain missing.
The keyboard position slider can select every source sample, and the marker uses
that original sample even when it is not a vertex in the reduced line. Hover
values refer to retained original measurements, not an interpolated bucket value.
Resizing and unit/metric/smoothing changes never modify source data or totals.

The viewer opens one document at a time, with no configured hard byte, point,
XML-count/depth, structure-count or processing-time cutoff. Hard resource
restrictions require explicit owner discussion and agreement. See the
[initial profiling](import-benchmarks.md) and [chart performance follow-up](chart-performance.md)
and [completed large-file implementation](large-file-support.md) for measured results and evidence boundaries. No configured cap does not establish
unlimited device capacity. Unsupported empty charts are hidden with an explanation.

## Background measurement processing

The import worker also calculates full-resolution geometry/timing and packs the
results into numerical columns. After sending the canonical document to the page,
it retains only derived columns, segment ranges and warning metadata. It does
not retain a second canonical source graph or the original XML for later settings.

Smoothing and metric/imperial speed, pace and elevation preparation run in that
worker. Initial views include numeric analysis columns; settings updates reuse
those columns and transfer only the changed display values. The page adapts them to chart and
selection objects referencing the original samples. Missing values, segment gaps,
zero-speed transitions and all original selectable samples are preserved. This
moves expensive work off the page thread without changing the calculation basis.
The page still draws the chart and map; transferring a buffer does not remove
rendering costs or establish unlimited memory capacity.

A file owns one worker session, terminated on successful replacement, Clear or
unmount. Failed or cancelled replacements preserve the previous session and view.
There is at most one active settings calculation and the latest queued update;
obsolete requests cannot overwrite a newer selection. The last completed values
and their units remain visible during updates, with nearby Updating feedback,
including beside Smoothing. Failures retain the previous view and offer retry or
clear/reopen guidance. No processing deadline was introduced.

## Viewer workspace

The workspace implementation lives in `src/features/gpx-viewer/measurement-explorer/`,
with `index.ts` exposing only `MeasurementExplorer`. The explorer owns selection and
display settings; its local components render the summary, chart controls, selected
measurement, motion controls, route-position control and mobile map dialog. The
nested `chart/` module exposes `MeasurementChart` and keeps Recharts plotting and
point hit-testing private. Smaller document/file components remain in `components/`;
shared unit labels and formatting remain in `measurementDisplay.ts`, while numeric
display conversion belongs to the worker's prepared-measurements module.

After a successful import, a compact filename/Change/Clear row replaces onboarding
and the dropzone. A failed replacement keeps the previous successful file identity
and results. A pending import offers Cancel while Change and Clear remain usable.
Cancel preserves the loaded document and selection; Clear removes the document
and cancels pending work. Cancel and Clear return keyboard focus to the file
chooser. A worker response from an old request cannot restore cleared data or
overwrite a newer file. Worker failures offer recovery guidance; a long-running import remains cancellable.
The picker is transient, so the same file can be selected again after cancellation
or failure. The workspace stays in memory only; refresh and clear lose the work. Distance and readable Duration appear before the active chart.
The chart selector offers supported Speed, Pace and Elevation views; units are next
to it. Only one chart is active. Measurement warnings, complete file/entity names,
source metadata and calculation details remain available through disclosure controls.

Desktop shows the chart and local route map side by side. The selected point's
values sit immediately above the plot: distance, paired speed/pace and elevation,
and recorded time. Coordinates and calculation notes are in a Source details
disclosure within that box; there is no separate selected-point details section.
The position slider describes the selected distance rather than a source point number.
Smoothing remains directly below the plot. Phones
use a “View on map” dialog, with “Back to chart” restoring focus to its trigger and
preserving selection. The phone map is mounted only while the dialog is open;
desktop and phone views do not keep duplicate maps alive. Resizing preserves the
selected point while disposing the previous map. The route-position slider remains a keyboard alternative to
clicking or tapping plotted measurements. Opening the map is explicit; selecting a
point never scrolls the page automatically.

Issue #10 verification used synthetic recordings in installed Google Chrome at
1440 × 900, 1280 × 720, 390 × 844 and 375 × 667 CSS pixels. Initial, loaded,
selected and mobile map viewport screenshots were inspected. Summary results appear
in the initial loaded viewport. After scrolling the chart controls to the top once,
the chart, selected values, smoothing and position controls fit together at the
normal text size, including the short phone. Desktop selection visibly updates the
adjacent map. Mobile touch selection and map return retain the selected point;
keyboard unit/metric changes, smoothing, overlay switching and position movement
remain usable. Long names, extensive metadata, missing data/warnings and 150% root
text size were checked for disclosure access and horizontal overflow. Enlarged text
requires more vertical scrolling. These are Chrome viewport/touch emulation checks,
not evidence from physical phones or other browser engines.

## Verification

- `pnpm test --runInBand`: parser, known-answer analysis and viewer integration tests.
- `pnpm tsc`, `pnpm lint`, `pnpm knip`: static checks.
- `pnpm build` followed by `pnpm test:browser`: focused desktop/mobile Chrome checks
  against the static export, including actual local MapLibre workers, chart gaps,
  chart-to-map selection, keyboard inspection, unit changes, dense charts and empty charts.
  The browser checks use installed Google Chrome and Python 3 for the local server.

Committed fixtures include synthetic cases defined in the tests and
[permissioned, sanitised exporter examples](../tests/fixtures/gpx/README.md)
with pinned provenance. They contain no personal activity locations or measurements. Set `GPX_VERIFY_FILE` to a local GPX path when running `pnpm test:browser`
to run the optional real-recording check; it does not copy the recording into the
repository. Screenshots are stored in the ignored `test-results` directory.
Tested exporter coverage is deliberately narrow:

| Exporter/input                                                 | Verified behaviour                                                                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| bikerouter.de 2025.46, sanitised GPX 1.1                       | Imports its 169-point planned route exported as a track.                                                                                       |
| StravaGPX, permissioned complete 8,142-point GPX 1.1 recording | Imports recorded structure, elevation and timestamps after sanitisation; the complete private original also opens in local Chrome profiling.   |
| GPSBabel, sanitised GPX 1.0 recording                          | Rejected explicitly as an unsupported version.                                                                                                 |
| Synthetic UTF-8 GPX 1.1                                        | Tracks, segments, routes, waypoints, names/descriptions, optional elevation and raw timestamps, plus hostile/malformed and missing-data cases. |
| HR, cadence, power and other vendor extensions                 | Not interpreted; no vendor compatibility claim.                                                                                                |

The Strava fixture preserves all 8,142 source points but replaces sensitive values
and removes extensions. It does not establish support for all Strava exports.
The [completion report](large-file-support.md) records named Chrome, Firefox and
WebKit engine evidence and measured memory/map costs. Physical phones and native
Safari remain unverified; O4 retains the public-release evidence boundary. Production basemap selection and other
product-spec release gates remain open.

Primary references: [GPX 1.1 schema](https://www.topografix.com/GPX/1/1/),
[Recharts Line](https://recharts.github.io/en-US/api/Line/).

## Recording gaps (issue #14)

The default complete-recording chart marks an interval as a recording gap only when
it is strictly longer than both 120 seconds and ten times a local reference interval.
For each candidate, use up to 20 neighbouring eligible intervals on each side,
exclude the candidate, and take the larger side median. Each nonempty side needs
at least five intervals; an exact run edge can use the other side alone. Otherwise
abstain. Segment boundaries and unusable timestamps break runs. Planned routes do
not receive this recording-gap classification. See the
[investigation and limitations](recording-gap-investigation.md).

Gap speed/pace is unavailable even at zero smoothing; smoothing restarts with the
next usable interval. Source points, raw interval calculations, distance, elapsed
duration and overall complete-recording average remain unchanged. The default average label explicitly includes
gaps. The optional confirmed-stop view below uses a separate eligible calculation.

Visible 44-pixel Gap buttons sit above the trace. Nearby markers are grouped to
avoid overlapping touch targets; repeated activation cycles through their source
endpoints in order. Expand the recording-gap count to access every gap through the Inspect recording gap selector. Chart markers use a small break symbol with a 44-pixel touch target. Close the selected gap details to clear selection; individual markers also toggle off when selected again.
Both controls update the existing nearby selection panel with duration and endpoint
distance. The map points to the recorded ending sample, never an invented position
inside the gap. The selected gap persists across units, speed/pace, smoothing and
mobile map viewing. Downsampling retains every gap endpoint.

A brief legitimate change to sparse sampling can still resemble a gap; dense
stationary recording is intentionally unaffected. These thresholds are a conservative
presentation policy, not proof of recorder failure, rest, or absence of movement.

The pace-range controls include a collapsed “Why does pace sometimes spike?” tip.
It explains minutes per distance, stops/slow movement and small GPS position changes
in plain language, and describes smoothing, Custom maximum, overflow arrows and
Show full range without changing the underlying measurements or totals. The distance word follows
the selected metric/imperial units.

## Optional confirmed-stop view (issue #13)

Include stops is the default. Under Chart options, choose Exclude chosen stops
and independently choose Distance or Time. Spatially confined intervals are only
possible stops: GPS drift, slow progress and climbing can look alike. Review each
candidate through its Stop? chart marker or the accessible interval selector and
confirm it before exclusion. Every unconfirmed interval stays included. The review
dialog keeps confirmation and its changed graph together. Include stops restores
the complete calculation; original samples, file contents and totals never change.

Candidate analysis requires at least 60 seconds within a 10 m spatial extent and
observations no more than 10 seconds apart. Sparse or unusable timing is insufficient
evidence, not proof of movement. When no stops can be found, the viewer explains the limitation in plain language. Detector thresholds and coverage counts stay in this technical guide. Planned routes are ineligible. See the
[agreed policy, evidence and limitations](stop-detection-policy.md#agreed-viewer-implementation).

The filtered time axis and average use eligible recorded intervals, removing
confirmed stop intervals and unknown recording gaps from both distance and duration.
Gap duration is disclosed separately. Missing coverage stays explicit; the graph
does not establish the whole activity's true moving time. Exclusions reset smoothing
and remain visible breaks on either axis. Unit and pace-range changes do not change
the exclusion decisions. The separate Moving time summary is deferred to #11.

Owner-provided GPX recordings used for local validation live in the git-ignored
`private-recordings/` directory. Do not commit their contents or screenshots. Supply
them through the existing `GPSGOBLIN_GAP_FILE` and `GPSGOBLIN_CONTINUOUS_FILE` browser
test environment variables; public fixtures remain synthetic or sanitised.

## Dismissing point inspection

The blue point-details panel has a 44-pixel close target labelled “Close point
details”. Closing it clears the shared point selection: the panel, chart marker
and selected map marker disappear, and the position control reports “No point
selected”. Keyboard focus returns to the chart region without requesting a scroll.
A later chart or position-control selection opens inspection again. The existing
recording-gap close action also returns focus to the chart; stop confirmation and
file contents are unchanged.

Verification: the focused page test first failed because the close button was
absent, then passed. `pnpm test --runInBand --silent` passed 175 tests in 14 suites;
`pnpm tsc --incremental false`, `pnpm lint`, `pnpm knip` and `pnpm build` passed.
`pnpm exec playwright test tests/browser/chartSelection.spec.ts
 tests/browser/workspace.spec.ts --config
 /private/tmp/gpsgoblin-discovery-playwright.config.ts --workers=2` passed nine
checks against the static export on local port 4178, with external tiles blocked.

Selected/dismissed viewport screenshots were inspected at 1440×900, 1280×720,
390×844 and 375×667. With the chart region aligned to the top of the viewport,
the close control and point feedback remain visible alongside the graph; desktop
also shows the selected map marker. Dismissal removes both markers and leaves the
chart visible. Phone checks reopen the map to verify no marker remains. Keyboard
Enter and touch dismissal, reselection on the elevation chart, focus return and
absence of horizontal overflow passed. Existing workspace checks also passed,
including long names and enlarged text. This is Chrome on macOS with emulated
phone viewports, not physical-device testing.
