import type { analyseMeasurements, StopEvidence } from '@/analysis/measurements';

export type MeasurementViewRequest = Readonly<{
  entityId: string;
  segmentId?: string;
  units: 'metric' | 'imperial';
  motion: 'speed' | 'pace';
  smoothingSeconds: number;
  stopMode?: 'include' | 'exclude';
  confirmedStopIds?: readonly string[];
  // Initial views include analysis by default; settings-only updates can reuse it.
  includeAnalysis?: boolean;
}>;

export type MeasurementSummary = Omit<ReturnType<typeof analyseMeasurements>, 'points'>;

export type PackedMeasurementAnalysis = Readonly<{
  summary: MeasurementSummary;
  // Four columns per original sample: distance m, elevation m, speed m/s, interval s.
  // NaN means unavailable. Each returned buffer belongs to this result and can be transferred.
  metrics: Float64Array;
  recordingGaps?: readonly number[];
  stops: StopEvidence;
  recorded: boolean;
  timeIssues: readonly Readonly<{ index: number; issue: string }>[];
}>;

export type PackedMeasurementView = Readonly<{
  timeSeconds: Float64Array;
  timeAvailable: boolean;
  excludedRanges: readonly Readonly<{ startIndex: number; endIndex: number }>[];
  basis: Readonly<{
    mode: 'include' | 'exclude';
    excludedSeconds: number;
    gapSeconds: number;
    eligibleSeconds: number;
    eligibleDistanceMetres: number;
    averageSpeedMetresPerSecond: number | null;
    partialCoverage: boolean;
  }>;
  suggestedPaceMaximum?: number;
  analysis?: PackedMeasurementAnalysis;
  // Three columns per original sample: displayed distance, elevation and motion.
  // Segment gaps are inserted by the presentation adapter, never added to source samples.
  display: Float64Array;
}>;
