import type { ChartMeasurement } from '../../measurementDisplay';

export type MeasurementChartProps = Readonly<{
  data: ChartMeasurement[];
  metric: 'elevation' | 'motion';
  title: string;
  description?: string;
  maximum?: number;
  elevationOverlay?: Readonly<{
    enabled: boolean;
    unit: string;
    onToggle: (enabled: boolean) => void;
  }>;
  reference?: Readonly<{ value: number; label: string }>;
  unit: string;
  distanceUnit: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}>;
