import type { MeasurementPoint } from '@/analysis/measurements';

export type DisplayUnits = 'metric' | 'imperial';
export type MotionDisplay = 'speed' | 'pace';

export const displayUnits = (units: DisplayUnits) => {
  return units === 'metric'
    ? {
        distance: 'km',
        metresPerDistance: 1000,
        elevation: 'm',
        metresPerElevation: 1,
        speed: 'km/h',
        pace: 'min/km'
      }
    : {
        distance: 'mi',
        metresPerDistance: 1609.344,
        elevation: 'ft',
        metresPerElevation: 0.3048,
        speed: 'mph',
        pace: 'min/mi'
      };
};

export const motionValue = (speed: number | null, units: DisplayUnits, motion: MotionDisplay) => {
  if (speed === null) {
    return null;
  }
  const { metresPerDistance } = displayUnits(units);
  return motion === 'speed'
    ? (speed * 3600) / metresPerDistance
    : speed > 0
      ? metresPerDistance / speed / 60
      : null;
};

export const formatMeasurement = (value: number | null, unit: string) => {
  return value === null ? 'Unavailable' : `${value.toFixed(1)} ${unit}`;
};

export type ChartMeasurement = Readonly<{
  sampleId: string | null;
  distance: number;
  elevation: number | null;
  motion: number | null;
}>;

// Display conversion stays separate from full-resolution calculations. No downsampling yet.
export const chartMeasurements = (
  points: readonly MeasurementPoint[],
  units: DisplayUnits,
  motion: MotionDisplay
) => {
  const labels = displayUnits(units);
  const data: ChartMeasurement[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (index > 0 && point.segmentId !== points[index - 1].segmentId) {
      data.push({
        sampleId: null,
        distance: point.distanceMetres / labels.metresPerDistance,
        elevation: null,
        motion: null
      });
    }
    data.push({
      sampleId: point.sample.id,
      distance: point.distanceMetres / labels.metresPerDistance,
      elevation:
        point.elevationMetres === null ? null : point.elevationMetres / labels.metresPerElevation,
      motion: motionValue(point.speedMetresPerSecond, units, motion)
    });
  }
  return data;
};
