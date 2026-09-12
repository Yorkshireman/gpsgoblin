import type { MeasurementPoint } from './analyseMeasurements';

export const SPEED_AVERAGE_SECONDS = 60;

// A trailing, time-weighted view. Source measurements and totals remain untouched.
export const averageSpeeds = (points: readonly MeasurementPoint[], windowSeconds: number) => {
  if (windowSeconds <= 0) {
    return points.map(point => {
      return point.speedMetresPerSecond;
    });
  }
  let intervals: { seconds: number; distance: number; speed: number }[] = [];
  let start = 0;
  let seconds = 0;
  let distance = 0;
  let movingIntervals = 0;
  let segmentId: string | undefined;
  return points.map(point => {
    const speed = point.speedMetresPerSecond;
    const duration = point.intervalSeconds;
    if (point.segmentId !== segmentId || speed === null || duration === null) {
      intervals = [];
      start = 0;
      seconds = 0;
      distance = 0;
      movingIntervals = 0;
    }
    segmentId = point.segmentId;
    if (speed === null || duration === null) {
      return null;
    }
    intervals.push({ seconds: duration, distance: speed * duration, speed });
    seconds += duration;
    distance += speed * duration;
    if (speed > 0) movingIntervals += 1;
    while (seconds - intervals[start].seconds >= windowSeconds) {
      seconds -= intervals[start].seconds;
      distance -= intervals[start].distance;
      if (intervals[start].speed > 0) movingIntervals -= 1;
      start += 1;
    }
    // Subtracting expired distances can leave floating-point residue. A window
    // containing only exact zero-speed intervals has exactly zero distance.
    if (movingIntervals === 0) distance = 0;
    const excess = Math.max(0, seconds - windowSeconds);
    return (
      Math.max(0, distance - intervals[start].speed * excess) / Math.min(seconds, windowSeconds)
    );
  });
};
