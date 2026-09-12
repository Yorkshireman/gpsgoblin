import { analyseMeasurements, averageSpeeds, readTimestamp, summariseMeasurements } from '@/analysis/measurements';
import type { ImportedGpxDocument, TrackSegment } from '@/domain/activityDocument';
import type { MeasurementSummary, MeasurementViewRequest, PackedMeasurementView, PackedMeasurementAnalysis } from './measurementView';

type SegmentRange = Readonly<{
  id: string;
  start: number;
  end: number;
  summary: MeasurementSummary;
}>;

type PreparedEntity = Readonly<{
  metrics: Float64Array;
  summary: MeasurementSummary;
  segments: readonly SegmentRange[];
  timeIssues: PackedMeasurementAnalysis['timeIssues'];
}>;

const prepareEntity = (segments: readonly TrackSegment[]): PreparedEntity => {
  const { points, ...summary } = analyseMeasurements(segments);
  const metrics = new Float64Array(points.length * 4);
  const timeIssues: { index: number; issue: string }[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    metrics[index * 4] = point.distanceMetres;
    metrics[index * 4 + 1] = point.elevationMetres ?? NaN;
    metrics[index * 4 + 2] = point.speedMetresPerSecond ?? NaN;
    metrics[index * 4 + 3] = point.intervalSeconds ?? NaN;
    if (point.timeIssue) timeIssues.push({ index, issue: point.timeIssue });
  }
  let start = 0;
  const ranges = segments.map(segment => {
    const end = start + segment.samples.length;
    const counts = new Map<string, number>();
    let timedDuration = 0;
    let timedDistance = 0;
    let timedIntervals = 0;
    for (let index = start; index < end; index += 1) {
      const point = points[index];
      if (point.timeIssue) counts.set(point.timeIssue, (counts.get(point.timeIssue) ?? 0) + 1);
      if (point.sample.elevationMetres !== undefined && point.elevationMetres === null) {
        counts.set('invalid elevation', (counts.get('invalid elevation') ?? 0) + 1);
      }
      if (point.intervalSeconds !== null && point.speedMetresPerSecond !== null) {
        timedDuration += point.intervalSeconds;
        timedDistance += point.speedMetresPerSecond * point.intervalSeconds;
        timedIntervals += 1;
      }
    }
    const firstTime = readTimestamp(segment.samples[0]?.sourceTime).milliseconds;
    const lastTime = readTimestamp(segment.samples.at(-1)?.sourceTime).milliseconds;
    const segmentSummary = summariseMeasurements({
      distanceMetres: end > start ? points[end - 1].distanceMetres - points[start].distanceMetres : 0,
      pointCount: end - start,
      startMilliseconds: firstTime,
      finishMilliseconds: lastTime,
      durationSeconds: timedDuration,
      timedDistanceMetres: timedDistance,
      timedIntervalCount: timedIntervals,
      intervalCount: Math.max(0, end - start - 1),
      issueCounts: counts
    });
    const range = { id: segment.id, start, end, summary: segmentSummary };
    start = end;
    return range;
  });
  return { metrics, summary, segments: ranges, timeIssues };
};

const prepareEntities = (document: ImportedGpxDocument) => {
  const entities = new Map<string, PreparedEntity>();
  for (const track of document.tracks) entities.set(track.id, prepareEntity(track.segments));
  for (const route of document.routes) entities.set(route.id, prepareEntity([{ id: route.id, samples: route.points }]));
  return entities;
};

const speedIntervals = (entity: PreparedEntity, start: number, end: number) => {
  return {
    [Symbol.iterator]: () => {
      let index = start;
      let segmentIndex = 0;
      return {
        next: () => {
          if (index >= end) return { done: true as const, value: undefined };
          while (entity.segments[segmentIndex].end <= index) segmentIndex += 1;
          const speed = entity.metrics[index * 4 + 2];
          const seconds = entity.metrics[index * 4 + 3];
          const value = {
            segmentId: entity.segments[segmentIndex].id,
            speedMetresPerSecond: Number.isNaN(speed) ? null : speed,
            intervalSeconds: Number.isNaN(seconds) ? null : seconds
          };
          index += 1;
          return { done: false as const, value };
        }
      };
    }
  };
};

export const createMeasurementStore = (document: ImportedGpxDocument) => {
  // Only compact derived columns and metadata survive this call. Source objects,
  // original XML and timestamp strings belong to the canonical document on the page.
  const entities = prepareEntities(document);
  return {
    prepareView: (request: MeasurementViewRequest): PackedMeasurementView => {
      const entity = entities.get(request.entityId);
      if (!entity) throw new Error('The selected activity is unavailable.');
      const segment = request.segmentId === undefined ? undefined : entity.segments.find(candidate => {
        return candidate.id === request.segmentId;
      });
      if (request.segmentId !== undefined && !segment) throw new Error('The selected segment is unavailable.');
      const start = segment?.start ?? 0;
      const end = segment?.end ?? entity.metrics.length / 4;
      const distanceOffset = segment && end > start ? entity.metrics[start * 4] : 0;
      const speeds = averageSpeeds(speedIntervals(entity, start, end), request.smoothingSeconds);
      const metresPerDistance = request.units === 'metric' ? 1000 : 1609.344;
      const metresPerElevation = request.units === 'metric' ? 1 : 0.3048;
      const display = new Float64Array((end - start) * 3);
      for (let index = 0; index < end - start; index += 1) {
        const speed = speeds[index];
        display[index * 3] = (entity.metrics[(start + index) * 4] - distanceOffset) / metresPerDistance;
        display[index * 3 + 1] = entity.metrics[(start + index) * 4 + 1] / metresPerElevation;
        display[index * 3 + 2] = speed === null ? NaN : request.motion === 'speed'
          ? speed * 3600 / metresPerDistance
          : speed > 0 ? metresPerDistance / speed / 60 : NaN;
      }
      if (request.includeAnalysis === false) return { display };
      const metrics = entity.metrics.slice(start * 4, end * 4);
      if (distanceOffset) {
        for (let index = 0; index < end - start; index += 1) metrics[index * 4] -= distanceOffset;
      }
      return {
        analysis: {
          summary: segment?.summary ?? entity.summary,
          metrics,
          timeIssues: entity.timeIssues.filter(item => {
            return item.index >= start && item.index < end;
          }).map(item => {
            return { index: item.index - start, issue: item.issue };
          })
        },
        display
      };
    }
  };
};
