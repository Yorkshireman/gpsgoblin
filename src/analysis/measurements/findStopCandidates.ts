import type { MeasurementPoint } from './analyseMeasurements';

export type StopCandidate = Readonly<{
  id: string;
  startIndex: number;
  endIndex: number;
  startSampleId: string;
  endSampleId: string;
  seconds: number;
  uncertainty: readonly string[];
}>;

export type StopEvidence = Readonly<{
  candidates: readonly StopCandidate[];
  eligibleSeconds: number;
  eligibleIntervalCount: number;
}>;

// Candidate evidence only: every interval stays included until the person confirms it.
// 60 s / 10 m extent / <=10 s observation spacing: docs/stop-detection-policy.md.
export const findStopCandidates = (points: readonly MeasurementPoint[]): StopEvidence => {
  const coordinates = new Float64Array(points.length * 3);
  const times = new Float64Array(points.length);
  const candidates: StopCandidate[] = [];
  let queues: number[][] = Array.from({ length: 6 }, () => { return []; });
  let heads = Array(6).fill(0);
  let left = 0;
  let eligibleSeconds = 0;
  let eligibleIntervalCount = 0;
  let episodeEnd = -1;
  let best: { start: number; end: number } | undefined;
  const flush = () => {
    if (!best) return;
    const { start, end } = best;
    const uncertainty = ['Slow movement or climbing cannot be ruled out.'];
    let minimum = Infinity;
    let maximum = -Infinity;
    let missing = false;
    for (let index = start; index <= end; index += 1) {
      const elevation = points[index].elevationMetres;
      if (elevation === null) missing = true;
      else { minimum = Math.min(minimum, elevation); maximum = Math.max(maximum, elevation); }
    }
    if (missing) uncertainty.push('Elevation evidence is incomplete.');
    else if (maximum - minimum > 5) uncertainty.push('Elevation changes may be climbing or sensor drift.');
    else uncertainty.push('Flat recorded elevation does not prove a stop.');
    const startSampleId = points[start].sample.id;
    const endSampleId = points[end].sample.id;
    candidates.push({ id: `${startSampleId}:${endSampleId}`, startIndex: start, endIndex: end,
      startSampleId, endSampleId, seconds: times[end] - times[start], uncertainty });
    best = undefined;
    return;
  };
  let previousValid = false;
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const { latitudeDegrees: latitude, longitudeDegrees: longitude } = point.sample;
    const valid = Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
      Number.isFinite(longitude) && Math.abs(longitude) <= 180 && !point.timeIssue;
    const seconds = point.intervalSeconds;
    const continuous = valid && previousValid && index > 0 && point.segmentId === points[index - 1].segmentId &&
      seconds !== null && seconds > 0 && seconds <= 10 && !point.recordingGap;
    if (!continuous) {
      flush();
      left = index;
      episodeEnd = -1;
      queues = Array.from({ length: 6 }, () => { return []; });
      heads = Array(6).fill(0);
    } else {
      eligibleSeconds += seconds;
      eligibleIntervalCount += 1;
    }
    times[index] = continuous ? times[index - 1] + seconds : 0;
    previousValid = valid;
    if (!valid) continue;
    // Earth-centred metres avoid longitude wrap and polar singularities. Bounding
    // box diagonal is a conservative confinement check, never travelled distance.
    const lat = latitude * Math.PI / 180;
    const lon = longitude * Math.PI / 180;
    coordinates[index * 3] = 6371008.8 * Math.cos(lat) * Math.cos(lon);
    coordinates[index * 3 + 1] = 6371008.8 * Math.cos(lat) * Math.sin(lon);
    coordinates[index * 3 + 2] = 6371008.8 * Math.sin(lat);
    for (let queueIndex = 0; queueIndex < 6; queueIndex += 1) {
      const dimension = Math.floor(queueIndex / 2);
      const sign = queueIndex % 2 ? -1 : 1;
      const queue = queues[queueIndex];
      while (queue.length > heads[queueIndex] &&
        coordinates[queue[queue.length - 1] * 3 + dimension] * sign >= coordinates[index * 3 + dimension] * sign) queue.pop();
      queue.push(index);
    }
    const extent = () => {
      return Math.hypot(...[0, 1, 2].map(dimension => {
        return coordinates[queues[dimension * 2 + 1][heads[dimension * 2 + 1]] * 3 + dimension] -
          coordinates[queues[dimension * 2][heads[dimension * 2]] * 3 + dimension];
      }));
    };
    while (extent() > 10 && left < index) {
      left += 1;
      for (let queueIndex = 0; queueIndex < 6; queueIndex += 1) {
        while (queues[queueIndex][heads[queueIndex]] < left) heads[queueIndex] += 1;
      }
    }
    if (times[index] - times[left] < 60) continue;
    // Overlapping candidates form one episode. Keep only its longest confined
    // core, rather than chopping creeping movement into a succession of stops.
    if (left > episodeEnd) flush();
    episodeEnd = index;
    if (!best || times[index] - times[left] > times[best.end] - times[best.start]) best = { start: left, end: index };
  }
  flush();
  return { candidates, eligibleSeconds, eligibleIntervalCount };
};
