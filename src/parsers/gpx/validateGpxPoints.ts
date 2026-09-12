import type { Element } from '@xmldom/xmldom';
import { findDirectChildren } from './gpxElementQueries';

type GpxPointKind = 'route point' | 'track point' | 'waypoint';

type GpxPointValidationResult =
  | Readonly<{
      ok: true;
    }>
  | Readonly<{
      error: string;
      ok: false;
    }>;

export const validateGpxPoints = (
  pointElements: readonly Element[],
  pointKind: GpxPointKind
): GpxPointValidationResult => {
  const hasMissingCoordinates = pointElements.some(pointElement => {
    return (
      !pointElement.getAttribute('lat')?.trim() ||
      !pointElement.getAttribute('lon')?.trim()
    );
  });

  if (hasMissingCoordinates) {
    return {
      error: `A ${pointKind} is missing its coordinates.`,
      ok: false
    };
  }

  const hasInvalidCoordinates = pointElements.some(pointElement => {
    const latitude = Number(pointElement.getAttribute('lat'));
    const longitude = Number(pointElement.getAttribute('lon'));

    return (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    );
  });

  if (hasInvalidCoordinates) {
    return {
      error: `A ${pointKind} contains invalid coordinates.`,
      ok: false
    };
  }

  const hasInvalidElevation = pointElements.some(pointElement => {
    const elevationElement = findDirectChildren(pointElement, 'ele')[0];

    if (!elevationElement) {
      return false;
    }

    const elevationText = elevationElement.textContent?.trim();

    return !elevationText || !Number.isFinite(Number(elevationText));
  });

  if (hasInvalidElevation) {
    return {
      error: `A ${pointKind} contains an invalid elevation.`,
      ok: false
    };
  }

  return {
    ok: true
  };
};
