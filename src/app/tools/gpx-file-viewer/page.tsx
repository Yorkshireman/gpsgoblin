import { GpxFilePicker } from '@/features/gpx-viewer/components/GpxFilePicker';
import type { Metadata } from 'next';
import { Badge, Box, Card, Container, Heading, Stack, Text } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'GPX File Viewer — GPSGoblin',
  description:
    'View a GPX file’s route, track segments and calculated distance without uploading the file.',
  alternates: {
    canonical: 'https://gpsgoblin.com/tools/gpx-file-viewer'
  },
  openGraph: {
    title: 'GPX File Viewer — GPSGoblin',
    description:
      'View a GPX file’s route, track segments and calculated distance without uploading the file.',
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
            Your file stays on your device
          </Badge>
          <Heading as='h1' size={{ base: '4xl', md: '5xl' }}>
            GPX File Viewer
          </Heading>
          <Text maxW='2xl' fontSize={{ base: 'lg', md: 'xl' }} color='fg.muted'>
            Open a GPX recording to inspect its route, track segments and calculated distance. Your
            activity file stays on your device and this tool does not upload it.
          </Text>
        </Stack>

        <Card.Root as='section' aria-labelledby='file-import-heading'>
          <Card.Header>
            <Card.Title as='h2' id='file-import-heading'>
              Open a GPX file
            </Card.Title>
            <Card.Description>
              Choose or drop a file from your device. This tool forgets it when you close or refresh
              the page.
            </Card.Description>
          </Card.Header>

          <Card.Body>
            <GpxFilePicker />
          </Card.Body>
        </Card.Root>

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
