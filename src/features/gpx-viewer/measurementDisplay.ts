import type { MeasurementPoint } from '@/analysis/measurements';
import { averageSpeeds, SPEED_AVERAGE_SECONDS } from '@/analysis/measurements';

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

const motionValue = (speed: number | null, units: DisplayUnits, motion: MotionDisplay) => {
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

export const formatChartValue = (value: number, unit: string) => {
  if (unit.startsWith('min/')) {
    const seconds = Math.round(value * 60);
    if (seconds >= 3600) {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return Number(value.toFixed(1)).toString();
};

export const formatChartMeasurement = (value: number, unit: string) => {
  return `${formatChartValue(value, unit)} ${unit.replace('min/', '/')}`;
};

export type ChartMeasurement = Readonly<{
  sampleId: string | null;
  distance: number;
  elevation: number | null;
  motion: number | null;
  trendSpeed: number | null;
}>;

// Display conversion stays separate from full-resolution calculations. No downsampling yet.
export const chartMeasurements = (
  points: readonly MeasurementPoint[],
  units: DisplayUnits,
  motion: MotionDisplay,
  smoothingSeconds = SPEED_AVERAGE_SECONDS
) => {
  const labels = displayUnits(units);
  const data: ChartMeasurement[] = [];
  const speeds = averageSpeeds(points, smoothingSeconds);
  const trendSpeeds = motion === 'speed' ? averageSpeeds(points, 300) : [];
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    if (index > 0 && point.segmentId !== points[index - 1].segmentId) {
      data.push({
        sampleId: null,
        distance: point.distanceMetres / labels.metresPerDistance,
        elevation: null,
        motion: null,
        trendSpeed: null
      });
    }
    data.push({
      sampleId: point.sample.id,
      distance: point.distanceMetres / labels.metresPerDistance,
      elevation:
        point.elevationMetres === null ? null : point.elevationMetres / labels.metresPerElevation,
      motion: motionValue(speeds[index], units, motion),
      trendSpeed: motionValue(trendSpeeds[index] ?? null, units, 'speed')
    });
  }
  return data;
};
