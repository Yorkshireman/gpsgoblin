import { DOMParser, onWarningStopParsing } from '@xmldom/xmldom';
import type { Document } from '@xmldom/xmldom';
import { SaxesParser } from 'saxes';
import type { GpxParseResult } from '@/domain/activityDocument';
import { parseGpxRoutes } from './parseGpxRoutes';
import { parseGpxTracks } from './parseGpxTracks';
import { parseGpxWaypoints } from './parseGpxWaypoints';
import { findDirectChildren, findDirectChildText } from './gpxElementQueries';

export const parseGpx = (fileText: string): GpxParseResult => {
  if (/<!DOCTYPE[\s>]/i.test(fileText)) {
    return {
      ok: false,
      error: 'GPX files containing a DOCTYPE declaration are not supported.'
    };
  }

  let xmlDocument: Document;
  try {
    // xmldom alone accepts some malformed character data without a warning.
    // Validate XML well-formedness before building the adapter's DOM.
    new SaxesParser({ xmlns: true }).write(fileText.trim()).close();
    xmlDocument = new DOMParser({ onError: onWarningStopParsing }).parseFromString(
      fileText.trim(), 'application/xml'
    );
  } catch {
    return {
      ok: false,
      error: 'The file contains malformed XML.'
    };
  }

  if (xmlDocument.documentElement?.localName !== 'gpx') {
    return {
      ok: false,
      error: 'The file is not a GPX document.'
    };
  }

  if (xmlDocument.documentElement.getAttribute('version') !== '1.1') {
    return {
      ok: false,
      error: 'Only GPX 1.1 files are currently supported.'
    };
  }

  const rootElement = xmlDocument.documentElement;
  const creator = rootElement.getAttribute('creator')?.trim() || undefined;
  const metadataElement = findDirectChildren(rootElement, 'metadata')[0];

  const metadataName = metadataElement ? findDirectChildText(metadataElement, 'name') : undefined;
  const metadataDescription = metadataElement
    ? findDirectChildText(metadataElement, 'desc')
    : undefined;

  const metadata =
    metadataName || metadataDescription
      ? {
          ...(metadataDescription ? { description: metadataDescription } : {}),
          ...(metadataName ? { name: metadataName } : {})
        }
      : undefined;

  const routesResult = parseGpxRoutes(rootElement);

  if (!routesResult.ok) {
    return routesResult;
  }

  const { routes } = routesResult;
  const tracksResult = parseGpxTracks(rootElement);

  if (!tracksResult.ok) {
    return tracksResult;
  }

  const { tracks } = tracksResult;
  const waypointsResult = parseGpxWaypoints(rootElement);

  if (!waypointsResult.ok) {
    return waypointsResult;
  }

  const { waypoints } = waypointsResult;
  if (routes.length === 0 && tracks.length === 0 && waypoints.length === 0) {
    return {
      ok: false,
      error: 'This GPX file does not contain a track to display.'
    };
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
    return {
      ok: false,
      error: 'This GPX file does not contain any geographic points to display.'
    };
  }

  return {
    ok: true,
    document: {
      ...(creator ? { creator } : {}),
      format: 'gpx',
      ...(metadata ? { metadata } : {}),
      originalContents: fileText,
      routes,
      tracks,
      version: '1.1',
      waypoints
    }
  };
};
