import { createMeasurementStore } from '.';
import type { MeasurementViewRequest } from '.';

const completeView = (store: ReturnType<typeof createMeasurementStore>, request: MeasurementViewRequest) => {
  const view = store.prepareView(request);
  if (!view.analysis) throw new Error('Expected initial analysis payload');
  return { ...view.analysis, display: view.display };
};

describe('prepared measurements', () => {
  it('omits unchanged analysis from display-only responses without changing displayed values', () => {
    const store = createMeasurementStore({
      format: 'gpx', version: '1.1', originalContents: '', routes: [], waypoints: [],
      tracks: [{ id: 'track', segments: [{ id: 'segment', samples: [
        { id: 'a', latitudeDegrees: 0, longitudeDegrees: 0, sourceTime: '2026-09-12T12:00:00Z' },
        { id: 'b', latitudeDegrees: 0, longitudeDegrees: 0.001, sourceTime: '2026-09-12T12:00:10Z' }
      ] }] }]
    });
    const view = store.prepareView({ entityId: 'track', units: 'metric', motion: 'speed', smoothingSeconds: 60, includeAnalysis: false });
    expect(view).toEqual({ display: new Float64Array([0, NaN, NaN, 0.11119508023353292, NaN, 40.03022888407185]) });
  });

  it('keeps complete measurements and calculates time-weighted display values without retaining returned buffers', () => {
    const store = createMeasurementStore({
      format: 'gpx',
      version: '1.1',
      originalContents: '<gpx/>',
      routes: [],
      waypoints: [],
      tracks: [{
        id: 'track',
        segments: [{
          id: 'segment',
          samples: [
            { id: 'a', latitudeDegrees: 0, longitudeDegrees: 0, elevationMetres: 0, sourceTime: '2026-09-12T12:00:00Z' },
            { id: 'b', latitudeDegrees: 0, longitudeDegrees: 0.001, elevationMetres: 10, sourceTime: '2026-09-12T12:00:10Z' },
            { id: 'c', latitudeDegrees: 0, longitudeDegrees: 0.001, sourceTime: '2026-09-12T12:00:40Z' }
          ]
        }]
      }]
    });
    const speed = completeView(store, { entityId: 'track', units: 'metric', motion: 'speed', smoothingSeconds: 60 });
    expect(speed.metrics.length).toBe(12);
    expect(speed.display.length).toBe(9);
    expect(speed.summary).toMatchObject({
      elapsedDurationSeconds: 40,
      timedDurationSeconds: 40,
      timedIntervalCount: 2,
      intervalCount: 2,
      warnings: []
    });
    expect(speed.summary.distanceMetres).toBeCloseTo(111.19508, 5);
    expect(speed.summary.averageSpeedMetresPerSecond).toBeCloseTo(2.779877, 6);
    expect(speed.metrics[0]).toBe(0);
    expect(speed.metrics[1]).toBe(0);
    expect(speed.metrics[2]).toBeNaN();
    expect(speed.metrics[10]).toBe(0);
    expect(speed.display[8]).toBeCloseTo(10.0075572, 6);
    expect(speed.display[7]).toBeNaN();
    speed.metrics.fill(-1);
    speed.display.fill(-1);
    const pace = completeView(store, { entityId: 'track', units: 'imperial', motion: 'pace', smoothingSeconds: 60 });
    expect(pace.metrics[0]).toBe(0);
    expect(pace.display[4]).toBeCloseTo(32.80839895, 6);
    expect(pace.display[8]).toBeCloseTo(9.6487722, 6);
    expect(pace.summary).toEqual(speed.summary);
  });

  it('resets distance and smoothing for a selected segment and keeps its own warnings and endpoint duration', () => {
    const store = createMeasurementStore({
      format: 'gpx', version: '1.1', originalContents: '', routes: [], waypoints: [],
      tracks: [{ id: 'track', segments: [
        { id: 'empty', samples: [] },
        { id: 'first', samples: [
          { id: 'a', latitudeDegrees: 0, longitudeDegrees: 0 },
          { id: 'b', latitudeDegrees: 0, longitudeDegrees: 1 }
        ] },
        { id: 'second', samples: [
          { id: 'c', latitudeDegrees: 0, longitudeDegrees: 2, sourceTime: '2026-09-12T12:00:00Z' },
          { id: 'd', latitudeDegrees: 0, longitudeDegrees: 2.001, sourceTime: '2026-09-12T12:00:10Z' },
          { id: 'e', latitudeDegrees: 0, longitudeDegrees: 2.002, sourceTime: '2026-09-12T12:00:05Z', elevationMetres: NaN }
        ] },
        { id: 'end-empty', samples: [] }
      ] }]
    });
    const selected = completeView(store, { entityId: 'track', segmentId: 'second', units: 'metric', motion: 'speed', smoothingSeconds: 600 });
    expect(selected.summary).toMatchObject({
      elapsedDurationSeconds: 5,
      timedDurationSeconds: 10,
      intervalCount: 2,
      timedIntervalCount: 1,
      warnings: [
        '1 point(s): backwards timestamp. Affected intervals are excluded from speed calculations.',
        '1 point(s): invalid elevation. These values are unavailable in elevation results.'
      ]
    });
    expect(selected.summary.distanceMetres).toBeCloseTo(222.39016, 5);
    expect(selected.metrics[0]).toBe(0);
    expect(selected.metrics[8]).toBeCloseTo(222.39016, 5);
    expect(selected.display[5]).toBeCloseTo(40.0302289, 6);
    expect(selected.display[8]).toBeNaN();
    expect(selected.timeIssues).toEqual([{ index: 2, issue: 'backwards timestamp' }]);
    const all = completeView(store, { entityId: 'track', units: 'metric', motion: 'speed', smoothingSeconds: 600 });
    expect(all.display[8]).toBeNaN();
    expect(all.display[11]).toBeCloseTo(40.0302289, 6);
    expect(all.timeIssues).toEqual([
      { index: 0, issue: 'missing timestamp' },
      { index: 1, issue: 'missing timestamp' },
      { index: 4, issue: 'backwards timestamp' }
    ]);
    const empty = completeView(store, { entityId: 'track', segmentId: 'end-empty', units: 'metric', motion: 'speed', smoothingSeconds: 0 });
    expect(empty.metrics.length).toBe(0);
    expect(empty.display.length).toBe(0);
    expect(empty.summary).toEqual({ distanceMetres: 0, elapsedDurationSeconds: null, timedDurationSeconds: null, averageSpeedMetresPerSecond: null, intervalCount: 0, timedIntervalCount: 0, warnings: [] });
  });

  it('retains prepared route results when the input object changes and leaves exact stationary pace unavailable', () => {
    const route = { id: 'route', points: [
      { id: 'a', latitudeDegrees: 0, longitudeDegrees: 0, sourceTime: '2026-09-12T12:00:00Z' },
      { id: 'b', latitudeDegrees: 0, longitudeDegrees: 0.001, sourceTime: '2026-09-12T12:00:10Z' },
      { id: 'c', latitudeDegrees: 0, longitudeDegrees: 0.001, sourceTime: '2026-09-12T12:00:20Z' }
    ] };
    const store = createMeasurementStore({ format: 'gpx', version: '1.1', originalContents: '', routes: [route], tracks: [], waypoints: [] });
    route.points[1].sourceTime = 'invalid';
    route.points[1].longitudeDegrees = 100;
    const pace = completeView(store, { entityId: 'route', units: 'metric', motion: 'pace', smoothingSeconds: 10 });
    expect(pace.summary.distanceMetres).toBeCloseTo(111.19508, 5);
    expect(pace.display[5]).toBeCloseTo(1.49886727, 6);
    expect(pace.display[8]).toBeNaN();
    expect(pace.metrics[10]).toBe(0);
    expect(pace.timeIssues).toEqual([]);
    expect(() => store.prepareView({ entityId: 'missing', units: 'metric', motion: 'speed', smoothingSeconds: 60 })).toThrow('selected activity');
    expect(() => store.prepareView({ entityId: 'route', segmentId: 'missing', units: 'metric', motion: 'speed', smoothingSeconds: 60 })).toThrow('selected segment');
  });
});
