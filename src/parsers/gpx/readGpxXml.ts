import { SaxesParser } from 'saxes';
import type { SaxesTagNS } from 'saxes';
import type { GeographicSample, GpxParseResult, Route, RoutePoint, Track, TrackSegment, Waypoint } from '@/domain/activityDocument';
import { pointError, readGpxPoint, readNames } from './readGpxPoint';
import type { PointFields, PointIssues, PointKind, TextFields } from './readGpxPoint';

type NamedFrame = { fields: TextFields };
type Frame =
  | { kind: 'root' }
  | ({ kind: 'metadata' } & NamedFrame)
  | ({ kind: 'track'; id: string; segments: TrackSegment[] } & NamedFrame)
  | { kind: 'segment'; id: string; samples: GeographicSample[]; target: TrackSegment[] }
  | ({ kind: 'route'; id: string; points: RoutePoint[] } & NamedFrame)
  | ({ kind: 'point'; pointKind: PointKind; target?: GeographicSample[] } & PointFields)
  | { kind: 'text'; fields: TextFields; field: keyof TextFields }
  | undefined;

const textField = (name: string): keyof TextFields | undefined => {
  if (name === 'name' || name === 'desc' || name === 'ele' || name === 'time') return name;
  return undefined;
};

const pointFrame = (
  tag: SaxesTagNS,
  pointKind: PointKind,
  id: string,
  target?: GeographicSample[]
): Frame => {
  return {
    kind: 'point', pointKind, id, target, fields: {},
    latitude: tag.attributes.lat?.value,
    longitude: tag.attributes.lon?.value
  };
};

// SAX validates the entire XML while this adapter retains only supported domain
// values and open-element state. Unknown extensions never become a second tree.
export const readGpxXml = (fileText: string): GpxParseResult => {
  const routes: Route[] = [];
  const tracks: Track[] = [];
  const waypoints: Waypoint[] = [];
  const issues: Record<PointKind, PointIssues> = {
    'route point': {}, 'track point': {}, waypoint: {}
  };
  const stack: Frame[] = [];
  const textFrames: Extract<Frame, { kind: 'text' }>[] = [];
  let rootName: string | undefined;
  let version: string | undefined;
  let creator: string | undefined;
  let metadataFields: TextFields | undefined;

  const openElement = (tag: SaxesTagNS): Frame => {
    const parent = stack.at(-1);
    const name = tag.local;
    if (stack.length === 0) {
      rootName = name;
      version = tag.attributes.version?.value;
      creator = tag.attributes.creator?.value.trim() || undefined;
      return { kind: 'root' };
    }
    if (rootName !== 'gpx' || version !== '1.1') return undefined;

    // Preserve the adapter's existing validation of every descendant trkpt,
    // including ones outside a supported track/segment. Only direct samples
    // within a track segment are added to the geographic model.
    if (name === 'trkpt') {
      return parent?.kind === 'segment'
        ? pointFrame(tag, 'track point', `${parent.id}-sample-${parent.samples.length}`, parent.samples)
        : pointFrame(tag, 'track point', '');
    }
    if (parent?.kind === 'root') {
      if (name === 'trk') return { kind: 'track', id: `track-${tracks.length}`, fields: {}, segments: [] };
      if (name === 'rte') return { kind: 'route', id: `route-${routes.length}`, fields: {}, points: [] };
      if (name === 'wpt') return pointFrame(tag, 'waypoint', `waypoint-${waypoints.length}`, waypoints);
      if (name === 'metadata' && metadataFields === undefined) {
        metadataFields = {};
        return { kind: 'metadata', fields: metadataFields };
      }
    }
    if (parent?.kind === 'track' && name === 'trkseg') {
      return { kind: 'segment', id: `${parent.id}-segment-${parent.segments.length}`, samples: [], target: parent.segments };
    }
    if (parent?.kind === 'route' && name === 'rtept') {
      return pointFrame(tag, 'route point', `${parent.id}-point-${parent.points.length}`, parent.points);
    }
    const field = textField(name);
    const supportedText = parent?.kind === 'point'
      ? field === 'ele' || field === 'time' || parent.pointKind !== 'track point'
      : field === 'name' || field === 'desc';
    if (parent && 'fields' in parent && parent.kind !== 'text' && field && supportedText && !(field in parent.fields)) {
      parent.fields[field] = '';
      const frame: Extract<Frame, { kind: 'text' }> = { kind: 'text', fields: parent.fields, field };
      textFrames.push(frame);
      return frame;
    }
    return undefined;
  };

  const appendText = (text: string) => {
    // Descendant text is included just as XML textContent was, while comments
    // and processing instructions are excluded. The first field wins, even empty.
    for (const frame of textFrames) frame.fields[frame.field] += text;
    return undefined;
  };

  const parser = new SaxesParser({ xmlns: true });
  parser.on('opentag', tag => {
    stack.push(openElement(tag));
  });
  parser.on('text', appendText);
  parser.on('cdata', appendText);
  parser.on('closetag', () => {
    const frame = stack.pop();
    if (frame?.kind === 'text') textFrames.pop();
    if (frame?.kind === 'point') {
      const point = readGpxPoint(frame, frame.pointKind !== 'track point', issues[frame.pointKind]);
      frame.target?.push(point);
    }
    if (frame?.kind === 'segment') frame.target.push({ id: frame.id, samples: frame.samples });
    if (frame?.kind === 'track') tracks.push({ id: frame.id, ...readNames(frame.fields), segments: frame.segments });
    if (frame?.kind === 'route') routes.push({ id: frame.id, ...readNames(frame.fields), points: frame.points });
  });
  parser.write(fileText.trim()).close();

  if (rootName !== 'gpx') return { ok: false, error: 'The file is not a GPX document.' };
  if (version !== '1.1') return { ok: false, error: 'Only GPX 1.1 files are currently supported.' };
  // Preserve error precedence independently of element order in the source.
  for (const kind of ['route point', 'track point', 'waypoint'] as const) {
    const error = pointError(issues[kind], kind);
    if (error) return { ok: false, error };
  }
  if (routes.length === 0 && tracks.length === 0 && waypoints.length === 0) {
    return { ok: false, error: 'This GPX file does not contain a track to display.' };
  }
  const hasTrackPoints = tracks.some(track => {
    return track.segments.some(segment => {
      return segment.samples.length > 0;
    });
  });
  const hasRoutePoints = routes.some(route => {
    return route.points.length > 0;
  });
  if (!hasTrackPoints && !hasRoutePoints && waypoints.length === 0) {
    return { ok: false, error: 'This GPX file does not contain any geographic points to display.' };
  }
  const metadata = readNames(metadataFields ?? {});
  return {
    ok: true,
    document: {
      ...(creator ? { creator } : {}),
      format: 'gpx', version: '1.1', originalContents: fileText,
      ...(metadata.name || metadata.description ? { metadata } : {}),
      routes, tracks, waypoints
    }
  };
};
