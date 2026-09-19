import { GpxFilePicker } from '@/features/gpx-viewer';
import { createPageMetadata } from '@/app/siteMetadata';
import NextLink from 'next/link';
import { Box, Container, Heading, Link, Stack, Text } from '@chakra-ui/react';

export const metadata = createPageMetadata(
  '/tools/gpx-file-viewer',
  'GPX File Viewer — GPSGoblin',
  'View your GPX route, elevation, speed and pace. Select a point on the chart to find it on the map. Your file stays on your device.'
);

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
                  <Heading as="h2" size="xl">
                    How to open a GPX file
                  </Heading>
                  <Text>Choose or drop one .gpx file into the area above.</Text>
                  <Heading as="h2" size="xl">
                    What files you can open
                  </Heading>
                  <Text>
                    You can open GPX 1.1 tracks, separate track sections,
                    planned routes and waypoints.
                  </Text>
                  <Text>
                    Elevation needs height readings. Speed and pace need usable
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
            }
            resultsHelp={
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
                  <Heading as="h2" id="viewer-details-heading" size="xl">
                    What you can see
                  </Heading>
                  <Text>
                    Choose <strong>Speed</strong>, <strong>Pace</strong> or{' '}
                    <strong>Elevation</strong> under <strong>Chart</strong>.
                    Choose kilometres or miles under{' '}
                    <strong>Display units</strong>.
                  </Text>
                  <Text>
                    Select a point on the chart to see where it is on the map.
                    On a phone, use <strong>View on map</strong>, then{' '}
                    <strong>Back to chart</strong> to return to the same point.
                  </Text>
                  <Heading as="h2" size="xl">
                    Understanding your results
                  </Heading>
                  <Text>
                    Distance follows the recorded positions, so GPS errors can
                    affect it. Duration is the time between the first and last
                    point, including stops.
                  </Text>
                  <Text>
                    Speed and pace are calculated from changes in position and
                    time, so they may differ from your device.{' '}
                    <strong>Smoothing</strong> changes the chart, not your file.
                  </Text>
                  <Text>
                    <strong>Possible stops</strong> need your review before you
                    leave them out. Gaps in a recording do not prove you
                    stopped. The selected chart view explains whether stops and
                    gaps are included in its average.
                  </Text>
                  <Heading as="h2" size="xl">
                    Privacy and limitations
                  </Heading>
                  <Text>
                    Your file stays on your device. Online map backgrounds ask
                    OpenStreetMap for the area you are viewing.
                  </Text>
                  <Text>
                    This viewer does not edit, repair or convert your file. It
                    does not show extra device readings such as heart rate,
                    cadence or power.
                  </Text>
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
            }
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default GpxFileViewerPage;
