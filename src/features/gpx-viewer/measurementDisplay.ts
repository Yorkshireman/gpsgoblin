import { readTimestamp } from '@/analysis/measurements';

const recordedTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
  timeZoneName: 'short'
});

export const formatRecordedTime = (source: string | undefined) => {
  const { milliseconds } = readTimestamp(source);
  if (milliseconds === null) {
    return source === '' ? '(empty)' : (source ?? 'Missing');
  }
  return recordedTimeFormatter.format(milliseconds);
};

// Five-second steps up to two minutes, then thirty-second steps up to ten minutes.
export const smoothingDurations = Array.from({ length: 41 }, (_, index) => {
  return index <= 24 ? index * 5 : 120 + (index - 24) * 30;
});

export const formatSmoothingDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (!minutes) {
    return `${seconds} seconds`;
  }
  const minuteLabel = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  return remainder ? `${minuteLabel} ${remainder} seconds` : minuteLabel;
};

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

export const formatMeasurement = (value: number | null, unit: string) => {
  return value === null ? 'Unavailable' : `${value.toFixed(1)} ${unit}`;
};

export const formatChartValue = (value: number, unit: string) => {
  if (unit.startsWith('min/')) {
    const seconds = Math.round(value * 60);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return Number(value.toFixed(1)).toString();
};

export const formatChartMeasurement = (value: number, unit: string) => {
  return `${formatChartValue(value, unit)} ${unit}`;
};

export type ChartMeasurement = Readonly<{
  sampleId: string | null;
  distance: number;
  elevation: number | null;
  motion: number | null;
  zeroSpeed?: boolean;
}>;

export const formatDuration = (seconds: number | null) => {
  if (seconds === null) return 'Unavailable';
  const rounded = Math.round(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainder = rounded % 60;
  return [
    hours ? `${hours} h` : '',
    minutes ? `${minutes} min` : '',
    remainder || !rounded ? `${remainder} s` : ''
  ]
    .filter(Boolean)
    .join(' ');
};
