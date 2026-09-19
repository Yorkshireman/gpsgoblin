import NextLink from 'next/link';
import { Button, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { createPageMetadata } from './siteMetadata';

export const metadata = createPageMetadata(
  '/',
  'GPSGoblin — Free tools for GPS and activity files',
  'Explore your GPX routes, tracks and waypoints with GPSGoblin’s free GPX File Viewer. Your file stays on your device.'
);

const Home = () => {
  return (
    <Container
      as="main"
      maxW="5xl"
      px={{ base: 4, md: 6 }}
      py={{ base: 8, md: 16 }}
    >
      <Stack gap={5} align="start">
        <Heading as="h1" size={{ base: '3xl', md: '4xl' }}>
          Free tools for GPS and activity files
        </Heading>
        <Text maxW="prose">
          Explore a walk, ride, run or planned route. Your file stays on your
          device, with no account needed.
        </Text>
        <Stack
          gap={3}
          borderWidth="1px"
          bg="bg.panel"
          rounded="lg"
          p={{ base: 5, md: 8 }}
          mt={3}
          align="start"
        >
          <Heading as="h2" size="xl">
            GPX File Viewer
          </Heading>
          <Text maxW="prose">
            View tracks, routes and waypoints on a map. Check distance and
            explore elevation, speed and pace when your file has the readings
            needed.
          </Text>
          <Button
            asChild
            colorPalette="action"
            variant="surface"
            maxW="full"
            whiteSpace="normal"
          >
            <NextLink href="/tools/gpx-file-viewer">
              Open GPX File Viewer
            </NextLink>
          </Button>
          <Text fontSize="sm" color="fg.muted">
            Supports GPX 1.1. Free to use; your original file stays unchanged.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
