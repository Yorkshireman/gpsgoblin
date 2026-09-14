type MeasurementTotals = Readonly<{
  distanceMetres: number;
  durationSeconds: number;
  timedDistanceMetres: number;
  timedIntervalCount: number;
  intervalCount: number;
  pointCount: number;
  startMilliseconds: number | null;
  finishMilliseconds: number | null;
  issueCounts: ReadonlyMap<string, number>;
}>;

// Whole activities and selected segments share the same endpoint, missing-time
// and warning policy; callers accumulate their totals without repeating analysis.
export const summariseMeasurements = (totals: MeasurementTotals) => {
  const { startMilliseconds: start, finishMilliseconds: finish } = totals;
  return {
    distanceMetres: totals.distanceMetres,
    elapsedDurationSeconds: totals.pointCount > 1 && start !== null && finish !== null && finish >= start
      ? (finish - start) / 1000 : null,
    timedDurationSeconds: totals.timedIntervalCount ? totals.durationSeconds : null,
    averageSpeedMetresPerSecond: totals.timedIntervalCount ? totals.timedDistanceMetres / totals.durationSeconds : null,
    timedIntervalCount: totals.timedIntervalCount,
    intervalCount: totals.intervalCount,
    warnings: Array.from(totals.issueCounts, ([issue, count]) => {
      const points = `${count} GPS ${count === 1 ? 'reading' : 'readings'}`;
      if (issue === 'invalid elevation') {
        return `${points} had unreadable heights. These are left out of the elevation chart.`;
      }
      const reason = issue === 'missing timestamp' ? 'missing times'
        : issue === 'unknown timezone' ? 'times without a time zone'
          : issue === 'duplicate timestamp' ? 'repeated times'
            : issue === 'backwards timestamp' ? 'times in the wrong order' : 'unreadable times';
      return `${points} had ${reason}. Speed and pace cannot be calculated around these readings.`;
    })
  };
};
