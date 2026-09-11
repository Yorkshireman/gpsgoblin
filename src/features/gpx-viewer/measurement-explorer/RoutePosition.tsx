import { Button, Field, Input } from '@chakra-ui/react';
import type { MeasurementPoint } from '@/analysis/measurements';
import { displayUnits, formatMeasurement } from '../measurementDisplay';

type RoutePositionProps = Readonly<{
  points: readonly MeasurementPoint[];
  selectedIndex: number;
  labels: ReturnType<typeof displayUnits>;
  onSelect: (id: string) => void;
}>;

export const RoutePosition = ({ points, selectedIndex, labels, onSelect }: RoutePositionProps) => {
  const selected = points[selectedIndex];
  if (!points.length) {
    return null;
  }
  return (
    <Field.Root>
      <Field.Label>Position on route</Field.Label>
      <Input
        type='range'
        appearance='auto'
        accentColor='green.solid'
        borderWidth={0}
        p={0}
        min={0}
        max={points.length - 1}
        step={1}
        value={selectedIndex < 0 ? 0 : selectedIndex}
        aria-valuetext={
          selected
            ? formatMeasurement(selected.distanceMetres / labels.metresPerDistance, labels.distance)
            : 'No point selected'
        }
        onChange={event => {
          const point = points[Number(event.currentTarget.value)];
          if (point) {
            onSelect(point.sample.id);
          }
        }}
      />
      <Button
        size='sm'
        variant='outline'
        onClick={() => {
          onSelect(points[0].sample.id);
        }}
      >
        Start of route
      </Button>
    </Field.Root>
  );
};
