import type { MeasurementPoint } from './analyseMeasurements';

// Conservative observation-gap policy, documented in docs/recording-gap-investigation.md.
// Classify once before display projection; no distance/speed threshold implies a stop.
const median = (values: number[]) => {
  values.sort((a, b) => { return a - b; });
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
};

export const findRecordingGaps = (points: readonly MeasurementPoint[]) => {
  const gaps: number[] = [];
  let start = 0;
  while (start < points.length) {
    if (points[start].intervalSeconds === null) { start += 1; continue; }
    let end = start + 1;
    while (end < points.length && points[end].segmentId === points[start].segmentId && points[end].intervalSeconds !== null) end += 1;
    for (let index = start; index < end; index += 1) {
      const duration = points[index].intervalSeconds ?? 0;
      if (duration <= 120) continue;
      const sides = [points.slice(Math.max(start, index - 20), index), points.slice(index + 1, Math.min(end, index + 21))]
        .filter(side => { return side.length > 0; });
      if (!sides.length || sides.some(side => { return side.length < 5; })) continue;
      const reference = Math.max(...sides.map(side => {
        return median(side.map(point => { return point.intervalSeconds ?? 0; }));
      }));
      if (duration > reference * 10) gaps.push(index);
    }
    start = end;
  }
  return gaps;
};
