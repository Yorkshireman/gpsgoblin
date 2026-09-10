import type { GeographicSample, TrackSegment } from '@/domain/activityDocument';

const EARTH_MEAN_RADIUS_METRES = 6_371_008.8;

const degreesToRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

const calculateSampleDistanceMetres = (
  firstSample: GeographicSample,
  secondSample: GeographicSample
) => {
  const firstLatitude = degreesToRadians(firstSample.latitudeDegrees);
  const secondLatitude = degreesToRadians(secondSample.latitudeDegrees);

  const latitudeDifference = secondLatitude - firstLatitude;
  const longitudeDifference = degreesToRadians(
    secondSample.longitudeDegrees - firstSample.longitudeDegrees
  );

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDifference / 2) ** 2;

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_MEAN_RADIUS_METRES * angularDistance;
};

export const calculatePathDistanceMetres = (samples: readonly GeographicSample[]) => {
  let distanceMetres = 0;

  for (let index = 1; index < samples.length; index += 1) {
    const firstSample = samples[index - 1];
    const secondSample = samples[index];

    if (!firstSample || !secondSample) {
      continue;
    }

    distanceMetres += calculateSampleDistanceMetres(firstSample, secondSample);
  }

  return distanceMetres;
};

export const calculateTrackDistanceMetres = (segments: readonly TrackSegment[]) => {
  return segments.reduce((total, segment) => {
    return total + calculatePathDistanceMetres(segment.samples);
  }, 0);
};
