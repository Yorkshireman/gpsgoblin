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

Speed converts to km/h or mph. Pace is minutes per kilometre or mile (decimal
minutes); stationary intervals retain zero speed and have unavailable pace, not an
infinite chart value. Elevation uses metres or feet. Conversion constants are
1 mile = 1609.344 metres and 1 foot = 0.3048 metres.

## Charts and selection

Recharts uses labelled numeric distance/value axes. Null measurements and segment
boundaries break lines. Every displayed dot refers to one original point; interval
speed/pace belongs to the interval ending at that point. Lines only guide the eye;
missing measurements are not interpolated. Chart dots and the keyboard-accessible
point selector select by source identity and highlight the corresponding map
position. Changing the entity, segment or imported data clears the old selection.
Textual results remain available when WebGL fails.

Display conversion is separate from full-resolution analysis. There is currently
no downsampling or arbitrary point limit. Large-file performance and any future
downsampling threshold still require browser benchmarks. Unsupported empty charts
are hidden, with an explanation of unavailable measurements.

## Verification

- `pnpm test --runInBand`: parser, known-answer analysis and viewer integration tests.
- `pnpm tsc`, `pnpm lint`, `pnpm knip`: static checks.
- `pnpm build` followed by `pnpm test:browser`: focused desktop/mobile Chrome checks
  against the static export, including actual local MapLibre workers, chart gaps,
  chart-to-map selection, keyboard inspection, unit changes and empty charts.
  The browser checks use installed Google Chrome and Python 3 for the local server.

Fixtures are synthetic, defined in the test files, and contain no personal activity
data. They do not establish real-exporter compatibility or large-file limits.
Production basemap selection and other product-spec release gates remain open.

Primary references: [GPX 1.1 schema](https://www.topografix.com/GPX/1/1/),
[Recharts Line](https://recharts.github.io/en-US/api/Line/).
