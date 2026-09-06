import { Badge, Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GPX File Viewer — GPSGoblin',
  description:
    'Open a GPX file locally to inspect its route, track segments and calculated distance in your browser.',
  alternates: {
    canonical: 'https://gpsgoblin.com/tools/gpx-file-viewer'
  },
  openGraph: {
    title: 'GPX File Viewer — GPSGoblin',
    description:
      'Open a GPX file locally to inspect its route, track segments and calculated distance in your browser.',
    siteName: 'GPSGoblin',
    url: 'https://gpsgoblin.com/tools/gpx-file-viewer',
    type: 'website'
  }
};

export default function GpxFileViewerPage() {
  return (
    <Container as='main' maxW='4xl' px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
      <Stack gap={{ base: 8, md: 10 }}>
        <Stack as='header' gap={4} align='flex-start'>
          <Badge colorPalette='green' variant='subtle'>
            Processed locally
          </Badge>

          <Heading as='h1' size={{ base: '4xl', md: '5xl' }}>
            GPX File Viewer
          </Heading>

          <Text maxW='2xl' fontSize={{ base: 'lg', md: 'xl' }} color='fg.muted'>
            Open a GPX recording to inspect its route, track segments and calculated distance. Your
            activity file will be processed in your browser and will not be uploaded by this tool.
          </Text>
        </Stack>

        <Box
          as='section'
          aria-labelledby='file-import-heading'
          borderWidth='1px'
          borderColor='border.subtle'
          rounded='xl'
          bg='bg.panel'
          p={{ base: 5, md: 8 }}
        >
          <Stack gap={3}>
            <Heading as='h2' id='file-import-heading' size='2xl'>
              Open a GPX file
            </Heading>

            <Text color='fg.muted'>
              Choose or drop a file from your device. Files remain in memory only for the current
              browser session.
            </Text>
          </Stack>
        </Box>

        <Box as='section' aria-labelledby='viewer-details-heading'>
          <Stack gap={3}>
            <Heading as='h2' id='viewer-details-heading' size='2xl'>
              What the viewer will show
            </Heading>

            <Text color='fg.muted'>
              Supported GPX tracks will be displayed without joining separate track segments.
              Distance will be calculated from usable route geometry and clearly labelled with its
              calculation basis.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
