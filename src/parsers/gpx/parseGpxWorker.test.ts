/** @jest-environment node */
import { parseGpx } from '.';
import { readFileSync } from 'node:fs';

it('parses GPX without window or the browser DOM, as required in a worker', () => {
  const result = parseGpx('<gpx version="1.1"><wpt lat="0" lon="0"><name>Zero</name></wpt></gpx>');
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.document.waypoints[0]).toMatchObject({ name: 'Zero', latitudeDegrees: 0, longitudeDegrees: 0 });
});

it('accepts large valid metadata and extension structures without arbitrary resource caps', () => {
  const contents = `<gpx version="1.1"><metadata><desc>${'é'.repeat(1024 * 1024)}</desc></metadata><wpt lat="0" lon="0"/><extensions>${'<x/>'.repeat(25000)}</extensions></gpx>`;
  const result = parseGpx(contents);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.document.originalContents).toBe(contents);
});

it('reads the sanitised bikerouter exporter fixture while preserving its source structure', () => {
  const contents = readFileSync('tests/fixtures/gpx/bikerouter-2025.46.gpx', 'utf8');
  const result = parseGpx(contents);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.document.creator).toBe('bikerouter.de 2025.46');
  expect(result.document.tracks).toHaveLength(1);
  expect(result.document.tracks[0].segments[0].samples).toHaveLength(169);
  expect(result.document.originalContents).toBe(contents);
});

it('explicitly rejects the sanitised GPSBabel GPX 1.0 recording fixture', () => {
  expect(parseGpx(readFileSync('tests/fixtures/gpx/gpsbabel-gpx10.gpx', 'utf8'))).toEqual({ ok: false, error: 'Only GPX 1.1 files are currently supported.' });
});

it.each([
  '<!DOCTYPE gpx SYSTEM "https://gpx-canary.invalid/external.dtd"><gpx version="1.1"/>',
  '<!DOCTYPE gpx [<!ENTITY a "ha"><!ENTITY b "&a;&a;">]><gpx version="1.1">&b;</gpx>',
  '<!ENTITY external SYSTEM "file:///etc/passwd"><gpx version="1.1"/>',
  '<gpx version="1.1"><wpt lat="0" lon="0"><name>&unknown;</name></wpt></gpx>',
  '<gpx version="1.1" version="1.0"/>',
  '<gpx version="1.1"><wpt lat="0" lon="0"></gpx>'
])('rejects hostile or malformed XML without producing a document: %s', contents => {
  expect(parseGpx(contents).ok).toBe(false);
});

it.each(['a & b', '\u0000', '&#0;', '&#xD800;', '<![CDATA[bad\u0000]]>'])('rejects invalid XML character data: %s', value => {
  const result = parseGpx(`<gpx version="1.1"><wpt lat="0" lon="0"><name>${value}</name></wpt></gpx>`);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error('Expected malformed XML to be rejected');
  expect(result.error).toBe('The file contains malformed XML.');
});

it('imports every point in the permissioned, sanitised Strava recording', () => {
  const contents = readFileSync('tests/fixtures/gpx/strava-recording.gpx', 'utf8');
  const result = parseGpx(contents);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.document.creator).toBe('StravaGPX');
  expect(result.document.tracks).toHaveLength(1);
  expect(result.document.tracks[0].segments).toHaveLength(1);
  const samples = result.document.tracks[0].segments[0].samples;
  expect(samples).toHaveLength(8142);
  expect(samples[0]).toMatchObject({ latitudeDegrees: 0, longitudeDegrees: 0, elevationMetres: 101, sourceTime: '2026-01-01T00:00:01Z' });
  expect(samples[8141].sourceTime).toBe('2026-01-01T02:15:42Z');
  expect(result.document.originalContents).toBe(contents);
});

it('preserves valid escaped and CDATA text while rejecting malformed XML', () => {
  const result = parseGpx('<gpx version="1.1"><wpt lat="0" lon="0"><name>A &amp; B &#x1F600; <![CDATA[<C & D>]]></name></wpt></gpx>');
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.document.waypoints[0].name).toBe('A & B 😀 <C & D>');
});

it('preserves supported fields and segment boundaries around deep, repeated extensions', () => {
  const extension = `${'<v:group>'.repeat(2000)}<v:value>unused</v:value>${'</v:group>'.repeat(2000)}`;
  const contents = `<g:gpx xmlns:g="http://www.topografix.com/GPX/1/1" xmlns:v="urn:vendor" version="1.1" creator="  Recorder  ">
    <g:metadata><g:name>First &amp; only</g:name><g:name>Ignored duplicate</g:name></g:metadata>
    <g:metadata><g:name>Ignored metadata</g:name></g:metadata>
    <g:extensions>${extension}</g:extensions>
    <g:trk><g:name>  A <![CDATA[<B>]]> C  </g:name><g:desc>before<v:span> middle </v:span>after</g:desc>
      <g:trkseg/><g:trkseg><g:trkpt lat="0" lon="0"><g:ele>0</g:ele><g:time> 2026-09-12T01:02:03Z </g:time><g:extensions>${'<v:record value="1"/>'.repeat(10000)}</g:extensions></g:trkpt></g:trkseg>
      <g:trkseg><g:trkpt lat="1" lon="2"><g:time/></g:trkpt></g:trkseg>
    </g:trk>
  </g:gpx>`;
  const result = parseGpx(contents);
  if (!result.ok) throw new Error(result.error);
  expect(result.document).toEqual({
    creator: 'Recorder', format: 'gpx', version: '1.1', originalContents: contents,
    metadata: { name: 'First & only' }, routes: [], waypoints: [],
    tracks: [{ id: 'track-0', name: 'A <B> C', description: 'before middle after', segments: [
      { id: 'track-0-segment-0', samples: [] },
      { id: 'track-0-segment-1', samples: [{ id: 'track-0-segment-1-sample-0', latitudeDegrees: 0, longitudeDegrees: 0, elevationMetres: 0, sourceTime: ' 2026-09-12T01:02:03Z ' }] },
      { id: 'track-0-segment-2', samples: [{ id: 'track-0-segment-2-sample-0', latitudeDegrees: 1, longitudeDegrees: 2, sourceTime: '' }] }
    ] }]
  });
});

it('validates XML in ignored extensions and after supported geographic content', () => {
  const contents = `<gpx version="1.1"><wpt lat="0" lon="0"/><extensions>${'<entry/>'.repeat(10000)}<entry>&undefined;</entry></extensions></gpx>`;
  expect(parseGpx(contents)).toEqual({ ok: false, error: 'The file contains malformed XML.' });
});

it('keeps the first optional field even when it is empty and preserves XML text normalization', () => {
  const contents = '<gpx version="1.1"><wpt lat="0" lon="0"><name/><name>Later name</name><desc> A\r\nB<!--ignored--><?note ignored?>&#13;C </desc><time/><time>Later time</time><ele>0</ele><ele>invalid ignored duplicate</ele></wpt></gpx>';
  const result = parseGpx(contents);
  if (!result.ok) throw new Error(result.error);
  expect(result.document.waypoints).toEqual([{
    id: 'waypoint-0', latitudeDegrees: 0, longitudeDegrees: 0,
    elevationMetres: 0, sourceTime: '', description: 'A\nB\rC'
  }]);
});

it('reports missing coordinates before invalid values independently of source order', () => {
  const contents = '<gpx version="1.1"><wpt lat="0"/><trk><trkseg><trkpt lat="0"/></trkseg></trk><rte><rtept lat="invalid" lon="0"/><rtept lat="0" lon="0"><ele>invalid</ele></rtept><rtept lat="0"/></rte></gpx>';
  expect(parseGpx(contents)).toEqual({ ok: false, error: 'A route point is missing its coordinates.' });
});
