export type GeographicSample = Readonly<{
  elevationMetres?: number;
  id: string;
  latitudeDegrees: number;
  longitudeDegrees: number;
}>;

type GpxMetadata = Readonly<{
  description?: string;
  name?: string;
}>;

export type RoutePoint = GeographicSample &
  Readonly<{
    name?: string;
    description?: string;
  }>;

export type Route = Readonly<{
  description?: string;
  id: string;
  name?: string;
  points: readonly RoutePoint[];
}>;

export type TrackSegment = Readonly<{
  id: string;
  samples: readonly GeographicSample[];
}>;

export type Track = Readonly<{
  id: string;
  description?: string;
  name?: string;
  segments: readonly TrackSegment[];
}>;

export type ImportedGpxDocument = Readonly<{
  creator?: string;
  format: 'gpx';
  metadata?: GpxMetadata;
  originalContents: string;
  routes: readonly Route[];
  tracks: readonly Track[];
  version: '1.1';
  waypoints: readonly Waypoint[];
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

export type Waypoint = Readonly<{
  description?: string;
  elevationMetres?: number;
  id: string;
  latitudeDegrees: number;
  longitudeDegrees: number;
  name?: string;
}>;
