import { Slider } from '@chakra-ui/react';
import type { MeasurementPoint } from '@/analysis/measurements';
import { displayUnits, formatMeasurement } from '../measurementDisplay';

type RoutePositionProps = Readonly<{
  points: readonly MeasurementPoint[];
  selectedIndex: number;
  labels: ReturnType<typeof displayUnits>;
  onSelect: (id: string) => void;
}>;

export const RoutePosition = ({
  points,
  selectedIndex,
  labels,
  onSelect
}: RoutePositionProps) => {
  if (!points.length) {
    return null;
  }
  return (
    <Slider.Root
      colorPalette="action"
      getAriaValueText={({ value }) => {
        if (selectedIndex < 0) {
          return 'No point selected';
        }
        const point = points[value];
        return point
          ? formatMeasurement(
              point.distanceMetres / labels.metresPerDistance,
              labels.distance
            )
          : 'No point selected';
      }}
      max={points.length - 1}
      mb={2}
      min={0}
      onValueChange={({ value: [value] }) => {
        const point = points[value];
        if (point) {
          onSelect(point.sample.id);
        }
      }}
      step={1}
      value={[selectedIndex < 0 ? 0 : selectedIndex]}
    >
      <Slider.Label>Position on route</Slider.Label>
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
              onSelect(
                points[event.key === 'Home' ? 0 : points.length - 1].sample.id
              );
            }
          }}
        />
      </Slider.Control>
    </Slider.Root>
  );
};
