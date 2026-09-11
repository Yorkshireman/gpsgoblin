type Timestamp = Readonly<{
  milliseconds: number | null;
  issue?: string;
}>;

export const readTimestamp = (source: string | undefined): Timestamp => {
  if (source === undefined) {
    return { milliseconds: null, issue: 'missing timestamp' };
  }
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.exec(
      source.trim()
    );
  if (!match) {
    return { milliseconds: null, issue: 'invalid timestamp' };
  }
  const [, year, month, day, hour, minute, second, fraction, zone] = match;
  const calendar = new Date(0);
  calendar.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  const offsetHours = zone && zone !== 'Z' ? Number(zone.slice(1, 3)) : 0;
  const offsetMinutes = zone && zone !== 'Z' ? Number(zone.slice(4, 6)) : 0;
  if (
    Number(year) === 0 ||
    calendar.getUTCFullYear() !== Number(year) ||
    calendar.getUTCMonth() !== Number(month) - 1 ||
    calendar.getUTCDate() !== Number(day) ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59 ||
    offsetHours > 14 ||
    offsetMinutes > 59 ||
    (offsetHours === 14 && offsetMinutes !== 0)
  ) {
    return { milliseconds: null, issue: 'invalid timestamp' };
  }
  if (!zone) {
    return { milliseconds: null, issue: 'unknown timezone' };
  }
  const milliseconds =
    Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}${zone}`) +
    Number(fraction ?? 0) * 1000;
  return Number.isFinite(milliseconds)
    ? { milliseconds }
    : { milliseconds: null, issue: 'invalid timestamp' };
};
