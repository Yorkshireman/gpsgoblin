import type { GeographicSample, GpxParseResult, TrackSegment } from '@/domain/activityDocument';

const findChildren = (element: Element, name: string) => {
  return Array.from(element.children).filter(child => {
    return child.localName === name;
  });
};

const findChildText = (element: Element, name: string) => {
  const text = findChildren(element, name)[0]?.textContent?.trim();

  return text || undefined;
};

export const parseGpx = (fileText: string): GpxParseResult => {
  if (/<!DOCTYPE[\s>]/i.test(fileText)) {
    return {
      ok: false,
      error: 'GPX files containing a DOCTYPE declaration are not supported.'
    };
  }

  const xmlDocument = new DOMParser().parseFromString(fileText.trim(), 'application/xml');

  const parserError = xmlDocument.querySelector('parsererror');

  if (parserError) {
    return {
      ok: false,
      error: 'The file contains malformed XML.'
    };
  }

  if (xmlDocument.documentElement.localName !== 'gpx') {
    return {
      ok: false,
      error: 'The file is not a GPX document.'
    };
  }

  if (xmlDocument.documentElement.getAttribute('version') !== '1.1') {
    return {
      ok: false,
      error: 'Only GPX 1.1 files are currently supported.'
    };
  }

  const rootElement = xmlDocument.documentElement;
  const creator = rootElement.getAttribute('creator')?.trim() || undefined;
  const metadataElement = findChildren(rootElement, 'metadata')[0];

  const metadataName = metadataElement ? findChildText(metadataElement, 'name') : undefined;
  const metadataDescription = metadataElement ? findChildText(metadataElement, 'desc') : undefined;

  const metadata =
    metadataName || metadataDescription
      ? {
          ...(metadataDescription ? { description: metadataDescription } : {}),
          ...(metadataName ? { name: metadataName } : {})
        }
      : undefined;

  const hasMissingCoordinates = Array.from(xmlDocument.getElementsByTagNameNS('*', 'trkpt')).some(
    pointElement => {
      return !pointElement.hasAttribute('lat') || !pointElement.hasAttribute('lon');
    }
  );

  if (hasMissingCoordinates) {
    return {
      ok: false,
      error: 'A track point is missing its coordinates.'
    };
  }

  const hasInvalidCoordinates = Array.from(xmlDocument.getElementsByTagNameNS('*', 'trkpt')).some(
    pointElement => {
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
    }
  );

  if (hasInvalidCoordinates) {
    return {
      ok: false,
      error: 'A track point contains invalid coordinates.'
    };
  }

  const hasInvalidElevation = Array.from(xmlDocument.getElementsByTagNameNS('*', 'trkpt')).some(
    pointElement => {
      const elevationElement = findChildren(pointElement, 'ele')[0];

      if (!elevationElement) {
        return false;
      }

      const elevationText = elevationElement.textContent?.trim();

      return !elevationText || !Number.isFinite(Number(elevationText));
    }
  );

  if (hasInvalidElevation) {
    return {
      ok: false,
      error: 'A track point contains an invalid elevation.'
    };
  }

  const tracks = findChildren(xmlDocument.documentElement, 'trk').map(
    (trackElement, trackIndex) => {
      const description = findChildText(trackElement, 'desc');
      const name = findChildText(trackElement, 'name');

      const segments: TrackSegment[] = findChildren(trackElement, 'trkseg').map(
        (segmentElement, segmentIndex) => {
          const segmentId = `track-${trackIndex}-segment-${segmentIndex}`;

          const samples: GeographicSample[] = findChildren(segmentElement, 'trkpt').map(
            (pointElement, sampleIndex) => {
              const elevationElement = findChildren(pointElement, 'ele')[0];

              return {
                id: `${segmentId}-sample-${sampleIndex}`,
                latitudeDegrees: Number(pointElement.getAttribute('lat')),
                longitudeDegrees: Number(pointElement.getAttribute('lon')),
                ...(elevationElement
                  ? { elevationMetres: Number(elevationElement.textContent) }
                  : {})
              };
            }
          );

          return {
            id: segmentId,
            samples
          };
        }
      );

      return {
        ...(description ? { description } : {}),
        id: `track-${trackIndex}`,
        ...(name ? { name } : {}),
        segments
      };
    }
  );

  if (tracks.length === 0) {
    return {
      ok: false,
      error: 'This GPX file does not contain a track to display.'
    };
  }

  const hasTrackPoints = tracks.some(track => {
    return track.segments.some(segment => {
      return segment.samples.length > 0;
    });
  });

  if (!hasTrackPoints) {
    return {
      ok: false,
      error: 'This GPX file does not contain any track points to display.'
    };
  }

  return {
    ok: true,
    document: {
      ...(creator ? { creator } : {}),
      format: 'gpx',
      ...(metadata ? { metadata } : {}),
      originalContents: fileText,
      routes: [],
      tracks,
      version: '1.1',
      waypoints: []
    }
  };
};
