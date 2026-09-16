import { Field, Grid, NativeSelect, Text } from '@chakra-ui/react';

type StopOptionsProps = Readonly<{
  mode: 'include' | 'exclude';
  onModeChange: (mode: 'include' | 'exclude') => void;
  axis: 'distance' | 'time';
  onAxisChange: (axis: 'distance' | 'time') => void;
  hasStops: boolean;
  timeAvailable: boolean;
}>;

export const StopOptions = ({
  mode,
  onModeChange,
  axis,
  onAxisChange,
  hasStops,
  timeAvailable
}: StopOptionsProps) => {
  return (
    <Grid
      templateColumns={
        hasStops ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)'
      }
      gap={2}
      pt={2}
    >
      {hasStops ? (
        <Field.Root>
          <Field.Label>Stops</Field.Label>
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={mode}
              onChange={(event) => {
                onModeChange(
                  event.target.value === 'exclude' ? 'exclude' : 'include'
                );
              }}
            >
              <option value="include">Include stops</option>
              <option value="exclude">Exclude chosen stops</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      ) : null}
      <Field.Root>
        <Field.Label>Show by</Field.Label>
        <NativeSelect.Root size="sm">
          <NativeSelect.Field
            value={axis}
            onChange={(event) => {
              onAxisChange(event.target.value === 'time' ? 'time' : 'distance');
            }}
          >
            <option value="distance">Distance</option>
            <option value="time" disabled={!timeAvailable}>
              Time
            </option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      {!timeAvailable ? (
        <Text gridColumn="1 / -1" fontSize="xs">
          There aren’t enough reliable times to show this chart by time. Use
          Distance instead.
        </Text>
      ) : null}
    </Grid>
  );
};
