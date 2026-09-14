import { GpxFilePicker } from '@/features/gpx-viewer';
import type { Metadata } from 'next';
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'GPX File Viewer — GPSGoblin',
  description:
    'View your GPX route, elevation, speed and pace. Select a point on the chart to find it on the map. Your file stays on your device.',
  alternates: {
    canonical: 'https://gpsgoblin.com/tools/gpx-file-viewer'
  },
  openGraph: {
    title: 'GPX File Viewer — GPSGoblin',
    description:
      'View your GPX route, elevation, speed and pace. Select a point on the chart to find it on the map. Your file stays on your device.',
    siteName: 'GPSGoblin',
    url: 'https://gpsgoblin.com/tools/gpx-file-viewer',
    type: 'website'
  }
};

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
            <Heading as='h2' id='viewer-details-heading' size='2xl'>
              What you can see
            </Heading>
            <Text color='fg.muted'>
              See your route on a map, check its distance and explore elevation, speed and pace
              when your file contains the readings needed. Select a point on a chart to find it on
              the map. Choose kilometres or miles under Display units. Your original file stays unchanged.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default GpxFileViewerPage;
