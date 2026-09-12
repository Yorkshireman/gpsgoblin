import type { Element } from '@xmldom/xmldom';
import type { Route, RoutePoint } from '@/domain/activityDocument';

import { findDirectChildren, findDirectChildText } from './gpxElementQueries';
import { validateGpxPoints } from './validateGpxPoints';
import { readNamedGpxPoint } from './readGpxPoint';

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
        return readNamedGpxPoint(pointElement, `route-${routeIndex}-point-${pointIndex}`);
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
