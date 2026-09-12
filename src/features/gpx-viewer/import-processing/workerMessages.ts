import type { GpxParseResult } from '@/domain/activityDocument';

export type ImportRequest = Readonly<{ requestId: number; file: File }>;
export type ImportResponse = Readonly<{ requestId: number; result: GpxParseResult }>;
