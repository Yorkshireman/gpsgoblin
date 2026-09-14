import { analyseMeasurements, findStopCandidates } from '.';

const stationary = (step = 1) => {
  return Array.from({ length: 60 / step + 1 }, (_, index) => {
    return { id: `p${index}`, latitudeDegrees: 54, longitudeDegrees: -2, elevationMetres: 100,
      sourceTime: new Date(Date.UTC(2026, 0, 1) + index * step * 1000).toISOString() };
  });
};

it('identifies a sustained confined core as uncertain evidence with stable source boundaries', () => {
  const analysis = analyseMeasurements([{ id: 'segment', samples: stationary() }]);
  const result = findStopCandidates(analysis.points);
  expect(result.candidates).toHaveLength(1);
  expect(result.candidates[0]).toMatchObject({ startIndex: 0, endIndex: 60, seconds: 60,
    startSampleId: 'p0', endSampleId: 'p60' });
  expect(result.candidates[0].uncertainty).toContain('Slow movement or climbing cannot be ruled out.');
  expect(result.eligibleSeconds).toBe(60);
  expect(analysis.points[60].sample.sourceTime).toBe('2026-01-01T00:01:00.000Z');
});

it('never joins sparse observations, segment boundaries or unusable timestamp runs', () => {
  for (const step of [15, 60]) {
    expect(findStopCandidates(analyseMeasurements([{ id: 's', samples: stationary(step) }]).points).candidates).toEqual([]);
  }
  const samples = stationary();
  expect(findStopCandidates(analyseMeasurements([
    { id: 'a', samples: samples.slice(0, 31) }, { id: 'b', samples: samples.slice(31) }
  ]).points).candidates).toEqual([]);
  for (const sourceTime of [undefined, 'invalid', samples[29].sourceTime, samples[10].sourceTime, '2026-01-01T00:00:30']) {
    const broken = samples.map((point, index) => { return index === 30 ? { ...point, sourceTime } : point; });
    expect(findStopCandidates(analyseMeasurements([{ id: 's', samples: broken }]).points).candidates).toEqual([]);
  }
});

it('keeps climbing and drift as uncertain candidates while continuous travel has none', () => {
  const samples = stationary();
  const climb = samples.map((point, index) => { return { ...point, elevationMetres: 100 + index }; });
  const result = findStopCandidates(analyseMeasurements([{ id: 's', samples: climb }]).points);
  expect(result.candidates[0].uncertainty).toContain('Elevation changes may be climbing or sensor drift.');
  const moving = samples.map((point, index) => { return { ...point, longitudeDegrees: -2 + index * 0.001 }; });
  expect(findStopCandidates(analyseMeasurements([{ id: 's', samples: moving }]).points).candidates).toEqual([]);
  expect(findStopCandidates(analyseMeasurements([{ id: 's', samples: stationary(5) }]).points).candidates[0].seconds).toBe(60);
});
