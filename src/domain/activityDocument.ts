export type GeographicSample = Readonly<{
  elevationMetres?: number;
  id: string;
  latitudeDegrees: number;
  longitudeDegrees: number;
}>;

export type TrackSegment = Readonly<{
  id: string;
  samples: readonly GeographicSample[];
}>;

export type Track = Readonly<{
  id: string;
  name?: string;
  segments: readonly TrackSegment[];
}>;

export type ImportedGpxDocument = Readonly<{
  format: 'gpx';
  originalContents: string;
  tracks: readonly Track[];
  version: '1.1';
}>;

export type GpxParseResult =
  | Readonly<{
      ok: true;
      document: ImportedGpxDocument;
    }>
  | Readonly<{
      ok: false;
      error: string;
    }>;
