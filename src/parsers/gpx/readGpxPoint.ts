import type { GeographicSample, RoutePoint } from '@/domain/activityDocument';

export type PointKind = 'route point' | 'track point' | 'waypoint';
export type PointIssues = {
  missingCoordinates?: boolean;
  invalidCoordinates?: boolean;
  invalidElevation?: boolean;
};
export type TextFields = { name?: string; desc?: string; ele?: string; time?: string };
export type PointFields = {
  id: string;
  latitude?: string;
  longitude?: string;
  fields: TextFields;
};

export const readNames = (fields: TextFields) => {
  const name = fields.name?.trim();
  const description = fields.desc?.trim();
  return {
    ...(name ? { name } : {}),
    ...(description ? { description } : {})
  };
};

export const readGpxPoint = (
  point: PointFields,
  named: boolean,
  issues: PointIssues
): GeographicSample | RoutePoint => {
  const latitudeDegrees = Number(point.latitude);
  const longitudeDegrees = Number(point.longitude);
  const elevationText = point.fields.ele;
  const elevationMetres = elevationText === undefined ? undefined : Number(elevationText);
  if (!point.latitude?.trim() || !point.longitude?.trim()) {
    issues.missingCoordinates = true;
  }
  if (!Number.isFinite(latitudeDegrees) || !Number.isFinite(longitudeDegrees) ||
    latitudeDegrees < -90 || latitudeDegrees > 90 || longitudeDegrees < -180 || longitudeDegrees > 180) {
    issues.invalidCoordinates = true;
  }
  if (elevationText !== undefined && (!elevationText.trim() || !Number.isFinite(elevationMetres))) {
    issues.invalidElevation = true;
  }
  return {
    id: point.id,
    latitudeDegrees,
    longitudeDegrees,
    ...(elevationMetres === undefined ? {} : { elevationMetres }),
    ...(point.fields.time === undefined ? {} : { sourceTime: point.fields.time }),
    ...(named ? readNames(point.fields) : {})
  };
};

export const pointError = (issues: PointIssues, kind: PointKind) => {
  if (issues.missingCoordinates) return `A ${kind} is missing its coordinates.`;
  if (issues.invalidCoordinates) return `A ${kind} contains invalid coordinates.`;
  if (issues.invalidElevation) return `A ${kind} contains an invalid elevation.`;
  return undefined;
};
