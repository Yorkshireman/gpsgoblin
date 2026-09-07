# GPX support

## Parser decision

GPSGoblin parses GPX text with the browser’s `DOMParser` API behind the
framework-independent `parseGpx` adapter. This avoids adding a third-party XML
parser while keeping the parser replaceable.

`DOMParser` is a browser API, so this choice introduces no additional
third-party parser licence.

## Tested scope

The current parser supports:

- GPX 1.1 documents
- tracks and optional track names
- separate track segments
- ordered track points with latitude and longitude
- optional elevation in metres
- multiple tracks and segments without flattening them
- retention of the original file contents

It rejects:

- malformed XML
- non-GPX documents
- GPX versions other than 1.1
- files containing a `DOCTYPE` declaration
- track points with missing, non-numeric, or out-of-range coordinates
- GPX documents with no tracks
- tracks containing no track points
- empty, non-numeric, or infinite elevation values

The viewer does not currently claim support for GPX 1.0, routes, waypoints,
timestamps, extensions, or complete GPX schema validation.

## Evidence

Parser behavior is covered by
`src/parsers/gpx/parseGpx.test.ts`. The browser-visible import and failure flow
is covered by `src/app/tools/gpx-file-viewer/page.test.tsx`.
