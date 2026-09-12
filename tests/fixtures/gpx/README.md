# Sanitised exporter fixtures

All fixture locations, timestamps and measurements are artificial. These are
exporter-derived XML structures, not permission to publish original recordings.

## Permission and sources

The bikerouter and GPSBabel files are modified real exporter files from the
Apache-2.0-licensed [tkrajina/gpxpy](https://github.com/tkrajina/gpxpy) test corpus,
pinned to commit `df845044cc87ba6401e494a3a177ed007ff0f6eb`. Retrieved
12 September 2026. The upstream [licence](LICENSE.txt) permits redistribution
and modification; its [notice](NOTICE.txt) is retained. Those two fixture files
carry that licence, not a new licence for the GPSGoblin application or the
owner-supplied Strava fixture.

The repository owner supplied a private Strava GPX recording and explicitly
confirmed permission to sanitise and commit a copy in the issue #4 implementation
conversation on 12 September 2026. The original filename/path and contents are
not committed. The original file is unchanged. The local recording identifies
`StravaGPX`, GPX 1.1, one track, one segment and 8,142 track points, with elevation,
time and Garmin TrackPointExtension/v1 blocks. It is 2,058,874 bytes and contains
48,859 XML elements. The complete original is exercised locally in browser profiling; it opens without
resource cutoffs. The owner describes it as roughly a 2.5-hour activity, an ordinary
baseline for much larger intended inputs.

| Local file | Source | Expected result |
| --- | --- | --- |
| `bikerouter-2025.46.gpx` | [test_files/brouter_with_link.gpx](https://github.com/tkrajina/gpxpy/blob/df845044cc87ba6401e494a3a177ed007ff0f6eb/test_files/brouter_with_link.gpx) | Source identifies `bikerouter.de 2025.46`, GPX 1.1; 1 track, 1 segment, 169 points. Accepted. A planned route exported as a track, not evidence of a recorded activity. |
| `gpsbabel-gpx10.gpx` | [test_files/cerknicko-jezero.gpx](https://github.com/tkrajina/gpxpy/blob/df845044cc87ba6401e494a3a177ed007ff0f6eb/test_files/cerknicko-jezero.gpx) | Source identifies GPSBabel, GPX 1.0; 303 recorded points. Rejected with the unsupported-version message. No GPSBabel GPX 1.1 compatibility claim follows. |
| `strava-recording.gpx` | Owner-supplied recording; permission above | All 8,142 source points, with all sensitive values replaced and extensions removed. GPX 1.1, 1 track, 1 segment, timestamps and elevation. Accepted in full. This fixture does not certify sensor-extension interpretation or preserve the original measurements. |

## Transformation

`python3 scripts/sanitiseGpxFixture.py source.gpx destination.gpx` accepts only
reviewed creator values. The optional `--max-points` argument can create a clearly identified excerpt;
none of the current fixtures uses it.

The script replaces coordinates with a synthetic line near the equator, replaces
elevations and absolute times with artificial values, clears descriptions and
nonessential attributes, and removes metadata, links, bounds, author/email and
extension blocks. Remaining unsupported scalar text is cleared. XML is
reserialised; retained point order and track/segment structure remain. Files are
marked as modified. No original route shape, location, identity, health readings
or real timing is retained. Unmodified upstream/private sources are not committed.

These fixtures test exporter-derived structure, not original geography or
measurement accuracy. Parser tests verify source retention and expected outcomes;
the real browser worker imports the complete sanitised Strava recording. Synthetic tests separately
cover known-answer geometry/timing, missing data, large valid inputs, invalid character data,
malicious markup and external URLs.

Coverage is limited to the examples described here. Vendor HR/cadence/power
extensions are not interpreted. Add further permissioned, sanitised examples
before widening public compatibility claims.
