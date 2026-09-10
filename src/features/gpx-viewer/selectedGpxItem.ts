export type SelectedGpxItem =
  | Readonly<{
      kind: 'track';
      id: string;
      segmentId?: string;
    }>
  | Readonly<{
      kind: 'route' | 'waypoint';
      id: string;
    }>;
