import { DefaultZIndexes, ZIndexLayer, usePlotArea, useXAxisScale, useYAxisScale } from 'recharts';
import type { ChartMeasurement } from '../../measurementDisplay';

type ChartSelectionProps = Readonly<{
  data: readonly ChartMeasurement[];
  metric: 'elevation' | 'motion';
  maximum?: number;
  onSelect: (id: string) => void;
}>;

export const ChartSelection = ({ data, metric, maximum, onSelect }: ChartSelectionProps) => {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) {
    return null;
  }
  // SVG paint order must put the hit area above lines, fills, markers and the hover cursor.
  return (
    <ZIndexLayer zIndex={DefaultZIndexes.label + 1}>
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
          // Browser touch coordinates can round to a CSS pixel containing many
          // samples. Prefer a real measurement within four pixels of the target;
          // otherwise keep nearest-distance selection, including missing values.
          const radius = 4;
          const scaleX = bounds.width / area.width;
          const scaleY = bounds.height / area.height;
          const lowerBound = (target: number) => {
            let low = 0;
            let high = data.length;
            while (low < high) {
              const middle = Math.floor((low + high) / 2);
              if ((xScale(data[middle].distance) ?? Infinity) < target) low = middle + 1;
              else high = middle;
            }
            return low;
          };
          // Cumulative distances are non-decreasing. Include the neighbours and
          // all distance ties so sparse lines and stationary runs stay selectable.
          let first = Math.max(0, lowerBound(x - radius / scaleX) - 1);
          while (first > 0 && data[first - 1].distance === data[first].distance) first -= 1;
          const last = lowerBound(x + radius / scaleX);
          let end = last;
          while (end < data.length && data[end].distance === data[last].distance) end += 1;
          let hit: ChartMeasurement | undefined;
          let hitDistance = radius ** 2;
          for (let index = first; index < end; index += 1) {
            const point = data[index];
            const pointX = xScale(point.distance);
            if (pointX === undefined) {
              continue;
            }
            const dx = Math.abs(pointX - x);
            const pointY = point[metric] === null ? undefined : yScale(Math.min(point[metric], maximum ?? Infinity));
            const dy = pointY === undefined ? Infinity : Math.abs(pointY - y);
            const distance = (dx * scaleX) ** 2 + (dy * scaleY) ** 2;
            if (point.sampleId && distance < hitDistance) {
              hit = point;
              hitDistance = distance;
            }
            if (dx < nearestX || (dx === nearestX && dy < nearestY)) {
              nearest = point;
              nearestX = dx;
              nearestY = dy;
            }
          }
          const selected = hit ?? nearest;
          if (selected?.sampleId && selected[metric] !== null) {
            onSelect(selected.sampleId);
          }
        }}
      />
    </ZIndexLayer>
  );
};
