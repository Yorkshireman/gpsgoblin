# GPX support

## Parser and supported content

GPSGoblin uses MIT-licensed `@xmldom/xmldom` 0.9.12 behind the `parseGpx` adapter,
running in a dedicated Web Worker. A strict `saxes` 6.0.0 well-formedness pass
rejects malformed character data before DOM construction; xmldom warnings/errors
also stop parsing. XML is not silently repaired. Files stay local. The parser supports GPX 1.1 tracks, separate track segments, planned routes,
waypoints, names/descriptions, coordinates and optional elevation. It retains the
original file contents, source point order, stable point identifiers and raw point
timestamps. Missing elevation differs from genuine zero elevation.

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
No arbitrary time-gap threshold is used: absent an explicit segment break or bad
timestamp, an interval represents the entire time between the adjacent points.

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
in minutes and seconds. Zero shows the original calculated interval speeds. Averaging is time-weighted
(distance divided by time), including zero speed, and restarts after unusable time
or a segment boundary. The start of a section uses the time available. A window
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
The pace axis defaults to Automatic, covering the highest displayed value with
three CSS pixels of top padding. A Pace range control beside the chart settings
allows a user to choose Custom maximum and enter minutes per kilometre or mile.
Empty or invalid input leaves the automatic range active; invalid non-positive
values show an explanation. The maximum converts when units change and can be
removed by switching back to Automatic.

The custom maximum only changes the visible axis range. Original line coordinates
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
intervals, including recorded stops, for the selected track or segment. Untimed
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
for measured improvements and remaining work. No configured cap does not establish
unlimited device capacity. Unsupported empty charts are hidden with an explanation.

## Viewer workspace

The workspace implementation lives in `src/features/gpx-viewer/measurement-explorer/`,
with `index.ts` exposing only `MeasurementExplorer`. The explorer owns selection and
display settings; its local components render the summary, chart controls, selected
measurement, motion controls, route-position control and mobile map dialog. The
nested `chart/` module exposes `MeasurementChart` and keeps Recharts plotting and
point hit-testing private. Smaller document/file components remain in `components/`;
shared unit formatting and display conversion remain in `measurementDisplay.ts`.

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
preserving selection. The route-position slider remains a keyboard alternative to
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

| Exporter/input | Verified behaviour |
| --- | --- |
| bikerouter.de 2025.46, sanitised GPX 1.1 | Imports its 169-point planned route exported as a track. |
| StravaGPX, permissioned complete 8,142-point GPX 1.1 recording | Imports recorded structure, elevation and timestamps after sanitisation; the complete private original also opens in local Chrome profiling. |
| GPSBabel, sanitised GPX 1.0 recording | Rejected explicitly as an unsupported version. |
| Synthetic UTF-8 GPX 1.1 | Tracks, segments, routes, waypoints, names/descriptions, optional elevation and raw timestamps, plus hostile/malformed and missing-data cases. |
| HR, cadence, power and other vendor extensions | Not interpreted; no vendor compatibility claim. |

The Strava fixture preserves all 8,142 source points but replaces sensitive values
and removes extensions. It does not establish support for all Strava exports.
The benchmark report records the named Chrome/device evidence and O4's remaining
performance and browser/device gaps. Production basemap selection and other
product-spec release gates remain open.

Primary references: [GPX 1.1 schema](https://www.topografix.com/GPX/1/1/),
[Recharts Line](https://recharts.github.io/en-US/api/Line/).
