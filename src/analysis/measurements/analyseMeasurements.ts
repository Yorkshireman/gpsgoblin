import type { GeographicSample, TrackSegment } from '@/domain/activityDocument';
import { calculatePathDistanceMetres } from '../geometry/calculateTrackDistanceMetres';
import { readTimestamp } from './readTimestamp';

export type MeasurementPoint = Readonly<{
  sample: GeographicSample;
  segmentId: string;
  distanceMetres: number;
  elevationMetres: number | null;
  speedMetresPerSecond: number | null;
  intervalSeconds: number | null;
  timeIssue?: string;
}>;

export type MeasurementAnalysis = Readonly<{
  points: readonly MeasurementPoint[];
  distanceMetres: number;
  timedDurationSeconds: number | null;
  averageSpeedMetresPerSecond: number | null;
  timedIntervalCount: number;
  intervalCount: number;
  warnings: readonly string[];
}>;

export const analyseMeasurements = (segments: readonly TrackSegment[]): MeasurementAnalysis => {
  const points: MeasurementPoint[] = [];
  let distanceMetres = 0;
  let durationSeconds = 0;
  let timedDistanceMetres = 0;
  let timedIntervalCount = 0;
  let intervalCount = 0;
  const issueCounts = new Map<string, number>();

  for (const segment of segments) {
    let previousTime: number | null = null;
    let latestTime: number | null = null;
    for (let index = 0; index < segment.samples.length; index += 1) {
      const sample = segment.samples[index];
      const previous = segment.samples[index - 1];
      let speedMetresPerSecond: number | null = null;
      let intervalSeconds: number | null = null;
      const timestamp = readTimestamp(sample.sourceTime);
      let timeIssue = timestamp.issue;
      if (
        timestamp.milliseconds !== null &&
        latestTime !== null &&
        timestamp.milliseconds <= latestTime
      ) {
        timeIssue =
          timestamp.milliseconds === latestTime ? 'duplicate timestamp' : 'backwards timestamp';
      }
      if (previous) {
        intervalCount += 1;
        const distance = calculatePathDistanceMetres([previous, sample]);
        distanceMetres += distance;
        if (!timeIssue && timestamp.milliseconds !== null && previousTime !== null) {
          const seconds = (timestamp.milliseconds - previousTime) / 1000;
          if (seconds > 0) {
            durationSeconds += seconds;
            timedDistanceMetres += distance;
            timedIntervalCount += 1;
            speedMetresPerSecond = distance / seconds;
            intervalSeconds = seconds;
          }
        }
      }
      previousTime = timeIssue ? null : timestamp.milliseconds;
      if (previousTime !== null) {
        latestTime = previousTime;
      }
      if (timeIssue) {
        issueCounts.set(timeIssue, (issueCounts.get(timeIssue) ?? 0) + 1);
      }
      const elevationMetres = Number.isFinite(sample.elevationMetres)
        ? (sample.elevationMetres ?? null)
        : null;
      if (sample.elevationMetres !== undefined && elevationMetres === null) {
        issueCounts.set('invalid elevation', (issueCounts.get('invalid elevation') ?? 0) + 1);
      }
      points.push({
        sample,
        segmentId: segment.id,
        distanceMetres,
        elevationMetres,
        speedMetresPerSecond,
        intervalSeconds,
        timeIssue
      });
    }
  }
  return {
    points,
    distanceMetres,
    timedDurationSeconds: timedIntervalCount ? durationSeconds : null,
    averageSpeedMetresPerSecond: timedIntervalCount ? timedDistanceMetres / durationSeconds : null,
    timedIntervalCount,
    intervalCount,
    warnings: Array.from(issueCounts, ([issue, count]) => {
      if (issue === 'invalid elevation') {
        return `${count} point(s): invalid elevation. These values are unavailable in elevation results.`;
      }
      return `${count} point(s): ${issue}. Affected intervals are excluded from timing and speed.`;
    })
  };
};
