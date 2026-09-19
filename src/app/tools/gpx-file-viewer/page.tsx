import { GpxFilePicker } from '@/features/gpx-viewer';
import { createPageMetadata } from '@/app/siteMetadata';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { Box, Container, Heading, Link, Stack, Text } from '@chakra-ui/react';

export const metadata = createPageMetadata(
  '/tools/gpx-file-viewer',
  'GPX File Viewer — GPSGoblin',
  'View your GPX route, elevation, speed and pace. Select a point on the chart to find it on the map. Your file stays on your device.'
);

const ViewerHelp = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <Box as="details">
      <Box
        as="summary"
        cursor="pointer"
        fontWeight="medium"
        fontSize="sm"
        minH="44px"
        alignContent="center"
      >
        Help with this viewer
      </Box>
      <Stack gap={3} maxW="prose" pt={3}>
        {children}
        <Link asChild minH="44px">
          <NextLink href="/limitations">
            Tested support and limitations
          </NextLink>
        </Link>
        <Link asChild minH="44px">
          <NextLink href="/privacy">
            How your file and map requests are handled
          </NextLink>
        </Link>
      </Stack>
    </Box>
  );
};

const ResultPrivacyAndLimitations = () => {
  return (
    <>
      <Heading as="h2" size="xl">
        Privacy and limitations
      </Heading>
      <Text>
        Your file stays on your device. Online map backgrounds ask OpenStreetMap
        for the area you are viewing.
      </Text>
      <Text>
        This viewer does not edit, repair or convert your file. It does not show
        extra device readings such as heart rate, cadence or power.
      </Text>
    </>
  );
};

const GpxFileViewerPage = () => {
  return (
    <Box bg="bg.muted">
      <Container
        as="main"
        maxW="1600px"
        px={{ base: 2, md: 6 }}
        py={{ base: 4, md: 6 }}
      >
        <Stack gap={5}>
          <Heading as="h1" size={{ base: 'xl', md: '2xl' }}>
            GPX File Viewer
          </Heading>
          <GpxFilePicker
            emptyStateHelp={
              <ViewerHelp>
                <Heading as="h2" size="xl">
                  How to open a GPX file
                </Heading>
                <Text>Choose or drop one .gpx file into the area above.</Text>
                <Heading as="h2" size="xl">
                  What files you can open
                </Heading>
                <Text>
                  You can open GPX 1.1 tracks, separate track sections, planned
                  routes and waypoints.
                </Text>
                <Text>
                  <strong>Elevation</strong> needs height readings.{' '}
                  <strong>Speed</strong> and <strong>Pace</strong> need usable
                  times and positions. FIT, TCX and GPX 1.0 files are not
                  supported.
                </Text>
                <Heading as="h2" size="xl">
                  Your privacy
                </Heading>
                <Text>
                  Your file stays on your device. Refreshing or leaving this
                  tool closes it and resets your choices.
                </Text>
              </ViewerHelp>
            }
            resultsHelp={
              <ViewerHelp>
                <Heading as="h2" id="viewer-details-heading" size="xl">
                  What you can see
                </Heading>
                <Text>
                  The viewer shows the measurements and controls available for
                  this file.
                </Text>
                <Text>
                  If a chart is shown, choose a point on it to find that
                  location on the map. On a phone, use{' '}
                  <strong>View on map</strong>, then{' '}
                  <strong>Back to chart</strong> to return to the same point.
                </Text>
                <Heading as="h2" size="xl">
                  Understanding your results
                </Heading>
                <Text>
                  Distance follows the recorded positions, so GPS errors can
                  affect it. If a duration is shown, it is the time between the
                  first and last point, including stops.
                </Text>
                <Text>
                  If <strong>Speed</strong> or <strong>Pace</strong> is shown,
                  it is calculated from changes in position and time, so it may
                  differ from your device. If <strong>Smoothing</strong> is
                  available, it changes the chart, not your file.
                </Text>
                <ResultPrivacyAndLimitations />
              </ViewerHelp>
            }
            waypointHelp={
              <ViewerHelp>
                <Heading as="h2" id="viewer-details-heading" size="xl">
                  What you can see
                </Heading>
                <Text>
                  This point shows its location and any elevation recorded in
                  your file.
                </Text>
                <Text>
                  A waypoint is a single recorded point, rather than a completed
                  activity or a planned route. It does not have distance or
                  duration totals.
                </Text>
                <ResultPrivacyAndLimitations />
              </ViewerHelp>
            }
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default GpxFileViewerPage;
