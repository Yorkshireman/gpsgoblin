import type { ChartMeasurement } from '../../measurementDisplay';

export type MeasurementChartProps = Readonly<{
  data: ChartMeasurement[];
  metric: 'elevation' | 'motion';
  title: string;
  description?: string;
  axisMaximum?: number;
  elevationOverlay?: Readonly<{
    enabled: boolean;
    unit: string;
    onToggle: (enabled: boolean) => void;
  }>;
  reference?: Readonly<{ value: number; label: string }>;
  unit: string;
  distanceUnit: string;
  axisLabel?: string;
  basisLabel?: string;
  onStopSelect?: (id: string | undefined, trigger?: HTMLElement) => void;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}>;
