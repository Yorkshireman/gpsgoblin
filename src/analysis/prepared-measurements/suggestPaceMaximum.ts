// Viewport policy only: cover 95% of eligible interval distance, plus 25% headroom.
// Use full-resolution displayed pace; gaps, null pace and zero-distance intervals
// carry no weight. Round in min/km before conversion so units cannot change scope.
export const suggestPaceMaximum = (
  display: Float64Array,
  metrics: Float64Array,
  start: number,
  metresPerDistance: number
) => {
  const values: { pace: number; distance: number }[] = [];
  let total = 0;
  for (let index = 1; index < display.length / 3; index += 1) {
    const pace = (display[index * 3 + 2] * 1000) / metresPerDistance;
    const distance =
      metrics[(start + index) * 4] - metrics[(start + index - 1) * 4];
    if (
      !Number.isFinite(pace) ||
      pace <= 0 ||
      !Number.isFinite(distance) ||
      distance <= 0
    )
      continue;
    values.push({ pace, distance });
    total += distance;
  }
  if (!values.length || !Number.isFinite(total)) return undefined;
  values.sort((left, right) => {
    return left.pace - right.pace;
  });
  let covered = 0;
  for (const value of values) {
    covered += value.distance;
    if (covered >= total * 0.95) {
      const maximum = (Math.ceil(value.pace * 1.25) * metresPerDistance) / 1000;
      return Number.isFinite(maximum) ? maximum : undefined;
    }
  }
  return undefined;
};
