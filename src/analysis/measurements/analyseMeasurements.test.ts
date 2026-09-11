import { analyseMeasurements } from '.';

describe('analyseMeasurements', () => {
  it('time-weights overall speed, includes stops and excludes untimed distance and segment gaps', () => {
    const result = analyseMeasurements([
      {
        id: 'a',
        samples: [
          { id: 'a0', latitudeDegrees: 0, longitudeDegrees: 0, sourceTime: '2026-09-11T12:00:00Z' },
          {
            id: 'a1',
            latitudeDegrees: 0,
            longitudeDegrees: 0.001,
            sourceTime: '2026-09-11T12:00:10Z'
          },
          {
            id: 'a2',
            latitudeDegrees: 0,
            longitudeDegrees: 0.001,
            sourceTime: '2026-09-11T12:00:40Z'
          },
          { id: 'a3', latitudeDegrees: 0, longitudeDegrees: 1 }
        ]
      },
      {
        id: 'b',
        samples: [
          { id: 'b0', latitudeDegrees: 0, longitudeDegrees: 2, sourceTime: '2026-09-12T12:00:00Z' },
          {
            id: 'b1',
            latitudeDegrees: 0,
            longitudeDegrees: 2.001,
            sourceTime: '2026-09-12T12:00:10Z'
          }
        ]
      }
    ]);
    // Two 111.195 m movements and a 30-second stop: 222.39 metres / 50 seconds.
    expect(result.averageSpeedMetresPerSecond).toBeCloseTo(4.4478032, 6);
    expect(result.elapsedDurationSeconds).toBe(86410);
    expect(result.timedDurationSeconds).toBe(50);
  });
  it('does not double-count overlapping time after the clock moves backwards', () => {
    const times = ['00', '10', '05', '08', '15', '20'];
    const samples = times.map((seconds, index) => {
      return {
        id: String(index),
        latitudeDegrees: 0,
        longitudeDegrees: 0,
        sourceTime: `2026-09-11T12:00:${seconds}Z`
      };
    });
    const result = analyseMeasurements([{ id: 'segment', samples }]);
    expect(result.timedDurationSeconds).toBe(15);
    expect(result.averageSpeedMetresPerSecond).toBe(0);
    expect(
      result.points.map(point => {
        return point.speedMetresPerSecond;
      })
    ).toEqual([null, 0, null, null, null, 0]);
    expect(
      result.points.map(point => {
        return point.sample;
      })
    ).toEqual(samples);
  });

  it('preserves segment and missing-measurement gaps without counting time between segments', () => {
    const result = analyseMeasurements([
      {
        id: 'first',
        samples: [
          {
            id: 'a',
            latitudeDegrees: 0,
            longitudeDegrees: 0,
            elevationMetres: 0,
            sourceTime: '2026-09-11T12:00:00Z'
          },
          {
            id: 'b',
            latitudeDegrees: 0,
            longitudeDegrees: 0,
            sourceTime: '2026-09-11T13:01:00+01:00'
          }
        ]
      },
      {
        id: 'second',
        samples: [
          {
            id: 'c',
            latitudeDegrees: 1,
            longitudeDegrees: 1,
            elevationMetres: NaN,
            sourceTime: '2026-09-12T12:00:00Z'
          }
        ]
      }
    ]);
    expect(result.timedDurationSeconds).toBe(60);
    expect(result.elapsedDurationSeconds).toBe(86400);
    expect(result.distanceMetres).toBe(0);
    expect(
      result.points.map(point => {
        return point.speedMetresPerSecond;
      })
    ).toEqual([null, 0, null]);
    expect(
      result.points.map(point => {
        return point.elevationMetres;
      })
    ).toEqual([0, null, null]);
    expect(result.warnings.join(' ')).toContain('invalid elevation');
  });

  it.each([
    ['2026-09-11T12:00:00', 'unknown timezone'],
    ['2026-02-30T12:00:00Z', 'invalid timestamp'],
    ['not a time', 'invalid timestamp'],
    ['', 'invalid timestamp'],
    [undefined, 'missing timestamp'],
    ['2026-09-11T11:00:00Z', 'duplicate timestamp'],
    ['2026-09-11T10:00:00Z', 'backwards timestamp']
  ])('leaves an unusable interval null for %s and explains %s', (sourceTime, warning) => {
    const result = analyseMeasurements([
      {
        id: 'segment',
        samples: [
          { id: 'a', latitudeDegrees: 0, longitudeDegrees: 0, sourceTime: '2026-09-11T11:00:00Z' },
          { id: 'b', latitudeDegrees: 0, longitudeDegrees: 1, sourceTime }
        ]
      }
    ]);
    expect(result.timedDurationSeconds).toBeNull();
    expect(result.averageSpeedMetresPerSecond).toBeNull();
    expect(result.points[1].speedMetresPerSecond).toBeNull();
    expect(result.warnings.join(' ')).toContain(warning);
  });

  it('calculates duration and interval speed from full-resolution points, retaining zero elevation', () => {
    const result = analyseMeasurements([
      {
        id: 'segment',
        samples: [
          {
            id: 'a',
            latitudeDegrees: 0,
            longitudeDegrees: 0,
            elevationMetres: 0,
            sourceTime: '2026-09-11T12:00:00Z'
          },
          {
            id: 'b',
            latitudeDegrees: 0,
            longitudeDegrees: 1,
            elevationMetres: 100,
            sourceTime: '2026-09-11T13:00:00Z'
          }
        ]
      }
    ]);
    expect(result.timedDurationSeconds).toBe(3600);
    expect(result.elapsedDurationSeconds).toBe(3600);
    expect(result.timedIntervalCount).toBe(1);
    expect(result.distanceMetres).toBeCloseTo(111195.08, 2);
    expect(result.points[1].speedMetresPerSecond).toBeCloseTo(30.88752, 5);
    expect(
      result.points.map(point => {
        return point.elevationMetres;
      })
    ).toEqual([0, 100]);
    expect(result.warnings).toEqual([]);
  });

  it.each([
    [undefined, '2026-09-11T12:01:00Z', null],
    ['2026-09-11T12:00:00Z', undefined, null],
    ['invalid', '2026-09-11T12:01:00Z', null],
    ['2026-09-11T12:00:00Z', '2026-09-11T12:01:00', null],
    ['2026-09-11T12:00:00Z', '2026-09-11T11:59:00Z', null],
    ['2026-09-11T12:00:00Z', '2026-09-11T12:00:00Z', 0]
  ])('uses the actual endpoints for Duration: %s to %s', (start, finish, expected) => {
    const samples = [start, '2026-09-11T12:00:30Z', finish].map((sourceTime, index) => {
      return { id: String(index), latitudeDegrees: 0, longitudeDegrees: 0, sourceTime };
    });
    expect(analyseMeasurements([{ id: 'segment', samples }]).elapsedDurationSeconds).toBe(expected);
  });

  it('leaves Duration unavailable with fewer than two points', () => {
    expect(analyseMeasurements([]).elapsedDurationSeconds).toBeNull();
    expect(
      analyseMeasurements([
        {
          id: 'segment',
          samples: [
            {
              id: 'point',
              latitudeDegrees: 0,
              longitudeDegrees: 0,
              sourceTime: '2026-09-11T12:00:00Z'
            }
          ]
        }
      ]).elapsedDurationSeconds
    ).toBeNull();
  });
});
