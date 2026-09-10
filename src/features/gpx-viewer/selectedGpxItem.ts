export type SelectedGpxItem = Readonly<{
  kind: 'track' | 'route' | 'waypoint';
  id: string;
}>;
