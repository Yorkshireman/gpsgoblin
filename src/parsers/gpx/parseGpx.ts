import type { GpxParseResult } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';
import { parseGpxTracks } from './parseGpxTracks';

export const parseGpx = (fileText: string): GpxParseResult => {
  if (/<!DOCTYPE[\s>]/i.test(fileText)) {
    return {
      ok: false,
      error: 'GPX files containing a DOCTYPE declaration are not supported.'
    };
  }

  const xmlDocument = new DOMParser().parseFromString(fileText.trim(), 'application/xml');

  const parserError = xmlDocument.querySelector('parsererror');

  if (parserError) {
    return {
      ok: false,
      error: 'The file contains malformed XML.'
    };
  }

  if (xmlDocument.documentElement.localName !== 'gpx') {
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

  const tracksResult = parseGpxTracks(rootElement);

  if (!tracksResult.ok) {
    return tracksResult;
  }

  const { tracks } = tracksResult;

  if (tracks.length === 0) {
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

  if (!hasTrackPoints) {
    return {
      ok: false,
      error: 'This GPX file does not contain any track points to display.'
    };
  }

  return {
    ok: true,
    document: {
      ...(creator ? { creator } : {}),
      format: 'gpx',
      ...(metadata ? { metadata } : {}),
      originalContents: fileText,
      routes: [],
      tracks,
      version: '1.1',
      waypoints: []
    }
  };
};
