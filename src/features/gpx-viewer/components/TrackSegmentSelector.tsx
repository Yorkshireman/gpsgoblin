import { Field, NativeSelect } from '@chakra-ui/react';

import type { Track } from '@/domain/activityDocument';

type TrackSegmentSelectorProps = Readonly<{
  track: Track;
  selectedSegmentId: string | undefined;
  onSegmentChange: (segmentId: string | undefined) => void;
}>;

export const TrackSegmentSelector = ({
  track,
  selectedSegmentId,
  onSegmentChange
}: TrackSegmentSelectorProps) => {
  if (track.segments.length <= 1) {
    return null;
  }

  return (
    <Field.Root>
      <Field.Label>Track section</Field.Label>
      <NativeSelect.Root>
        <NativeSelect.Field
          value={selectedSegmentId ?? ''}
          onChange={(event) => {
            onSegmentChange(event.currentTarget.value || undefined);
          }}
        >
          <option value="">Whole track</option>
          {track.segments.map((segment, index) => {
            return (
              <option key={segment.id} value={segment.id}>
                Section {index + 1}
              </option>
            );
          })}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <Field.HelperText>
        The file splits this track into sections. Distance does not include the
        gaps between them.
      </Field.HelperText>
    </Field.Root>
  );
};
