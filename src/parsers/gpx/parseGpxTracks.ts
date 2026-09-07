import type { GeographicSample, Track, TrackSegment } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';

type GpxTracksParseResult =
  | Readonly<{
      ok: true;
      tracks: readonly Track[];
    }>
  | Readonly<{
      ok: false;
      error: string;
    }>;

export const parseGpxTracks = (rootElement: Element): GpxTracksParseResult => {
  const trackPointElements = Array.from(rootElement.getElementsByTagNameNS('*', 'trkpt'));

  const hasMissingCoordinates = trackPointElements.some(pointElement => {
    return !pointElement.hasAttribute('lat') || !pointElement.hasAttribute('lon');
  });

  if (hasMissingCoordinates) {
    return {
      ok: false,
      error: 'A track point is missing its coordinates.'
    };
  }

  const hasInvalidCoordinates = trackPointElements.some(pointElement => {
    const latitude = Number(pointElement.getAttribute('lat'));
    const longitude = Number(pointElement.getAttribute('lon'));

    return (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    );
  });

  if (hasInvalidCoordinates) {
    return {
      ok: false,
      error: 'A track point contains invalid coordinates.'
    };
  }

  const hasInvalidElevation = trackPointElements.some(pointElement => {
    const elevationElement = findDirectChildren(pointElement, 'ele')[0];

    if (!elevationElement) {
      return false;
    }

    const elevationText = elevationElement.textContent?.trim();

    return !elevationText || !Number.isFinite(Number(elevationText));
  });

  if (hasInvalidElevation) {
    return {
      ok: false,
      error: 'A track point contains an invalid elevation.'
    };
  }

  const tracks = findDirectChildren(rootElement, 'trk').map((trackElement, trackIndex) => {
    const description = findDirectChildText(trackElement, 'desc');
    const name = findDirectChildText(trackElement, 'name');

    const segments: TrackSegment[] = findDirectChildren(trackElement, 'trkseg').map(
      (segmentElement, segmentIndex) => {
        const segmentId = `track-${trackIndex}-segment-${segmentIndex}`;

        const samples: GeographicSample[] = findDirectChildren(segmentElement, 'trkpt').map(
          (pointElement, sampleIndex) => {
            const elevationElement = findDirectChildren(pointElement, 'ele')[0];

            return {
              id: `${segmentId}-sample-${sampleIndex}`,
              latitudeDegrees: Number(pointElement.getAttribute('lat')),
              longitudeDegrees: Number(pointElement.getAttribute('lon')),
              ...(elevationElement
                ? { elevationMetres: Number(elevationElement.textContent) }
                : {})
            };
          }
        );

        return {
          id: segmentId,
          samples
        };
      }
    );

    return {
      ...(description ? { description } : {}),
      id: `track-${trackIndex}`,
      ...(name ? { name } : {}),
      segments
    };
  });

  return {
    ok: true,
    tracks
  };
};
