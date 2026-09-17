import { analyseMeasurements, findRecordingGaps } from '.';

const segment = (durations: number[], id = 'segment') => {
  let time = 0;
  return {
    id,
    samples: [0, ...durations].map((duration, index) => {
      time += duration;
      return {
        id: `${id}-${index}`,
        latitudeDegrees: 0,
        longitudeDegrees: index / 10000,
        sourceTime: new Date(Date.UTC(2026, 0, 1) + time * 1000).toISOString()
      };
    })
  };
};

it('identifies isolated gaps and exact run edges without using speed', () => {
  const track = segment([
    600,
    ...Array(30).fill(10),
    600,
    ...Array(30).fill(10),
    600
  ]);
  const points = analyseMeasurements([track]).points;
  expect(findRecordingGaps(points)).toEqual([1, 32, 63]);
  expect(
    findRecordingGaps(
      points.map((point) => {
        return { ...point, speedMetresPerSecond: 0 };
      })
    )
  ).toEqual([1, 32, 63]);
});

it.each([
  [Array(100).fill(300)],
  [[...Array(100).fill(1), ...Array(40).fill(300)]],
  [[...Array(40).fill(300), ...Array(100).fill(1)]],
  [[1, 600, 1]],
  [[...Array(3).fill(1), 600, ...Array(30).fill(1)]],
  [[...Array(30).fill(1), 120, ...Array(30).fill(1)]],
  [[...Array(30).fill(20), 200, ...Array(30).fill(20)]]
])(
  'preserves normal sparse sampling, ambiguous edges and strict boundaries (%#)',
  (durations) => {
    expect(
      findRecordingGaps(analyseMeasurements([segment(durations)]).points)
    ).toEqual([]);
  }
);

it('does not borrow context across segments or unusable timestamps', () => {
  const first = segment(Array(30).fill(1), 'first');
  const second = segment([600, 1], 'second');
  expect(
    findRecordingGaps(analyseMeasurements([first, second]).points)
  ).toEqual([]);
  const broken = segment([...Array(30).fill(1), 1, 1, 600, 1]);
  broken.samples[31].sourceTime = 'invalid';
  expect(findRecordingGaps(analyseMeasurements([broken]).points)).toEqual([]);
});
