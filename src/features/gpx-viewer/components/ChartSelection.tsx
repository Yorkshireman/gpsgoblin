import { usePlotArea, useXAxisScale, useYAxisScale } from 'recharts';
import type { ChartMeasurement } from '../measurementDisplay';

type ChartSelectionProps = Readonly<{
  data: readonly ChartMeasurement[];
  metric: 'elevation' | 'motion';
  onSelect: (id: string) => void;
}>;

export const ChartSelection = ({ data, metric, onSelect }: ChartSelectionProps) => {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) {
    return null;
  }
  return (
    <rect
      x={area.x}
      y={area.y}
      width={area.width}
      height={area.height}
      fill='transparent'
      className='measurement-selection-area'
      aria-hidden='true'
      style={{ cursor: 'crosshair' }}
      onClick={event => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = area.x + ((event.clientX - bounds.left) * area.width) / bounds.width;
        const y = area.y + ((event.clientY - bounds.top) * area.height) / bounds.height;
        let nearest: ChartMeasurement | undefined;
        let nearestX = Infinity;
        let nearestY = Infinity;
        for (const point of data) {
          const pointX = xScale(point.distance);
          if (pointX === undefined) {
            continue;
          }
          const dx = Math.abs(pointX - x);
          const pointY = point[metric] === null ? undefined : yScale(point[metric]);
          const dy = pointY === undefined ? Infinity : Math.abs(pointY - y);
          if (dx < nearestX || (dx === nearestX && dy < nearestY)) {
            nearest = point;
            nearestX = dx;
            nearestY = dy;
          }
        }
        if (nearest?.sampleId && nearest[metric] !== null) {
          onSelect(nearest.sampleId);
        }
      }}
    />
  );
};
