import { Field, NativeSelect } from '@chakra-ui/react';

import type { Route, Track, Waypoint } from '@/domain/activityDocument';

import type { SelectedGpxItem } from '../selectedGpxItem';

type GpxItemSelectorProps = Readonly<{
  tracks: readonly Track[];
  routes: readonly Route[];
  waypoints: readonly Waypoint[];
  selectedItem: SelectedGpxItem | undefined;
  onItemChange: (item: SelectedGpxItem) => void;
}>;

export const GpxItemSelector = ({
  tracks,
  routes,
  waypoints,
  selectedItem,
  onItemChange
}: GpxItemSelectorProps) => {
  const selectableItemCount = tracks.length + routes.length + waypoints.length;

  if (selectableItemCount <= 1) {
    return null;
  }

  return (
    <Field.Root>
      <Field.Label>Item to inspect</Field.Label>
      <NativeSelect.Root>
        <NativeSelect.Field
          value={selectedItem?.id ?? ''}
          onChange={event => {
            const id = event.currentTarget.value;
            if (
              tracks.some(candidate => {
                return candidate.id === id;
              })
            ) {
              onItemChange({ kind: 'track', id });
            } else if (
              routes.some(candidate => {
                return candidate.id === id;
              })
            ) {
              onItemChange({ kind: 'route', id });
            } else if (
              waypoints.some(candidate => {
                return candidate.id === id;
              })
            ) {
              onItemChange({ kind: 'waypoint', id });
            }
          }}
        >
          {tracks.map((candidate, index) => {
            return (
              <option key={candidate.id} value={candidate.id}>
                Track: {candidate.name ?? `Unnamed track ${index + 1}`}
              </option>
            );
          })}
          {routes.map((candidate, index) => {
            return (
              <option key={candidate.id} value={candidate.id}>
                Route: {candidate.name ?? `Unnamed route ${index + 1}`}
              </option>
            );
          })}
          {waypoints.map((candidate, index) => {
            return (
              <option key={candidate.id} value={candidate.id}>
                Waypoint: {candidate.name ?? `Unnamed waypoint ${index + 1}`}
              </option>
            );
          })}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <Field.HelperText>Choose which track, route or waypoint to display.</Field.HelperText>
    </Field.Root>
  );
};
