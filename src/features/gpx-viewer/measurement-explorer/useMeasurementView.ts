import { useEffect, useMemo, useRef, useState } from 'react';
import type { analyseMeasurements, MeasurementPoint } from '@/analysis/measurements';
import type { MeasurementViewRequest, PackedMeasurementView, PackedMeasurementAnalysis } from '@/analysis/prepared-measurements';
import type { TrackSegment } from '@/domain/activityDocument';
import type { MeasurementSession } from '../import-processing';
import type { ChartMeasurement } from '../measurementDisplay';

type Analysis = ReturnType<typeof analyseMeasurements>;
const nullable = (value: number) => {
  return Number.isNaN(value) ? null : value;
};

const unpackAnalysis = (packed: PackedMeasurementAnalysis, segments: readonly TrackSegment[]): Analysis => {
  const points: MeasurementPoint[] = [];
  const issues = new Map(packed.timeIssues.map(item => { return [item.index, item.issue]; }));
  for (const segment of segments) {
    for (const sample of segment.samples) {
      const index = points.length;
      points.push({ sample, segmentId: segment.id, distanceMetres: packed.metrics[index * 4],
        elevationMetres: nullable(packed.metrics[index * 4 + 1]),
        speedMetresPerSecond: nullable(packed.metrics[index * 4 + 2]),
        intervalSeconds: nullable(packed.metrics[index * 4 + 3]), timeIssue: issues.get(index) });
    }
  }
  return { ...packed.summary, points };
};

const unpackDisplay = (packed: PackedMeasurementView, points: readonly MeasurementPoint[]) => {
  const data: ChartMeasurement[] = [];
  let hasMotion = false;
  let hasElevation = false;
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const distance = packed.display[index * 3];
    if (index > 0 && point.segmentId !== points[index - 1].segmentId) {
      data.push({ sampleId: null, distance, motion: null, elevation: null });
    }
    const motion = nullable(packed.display[index * 3 + 2]);
    const elevation = nullable(packed.display[index * 3 + 1]);
    hasMotion ||= motion !== null;
    hasElevation ||= elevation !== null;
    data.push({ sampleId: point.sample.id, distance, motion, elevation,
      zeroSpeed: point.speedMetresPerSecond === 0 });
  }
  return { data, hasMotion, hasElevation };
};

export const useMeasurementView = (session: MeasurementSession, segments: readonly TrackSegment[], settings: MeasurementViewRequest) => {
  const scope = useMemo(() => { return { session, segments }; }, [session, segments]);
  const receivedAnalysis = useRef<{ scope: typeof scope; analysis: Analysis } | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    scope: typeof scope; settings: MeasurementViewRequest; analysis: Analysis;
    data: ChartMeasurement[]; hasMotion: boolean; hasElevation: boolean;
  }>();
  const [failure, setFailure] = useState<{ scope: typeof scope; settings: MeasurementViewRequest; message: string }>();
  useEffect(() => {
    const controller = new AbortController();
    // Only a successfully received result authorises omitting static columns.
    // An initial request cancelled before delivery leaves the next one complete.
    const includeAnalysis = receivedAnalysis.current?.scope !== scope;
    session.prepareView({ ...settings, includeAnalysis }, controller.signal).then(packed => {
      if (controller.signal.aborted) return;
      let analysis = receivedAnalysis.current?.scope === scope ? receivedAnalysis.current.analysis : undefined;
      if (!analysis) {
        if (!packed.analysis) throw new Error('Measurement details were unavailable. Try again.');
        analysis = unpackAnalysis(packed.analysis, segments);
      }
      receivedAnalysis.current = { scope, analysis };
      setResult({ scope, settings, analysis, ...unpackDisplay(packed, analysis.points) });
    }).catch(error => {
      if (controller.signal.aborted) return;
      setFailure({ scope, settings, message: error instanceof Error ? error.message : 'Measurements could not be updated. Try again.' });
    });
    return () => controller.abort();
  }, [session, segments, settings, scope, attempt]);
  const snapshot = result?.scope === scope ? result : undefined;
  const error = failure?.scope === scope && failure.settings === settings ? failure.message : undefined;
  return {
    snapshot, error, pending: snapshot?.settings !== settings && !error,
    retry: () => { setFailure(undefined); setAttempt(value => { return value + 1; }); return; }
  };
};
