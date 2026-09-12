import type { analyseMeasurements } from '@/analysis/measurements';

export type MeasurementViewRequest = Readonly<{
  entityId: string;
  segmentId?: string;
  units: 'metric' | 'imperial';
  motion: 'speed' | 'pace';
  smoothingSeconds: number;
  // Initial views include analysis by default; settings-only updates can reuse it.
  includeAnalysis?: boolean;
}>;

export type MeasurementSummary = Omit<ReturnType<typeof analyseMeasurements>, 'points'>;

export type PackedMeasurementAnalysis = Readonly<{
  summary: MeasurementSummary;
  // Four columns per original sample: distance m, elevation m, speed m/s, interval s.
  // NaN means unavailable. Each returned buffer belongs to this result and can be transferred.
  metrics: Float64Array;
  timeIssues: readonly Readonly<{ index: number; issue: string }>[];
}>;

export type PackedMeasurementView = Readonly<{
  analysis?: PackedMeasurementAnalysis;
  // Three columns per original sample: displayed distance, elevation and motion.
  // Segment gaps are inserted by the presentation adapter, never added to source samples.
  display: Float64Array;
}>;
