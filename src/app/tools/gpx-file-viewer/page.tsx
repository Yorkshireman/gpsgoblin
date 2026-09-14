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
    <Container as='main' maxW='1600px' px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
      <Stack gap={5}>
        <Heading as='h1' size={{ base: 'xl', md: '2xl' }}>
          GPX File Viewer
        </Heading>
        <GpxFilePicker />

        <Box as='section' aria-labelledby='viewer-details-heading'>
          <Stack gap={3} maxW='prose'>
            <Heading as='h2' id='viewer-details-heading' size='xl'>
              What you can see
            </Heading>
            <Text color='fg.muted'>
              See your route on a map, check its distance and explore elevation, speed and pace
              when your file contains the readings needed. Select a point on a chart to find it on
              the map. Choose kilometres or miles under Display units. Your original file stays unchanged.
            </Text>
            <Heading as='h2' size='xl'>How to open a GPX file</Heading>
            <Text>Choose or drop one .gpx file into the area above. If it contains several tracks, routes or waypoints, choose the one you want to inspect. Use Change GPX file to open another recording or Clear file to start again.</Text>
            <Heading as='h2' size='xl'>Supported data</Heading>
            <Text>Open GPX 1.1 tracks, separate track sections, planned routes and waypoints. Elevation needs height readings; speed and pace need usable times and positions. Missing readings are left unavailable. FIT, TCX and GPX 1.0 files are not supported.</Text>
            <Heading as='h2' size='xl'>Understanding your results</Heading>
            <Text>Distance follows the recorded positions, so GPS errors can affect it. Duration is the time between the first and last point, including stops. Speed and pace are calculated from changes in position and time; they may differ from your device. Smoothing changes the chart, not your file.</Text>
            <Text>Possible stops need your review before you leave them out. Gaps in a recording do not prove you stopped. The selected chart view shows whether stops and gaps contribute to its average.</Text>
            <Heading as='h2' size='xl'>Privacy and limitations</Heading>
            <Text>Your file is not uploaded. Online map backgrounds request the area you are viewing from OpenStreetMap. Refreshing or leaving this tool closes your file and resets your choices.</Text>
            <Text>This viewer does not edit, repair, convert or download a changed file. Extra device fields such as heart rate, cadence and power are not displayed.</Text>
            <Link asChild minH='44px' colorPalette='green' variant='underline' textDecorationColor='currentColor' _hover={{ textDecorationThickness: '2px' }}><NextLink href='/limitations'>Tested support and limitations</NextLink></Link>
            <Link asChild minH='44px' colorPalette='green' variant='underline' textDecorationColor='currentColor' _hover={{ textDecorationThickness: '2px' }}><NextLink href='/privacy'>How your file and map requests are handled</NextLink></Link>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default GpxFileViewerPage;
