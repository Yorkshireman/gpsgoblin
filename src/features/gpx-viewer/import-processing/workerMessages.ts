import type { GpxParseResult } from '@/domain/activityDocument';
import type { MeasurementViewRequest, PackedMeasurementView } from '@/analysis/prepared-measurements';

export type ImportRequest = Readonly<{ requestId: number; file: File }> |
  Readonly<{ type: 'view'; requestId: number; settings: MeasurementViewRequest }>;
export type ImportResponse = Readonly<{ requestId: number; result: GpxParseResult }> |
  Readonly<{ type: 'view'; requestId: number; ok: true; view: PackedMeasurementView }> |
  Readonly<{ type: 'view'; requestId: number; ok: false; error: string }>;
