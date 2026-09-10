import type { GeographicSample, Track, TrackSegment } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';
import { validateGpxPoints } from './validateGpxPoints';
import { readGpxSample } from './readGpxPoint';

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
  const validationResult = validateGpxPoints(trackPointElements, 'track point');

  if (!validationResult.ok) {
    return validationResult;
  }

  const tracks = findDirectChildren(rootElement, 'trk').map((trackElement, trackIndex) => {
    const description = findDirectChildText(trackElement, 'desc');
    const name = findDirectChildText(trackElement, 'name');

    const segments: TrackSegment[] = findDirectChildren(trackElement, 'trkseg').map(
      (segmentElement, segmentIndex) => {
        const segmentId = `track-${trackIndex}-segment-${segmentIndex}`;

        const samples: GeographicSample[] = findDirectChildren(segmentElement, 'trkpt').map(
          (pointElement, sampleIndex) => {
            return readGpxSample(pointElement, `${segmentId}-sample-${sampleIndex}`);
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
