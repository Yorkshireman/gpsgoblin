import NextLink from 'next/link';
import {
  Button,
  Container,
  Heading,
  Link,
  Stack,
  Text
} from '@chakra-ui/react';
import { GpxHelpLinks } from '@/components/GpxHelpLinks';
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
      <Stack gap={6} align="start" maxW="prose">
        <Stack gap={3}>
          <Text color="fg.muted" fontWeight="semibold">
            Free tools for GPS and activity files
          </Text>
          <Heading as="h1" size={{ base: '3xl', md: '4xl' }}>
            See your GPX route on a map
          </Heading>
          <Text>
            Check how far it goes. Depending on what’s in your file, you can
            also explore elevation, time, speed and pace. Your file stays on
            your device, and you don’t need an account.
          </Text>
        </Stack>
        <Stack gap={1} align="start" width="full">
          <Button
            asChild
            colorPalette="action"
            size="lg"
            width={{ base: 'full', sm: 'auto' }}
            whiteSpace="normal"
          >
            <NextLink href="/tools/gpx-file-viewer">
              View your GPX file
            </NextLink>
          </Button>
          <Text>
            Don’t have a file yet?{' '}
            <Link asChild colorPalette="action" minH="44px">
              <NextLink href="/tools/gpx-file-viewer#example-activity">
                Try an example
              </NextLink>
            </Link>
          </Text>
        </Stack>
        <Stack gap={1} align="start" width="full">
          <Text fontSize="sm" color="fg.muted">
            Works with GPX 1.1 files and leaves your original file unchanged.
          </Text>
          <GpxHelpLinks />
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
