# GPX support

## Parser and supported content

GPSGoblin uses the browser's `DOMParser` behind the `parseGpx` adapter. Files stay
local. The parser supports GPX 1.1 tracks, separate track segments, planned routes,
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
by their positive timestamp difference. Calculated timed duration sums those valid
intervals within each selected segment. It excludes segment gaps and unusable
intervals: it is neither moving time nor total elapsed time. No sport is inferred
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
a location in a missing-measurement gap. Isolated measurements may use a small dot.
Changing the entity, segment or imported data clears the old selection. Textual
results remain available when WebGL fails.

Speed and pace default to a labelled 30-second trailing average. A smoothing slider
directly below the chart offers 0–120 seconds in five-second steps, with the selected
seconds below it. Zero shows the original calculated interval speeds. Averaging is time-weighted
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

Pace ticks use minutes:seconds, or hours and minutes for very large values. Unit
labels sit above the plot to avoid overlapping ticks. When near-stationary readings
exceed 30 min/km (the equivalent in imperial units), the default chart caps their
plotted height at that limit, with an explicit explanation and a “Show full pace
range” control. Tooltips and selected measurements retain the actual averaged pace;
this display limit never changes source values or calculations.

The Speed chart also shows a dashed overall average-speed line with its value in
the legend. It uses distance divided by duration over the same usable timed
intervals, including recorded stops, for the selected track or segment. Untimed
distance and gaps between segments are excluded. This reference does not change
with smoothing and converts with the selected display units.

A thicker blue speed-trend line uses a 5-minute trailing time-weighted average,
independent of the detail slider. It shares the same gap, stop and partial-window
rules as smoothing. The detailed trace is thinner and lighter so the trend remains
readable. Tooltips show both values at the source point. The tooltip renders one
content block instead of unkeyed children through Chakra's tooltip list renderer.

The primary helper copy explains chart/map selection and missing measurements.
Calculation details are behind “How speed is calculated”.

Display conversion is separate from full-resolution analysis. There is currently
no downsampling or arbitrary point limit. Large-file performance and any future
downsampling threshold still require browser benchmarks. Unsupported empty charts
are hidden, with an explanation of unavailable measurements.

## Verification

- `pnpm test --runInBand`: parser, known-answer analysis and viewer integration tests.
- `pnpm tsc`, `pnpm lint`, `pnpm knip`: static checks.
- `pnpm build` followed by `pnpm test:browser`: focused desktop/mobile Chrome checks
  against the static export, including actual local MapLibre workers, chart gaps,
  chart-to-map selection, keyboard inspection, unit changes, dense charts and empty charts.
  The browser checks use installed Google Chrome and Python 3 for the local server.

Committed fixtures are synthetic, defined in the test files, and contain no personal activity
data. Set `GPX_VERIFY_FILE` to a local GPX path when running `pnpm test:browser`
to run the optional real-recording check; it does not copy the recording into the
repository. Screenshots are stored in the ignored `test-results` directory.
These checks do not establish general real-exporter compatibility or large-file limits.
Production basemap selection and other product-spec release gates remain open.

Primary references: [GPX 1.1 schema](https://www.topografix.com/GPX/1/1/),
[Recharts Line](https://recharts.github.io/en-US/api/Line/).
