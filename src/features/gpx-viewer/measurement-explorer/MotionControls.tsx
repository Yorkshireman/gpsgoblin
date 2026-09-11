import { Button, Field, Input, Stack, Text } from '@chakra-ui/react';
import {
  smoothingDurations,
  formatSmoothingDuration,
  formatChartValue
} from '../measurementDisplay';

type MotionControlsProps = Readonly<{
  smoothingSeconds: number;
  setSmoothingSeconds: (seconds: number) => void;
  hasSlowPace: boolean;
  fullPaceRange: boolean;
  setFullPaceRange: (full: boolean) => void;
  paceLimit: number;
  motionUnit: string;
}>;

export const MotionControls = ({
  smoothingSeconds,
  setSmoothingSeconds,
  hasSlowPace,
  fullPaceRange,
  setFullPaceRange,
  paceLimit,
  motionUnit
}: MotionControlsProps) => {
  return (
    <>
      <Field.Root gap={0}>
        <Field.Label>
          Smoothing · <span>{formatSmoothingDuration(smoothingSeconds)}</span>
          {smoothingSeconds === 0 ? ' (unsmoothed)' : ''}
        </Field.Label>
        <Input
          aria-label='Smoothing'
          type='range'
          appearance='auto'
          accentColor='green.solid'
          borderWidth={0}
          p={0}
          min={0}
          max={smoothingDurations.length - 1}
          step={1}
          value={smoothingDurations.indexOf(smoothingSeconds)}
          aria-valuetext={
            smoothingSeconds ? formatSmoothingDuration(smoothingSeconds) : '0 seconds (unsmoothed)'
          }
          onChange={event => {
            setSmoothingSeconds(smoothingDurations[Number(event.currentTarget.value)]);
          }}
        />
      </Field.Root>
      {hasSlowPace ? (
        <Stack align='start' gap={2}>
          {!fullPaceRange ? (
            <Text fontSize='sm' color='fg.muted'>
              Paces slower than {formatChartValue(paceLimit, motionUnit)} {motionUnit} are shown at
              the top. Select a point to see its value.
            </Text>
          ) : null}
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setFullPaceRange(!fullPaceRange);
            }}
          >
            {fullPaceRange ? 'Show normal pace range' : 'Show full pace range'}
          </Button>
        </Stack>
      ) : null}
    </>
  );
};
