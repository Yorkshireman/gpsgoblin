import { Field, NativeSelect } from '@chakra-ui/react';

import type { Route, Track } from '@/domain/activityDocument';

import type { SelectedGpxItem } from '../selectedGpxItem';

type GpxItemSelectorProps = Readonly<{
  tracks: readonly Track[];
  routes: readonly Route[];
  selectedItem: SelectedGpxItem | undefined;
  onItemChange: (item: SelectedGpxItem) => void;
}>;

export const GpxItemSelector = ({
  tracks,
  routes,
  selectedItem,
  onItemChange
}: GpxItemSelectorProps) => {
  const selectableItemCount = tracks.length + routes.length;

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
            const isTrack = tracks.some(candidate => {
              return candidate.id === id;
            });

            onItemChange({ kind: isTrack ? 'track' : 'route', id });
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
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <Field.HelperText>Choose which track or route to display.</Field.HelperText>
    </Field.Root>
  );
};
