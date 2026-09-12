import type { ChartMeasurement } from '../../measurementDisplay';

const metrics = ['motion', 'elevation'] as const;

// Select original measurements in distance buckets about one CSS pixel wide.
// Boundaries are mandatory, so fragmented recordings may retain more points.
// This is a display projection, never a limit on imported or analysed samples.
export const downsampleChart = (data: ChartMeasurement[], width: number) => {
  if (width <= 0) return [];
  if (data.length <= width) return data;
  const start = data[0].distance;
  const span = data[data.length - 1].distance - start;
  const retained = new Set<number>();
  const minima = { motion: -1, elevation: -1 };
  const maxima = { motion: -1, elevation: -1 };
  let bucket = -1;
  let first = 0;
  let last = 0;
  const flush = () => {
    retained.add(first);
    retained.add(last);
    for (const metric of metrics) {
      if (minima[metric] >= 0) retained.add(minima[metric]);
      if (maxima[metric] >= 0) retained.add(maxima[metric]);
      minima[metric] = -1;
      maxima[metric] = -1;
    }
    return;
  };
  for (let index = 0; index < data.length; index += 1) {
    const point = data[index];
    const previous = data[index - 1];
    const beginsFragment = previous && (
      point.sampleId === null || previous.sampleId === null ||
      point.zeroSpeed !== previous.zeroSpeed ||
      metrics.some(metric => {
        return (point[metric] === null) !== (previous[metric] === null);
      })
    );
    const nextBucket = span > 0 ? Math.floor(((point.distance - start) / span) * width) : 0;
    // Separate fragments must not erase each other's peaks within one pixel.
    if (nextBucket !== bucket || beginsFragment) {
      if (bucket >= 0) flush();
      bucket = nextBucket;
      first = index;
    }
    last = index;
    for (const metric of metrics) {
      const value = point[metric];
      if (value !== null) {
        const minimum = data[minima[metric]]?.[metric];
        const maximum = data[maxima[metric]]?.[metric];
        if (minimum == null || value < minimum) minima[metric] = index;
        if (maximum == null || value > maximum) maxima[metric] = index;
      }
    }
  }
  flush();
  return Array.from(retained)
    .sort((left, right) => {
      return left - right;
    })
    .map(index => {
      return data[index];
    });
};
