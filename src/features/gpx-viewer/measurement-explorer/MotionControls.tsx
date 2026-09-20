import { Slider, Text } from '@chakra-ui/react';
import {
  smoothingDurations,
  formatSmoothingDuration
} from '../measurementDisplay';

type MotionControlsProps = Readonly<{
  smoothingSeconds: number;
  setSmoothingSeconds: (seconds: number) => void;
  pending?: boolean;
}>;

export const MotionControls = ({
  smoothingSeconds,
  setSmoothingSeconds,
  pending
}: MotionControlsProps) => {
  const value = smoothingDurations.indexOf(smoothingSeconds);

  return (
    <Slider.Root
      colorPalette="action"
      gap={0}
      getAriaValueText={({ value: selectedValue }) => {
        const seconds = smoothingDurations[selectedValue];
        return seconds ? formatSmoothingDuration(seconds) : '0 seconds (off)';
      }}
      max={smoothingDurations.length - 1}
      min={0}
      onValueChange={({ value: [selectedValue] }) => {
        setSmoothingSeconds(smoothingDurations[selectedValue]);
      }}
      step={1}
      value={[value]}
    >
      <Slider.Label>
        Smoothing
        <span aria-hidden="true">
          {' · '}
          {formatSmoothingDuration(smoothingSeconds)}
          {smoothingSeconds === 0 ? ' (off)' : ''}
        </span>
      </Slider.Label>
      {pending ? (
        <Text as="span" role="status" fontSize="xs" color="fg.muted">
          Updating…
        </Text>
      ) : null}
      <Slider.Control minH="11">
        <Slider.Track bg="bg" borderColor="border.emphasized" borderWidth="1px">
          <Slider.Range bg="action.solid" />
        </Slider.Track>
        <Slider.Thumbs
          _focus={{
            outline: '3px solid',
            outlineColor: 'action.focusRing',
            outlineOffset: '2px'
          }}
          bg="bg"
          borderColor="action.solid"
          borderWidth="2px"
          onKeyDown={(event) => {
            if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault();
              setSmoothingSeconds(
                smoothingDurations[
                  event.key === 'Home' ? 0 : smoothingDurations.length - 1
                ]
              );
            }
          }}
        />
      </Slider.Control>
    </Slider.Root>
  );
};
