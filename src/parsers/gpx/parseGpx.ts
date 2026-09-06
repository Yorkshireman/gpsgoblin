import type { GeographicSample, GpxParseResult, TrackSegment } from '@/domain/activityDocument';

const findChildren = (element: Element, name: string) => {
  return Array.from(element.children).filter(child => {
    return child.localName === name;
  });
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

  const tracks = findChildren(xmlDocument.documentElement, 'trk').map(
    (trackElement, trackIndex) => {
      const name = findChildren(trackElement, 'name')[0]?.textContent?.trim();

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
        id: `track-${trackIndex}`,
        ...(name ? { name } : {}),
        segments
      };
    }
  );

  return {
    ok: true,
    document: {
      format: 'gpx',
      originalContents: fileText,
      tracks,
      version: '1.1'
    }
  };
};
