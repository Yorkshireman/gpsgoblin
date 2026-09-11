import { GpxFilePicker } from '@/features/gpx-viewer';
import type { Metadata } from 'next';
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'GPX File Viewer — GPSGoblin',
  description:
    'Inspect GPX routes, elevation and available timing, with chart-to-map selection and metric or imperial units. Your file stays on your device.',
  alternates: {
    canonical: 'https://gpsgoblin.com/tools/gpx-file-viewer'
  },
  openGraph: {
    title: 'GPX File Viewer — GPSGoblin',
    description:
      'Inspect GPX routes, elevation and available timing, with chart-to-map selection and metric or imperial units. Your file stays on your device.',
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
              What the viewer will show
            </Heading>
            <Text color='fg.muted'>
              Supported GPX tracks will be displayed without joining separate track segments.
              Distance will be calculated from usable route geometry and clearly labelled with its
              calculation basis. Elevation and interval speed or pace appear only where supported by
              the data. Inspect a chart point on the map and choose metric or imperial display
              units.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default GpxFileViewerPage;
