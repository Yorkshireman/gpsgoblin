import type { Route, RoutePoint } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';
import { validateGpxPoints } from './validateGpxPoints';

type GpxRoutesParseResult =
  | Readonly<{
      ok: true;
      routes: readonly Route[];
    }>
  | Readonly<{
      error: string;
      ok: false;
    }>;

export const parseGpxRoutes = (rootElement: Element): GpxRoutesParseResult => {
  const routeElements = findDirectChildren(rootElement, 'rte');
  const routePointElements = routeElements.flatMap(routeElement => {
    return findDirectChildren(routeElement, 'rtept');
  });
  const validationResult = validateGpxPoints(routePointElements, 'route point');

  if (!validationResult.ok) {
    return validationResult;
  }

  const routes = routeElements.map((routeElement, routeIndex) => {
    const description = findDirectChildText(routeElement, 'desc');
    const name = findDirectChildText(routeElement, 'name');

    const points: RoutePoint[] = findDirectChildren(routeElement, 'rtept').map(
      (pointElement, pointIndex) => {
        const pointDescription = findDirectChildText(pointElement, 'desc');
        const elevationElement = findDirectChildren(pointElement, 'ele')[0];
        const pointName = findDirectChildText(pointElement, 'name');

        return {
          ...(pointDescription ? { description: pointDescription } : {}),
          ...(elevationElement
            ? { elevationMetres: Number(elevationElement.textContent) }
            : {}),
          id: `route-${routeIndex}-point-${pointIndex}`,
          latitudeDegrees: Number(pointElement.getAttribute('lat')),
          longitudeDegrees: Number(pointElement.getAttribute('lon')),
          ...(pointName ? { name: pointName } : {})
        };
      }
    );

    const route: Route = {
      ...(description ? { description } : {}),
      id: `route-${routeIndex}`,
      ...(name ? { name } : {}),
      points
    };

    return route;
  });

  return {
    ok: true,
    routes
  };
};
