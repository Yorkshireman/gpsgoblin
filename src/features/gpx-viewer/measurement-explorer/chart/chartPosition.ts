import type { ChartMeasurement } from '../../measurementDisplay';

export const chartPosition = (point: ChartMeasurement) => {
  return point.position ?? point.distance;
};
