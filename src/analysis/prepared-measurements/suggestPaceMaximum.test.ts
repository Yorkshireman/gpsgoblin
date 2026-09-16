import { suggestPaceMaximum } from './suggestPaceMaximum';

const suggest = (
  rows: { pace: number; distance: number }[],
  unitMetres = 1000
) => {
  const display = new Float64Array((rows.length + 1) * 3).fill(NaN);
  const metrics = new Float64Array((rows.length + 1) * 4);
  let distance = 0;
  rows.forEach((row, index) => {
    distance += row.distance;
    display[(index + 1) * 3 + 2] = (row.pace * unitMetres) / 1000;
    metrics[(index + 1) * 4] = distance;
  });
  return suggestPaceMaximum(display, metrics, 0, unitMetres);
};

it('keeps sustained slow hiking and mixed climbing visible', () => {
  expect(suggest([{ pace: 60, distance: 1000 }])).toBe(75);
  expect(
    suggest([
      { pace: 15, distance: 500 },
      { pace: 60, distance: 500 }
    ])
  ).toBe(75);
});

it('limits the influence of many tiny movements without removing their values', () => {
  const rows = [
    { pace: 6, distance: 1000 },
    ...Array.from({ length: 1000 }, () => {
      return { pace: 500, distance: 0.01 };
    })
  ];
  expect(suggest(rows)).toBe(8);
  expect(rows.at(-1)?.pace).toBe(500);
  expect(suggest(rows, 1609.344)).toBeCloseTo(8 * 1.609344);
});

it('weights distance rather than sample count and explicitly permits a short slow section above range', () => {
  const rows = [
    { pace: 15, distance: 960 },
    { pace: 90, distance: 40 }
  ];
  expect(suggest(rows)).toBe(19);
  expect(
    suggest([
      ...Array.from({ length: 960 }, () => {
        return { pace: 15, distance: 1 };
      }),
      rows[1]
    ])
  ).toBe(19);
});

it('ignores missing, nonfinite, zero pace and zero distance without inventing a range', () => {
  expect(
    suggest([
      { pace: NaN, distance: 600 },
      { pace: Infinity, distance: 100 },
      { pace: 0, distance: 100 },
      { pace: 300, distance: 0 }
    ])
  ).toBeUndefined();
  expect(
    suggest([
      { pace: 10, distance: 100 },
      { pace: NaN, distance: 10000 },
      { pace: 300, distance: 0 }
    ])
  ).toBe(13);
});
