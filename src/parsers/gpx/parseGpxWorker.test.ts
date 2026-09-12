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
