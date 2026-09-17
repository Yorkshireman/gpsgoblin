import { downsampleChart } from './downsampleChart';
import type { ChartMeasurement } from '../../measurementDisplay';

it('retains every recording-gap endpoint even when consecutive gaps share one distance bucket', () => {
  const data: ChartMeasurement[] = Array.from({ length: 1000 }, (_, index) => {
    const recordingGap = index >= 500 && index <= 502;
    return {
      sampleId: `point-${index}`,
      distance: index >= 500 && index <= 503 ? 500 : index,
      elevation: 10,
      motion: recordingGap ? null : 4,
      recordingGap
    };
  });
  const display = downsampleChart(data, 10);
  expect(display.length).toBeLessThan(100);
  expect(
    display
      .filter((point) => {
        return point.recordingGap;
      })
      .map((point) => {
        return point.sampleId;
      })
  ).toEqual(['point-500', 'point-501', 'point-502']);
  const firstGap = display.findIndex((point) => {
    return point.recordingGap;
  });
  expect(display[firstGap - 1].sampleId).toBe('point-499');
  expect(display[firstGap + 3].sampleId).toBe('point-503');
});
