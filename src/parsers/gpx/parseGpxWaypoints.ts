import type { Element } from '@xmldom/xmldom';
import type { Waypoint } from '@/domain/activityDocument';

import { findDirectChildren } from './gpxElementQueries';
import { validateGpxPoints } from './validateGpxPoints';
import { readNamedGpxPoint } from './readGpxPoint';

type GpxWaypointsParseResult =
  | Readonly<{
      ok: true;
      waypoints: readonly Waypoint[];
    }>
  | Readonly<{
      error: string;
      ok: false;
    }>;

export const parseGpxWaypoints = (rootElement: Element): GpxWaypointsParseResult => {
  const waypointElements = findDirectChildren(rootElement, 'wpt');
  const validationResult = validateGpxPoints(waypointElements, 'waypoint');

  if (!validationResult.ok) {
    return validationResult;
  }

  const waypoints = waypointElements.map((waypointElement, waypointIndex) => {
    return readNamedGpxPoint(waypointElement, `waypoint-${waypointIndex}`);
  });

  return {
    ok: true,
    waypoints
  };
};
