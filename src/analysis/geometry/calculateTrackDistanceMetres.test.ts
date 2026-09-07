import type { TrackSegment } from '@/domain/activityDocument';

import { calculateTrackDistanceMetres } from './calculateTrackDistanceMetres';

describe('calculateTrackDistanceMetres', () => {
  it('calculates distance in metres between samples in a segment', () => {
    const segments: readonly TrackSegment[] = [
      {
        id: 'segment-0',
        samples: [
          {
            id: 'sample-0',
            latitudeDegrees: 0,
            longitudeDegrees: 0
          },
          {
            id: 'sample-1',
            latitudeDegrees: 0,
            longitudeDegrees: 1
          }
        ]
      }
    ];

    expect(calculateTrackDistanceMetres(segments)).toBeCloseTo(111_195, 0);
  });

  it('does not calculate distance across separate segments', () => {
    const segments: readonly TrackSegment[] = [
      {
        id: 'segment-0',
        samples: [
          {
            id: 'sample-0',
            latitudeDegrees: 0,
            longitudeDegrees: 0
          }
        ]
      },
      {
        id: 'segment-1',
        samples: [
          {
            id: 'sample-1',
            latitudeDegrees: 0,
            longitudeDegrees: 1
          }
        ]
      }
    ];

    expect(calculateTrackDistanceMetres(segments)).toBe(0);
  });
});
