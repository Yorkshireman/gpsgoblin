export type SelectedGpxItem = Readonly<{
  kind: 'track' | 'route';
  id: string;
}>;
