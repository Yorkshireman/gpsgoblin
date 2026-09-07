import type { Waypoint } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';
import { validateGpxPoints } from './validateGpxPoints';

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
    const description = findDirectChildText(waypointElement, 'desc');
    const elevationElement = findDirectChildren(waypointElement, 'ele')[0];
    const name = findDirectChildText(waypointElement, 'name');

    const waypoint: Waypoint = {
      ...(description ? { description } : {}),
      ...(elevationElement ? { elevationMetres: Number(elevationElement.textContent) } : {}),
      id: `waypoint-${waypointIndex}`,
      latitudeDegrees: Number(waypointElement.getAttribute('lat')),
      longitudeDegrees: Number(waypointElement.getAttribute('lon')),
      ...(name ? { name } : {})
    };

    return waypoint;
  });

  return {
    ok: true,
    waypoints
  };
};
