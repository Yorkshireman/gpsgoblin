import { analyseMeasurements, averageSpeeds } from '.';
import type { MeasurementPoint } from '.';

const point = (id: string, speed: number | null, seconds: number | null): MeasurementPoint => {
  return {
    sample: { id, latitudeDegrees: 0, longitudeDegrees: 0 },
    segmentId: 'a',
    distanceMetres: 0,
    elevationMetres: null,
    speedMetresPerSecond: speed,
    intervalSeconds: seconds
  };
};

describe('averageSpeeds', () => {
  it('returns exact zero after movement leaves a stationary window without discarding tiny movement', () => {
    const points = [point('a', 0.1, 1), point('b', 0.2, 1), point('c', 0, 1), point('d', 1e-14, 1)];
    const speeds = averageSpeeds(points, 1);
    expect(speeds[2]).toBe(0);
    expect(speeds[3]).toBe(1e-14);
  });

  it('shows sustained speed changes with a five-minute window', () => {
    const points = [point('a', 2, 150), point('b', 6, 150), point('c', 6, 150)];
    expect(averageSpeeds(points, 300)).toEqual([2, 4, 6]);
    expect(averageSpeeds(points, 120)).toEqual([2, 6, 6]);
  });
  it('lets longer windows soften changes and zero seconds restore recorded intervals', () => {
    const points = [point('a', 2, 15), point('b', 8, 15)];
    expect(averageSpeeds(points, 30)).toEqual([2, 5]);
    expect(averageSpeeds(points, 15)).toEqual([2, 8]);
    expect(averageSpeeds(points, 0)).toEqual([2, 8]);
  });
  it('weights irregular intervals by time and clips the window to the preceding 15 seconds', () => {
    const points = [point('a', 2, 10), point('b', 8, 5), point('c', 4, 10)];
    expect(averageSpeeds(points, 15)).toEqual([2, 4, 16 / 3]);
    expect(
      points.map(value => {
        return value.speedMetresPerSecond;
      })
    ).toEqual([2, 8, 4]);
  });

  it('keeps missing time and segment gaps, and includes genuine stops', () => {
    const points = [
      point('a', 6, 15),
      point('b', 0, 15),
      point('c', null, null),
      point('d', 2, 5),
      { ...point('e', 10, 5), segmentId: 'b' }
    ];
    expect(averageSpeeds(points, 15)).toEqual([6, 0, null, 2, 10]);
  });

  it('uses the same validated timing as the full-resolution analysis', () => {
    const result = analyseMeasurements([
      {
        id: 'track',
        samples: [
          {
            id: 'a',
            latitudeDegrees: 0,
            longitudeDegrees: 0,
            sourceTime: '2026-09-11T12:00:00Z'
          },
          {
            id: 'b',
            latitudeDegrees: 0,
            longitudeDegrees: 0,
            sourceTime: '2026-09-11T12:00:05Z'
          },
          {
            id: 'c',
            latitudeDegrees: 0,
            longitudeDegrees: 0,
            sourceTime: '2026-09-11T12:00:04Z'
          }
        ]
      }
    ]);
    expect(
      result.points.map(value => {
        return value.intervalSeconds;
      })
    ).toEqual([null, 5, null]);
    expect(averageSpeeds(result.points, 15)).toEqual([null, 0, null]);
  });
});
