import type { GeographicSample, RoutePoint } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';

// Callers validate coordinates and elevation with validateGpxPoints before reading them.
export const readGpxSample = (pointElement: Element, id: string): GeographicSample => {
  const elevationElement = findDirectChildren(pointElement, 'ele')[0];

  return {
    id,
    latitudeDegrees: Number(pointElement.getAttribute('lat')),
    longitudeDegrees: Number(pointElement.getAttribute('lon')),
    ...(elevationElement ? { elevationMetres: Number(elevationElement.textContent) } : {})
  };
};

export const readNamedGpxPoint = (pointElement: Element, id: string): RoutePoint => {
  const description = findDirectChildText(pointElement, 'desc');
  const name = findDirectChildText(pointElement, 'name');

  return {
    ...readGpxSample(pointElement, id),
    ...(description ? { description } : {}),
    ...(name ? { name } : {})
  };
};
