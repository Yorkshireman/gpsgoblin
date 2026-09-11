import { Field, Grid, NativeSelect } from '@chakra-ui/react';
import type { DisplayUnits } from '../measurementDisplay';

type ChartControlsProps = Readonly<{
  chart: 'speed' | 'pace' | 'elevation';
  setActiveChart: (chart: 'speed' | 'pace' | 'elevation') => void;
  hasTimedMotion: boolean;
  hasElevation: boolean;
  units: DisplayUnits;
  onUnitsChange: (units: DisplayUnits) => void;
}>;

export const ChartControls = ({
  chart,
  setActiveChart,
  hasTimedMotion,
  hasElevation,
  units,
  onUnitsChange
}: ChartControlsProps) => {
  return (
    <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={2}>
      <Field.Root>
        <Field.Label>Chart</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={chart}
            onChange={event => {
              const value = event.currentTarget.value;
              setActiveChart(
                value === 'elevation' ? 'elevation' : value === 'pace' ? 'pace' : 'speed'
              );
            }}
          >
            {hasTimedMotion ? (
              <>
                <option value='speed'>Speed</option>
                <option value='pace'>Pace</option>
              </>
            ) : null}
            {hasElevation ? <option value='elevation'>Elevation</option> : null}
            {!hasTimedMotion && !hasElevation ? (
              <option value='speed'>No measurements</option>
            ) : null}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      <Field.Root>
        <Field.Label>Display units</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={units}
            onChange={event => {
              onUnitsChange(event.currentTarget.value === 'imperial' ? 'imperial' : 'metric');
            }}
          >
            <option value='metric'>Metric</option>
            <option value='imperial'>Imperial</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
    </Grid>
  );
};
