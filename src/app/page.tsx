import NextLink from 'next/link';
import {
  Button,
  Container,
  Heading,
  Link,
  Stack,
  Text
} from '@chakra-ui/react';
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
        <Stack gap={4}>
          <Text color="fg.muted" fontWeight="semibold">
            Free tools for GPS and activity files
          </Text>
          <Heading
            as="h1"
            lineHeight="1.1"
            size={{ base: '5xl', md: '6xl' }}
            textWrap="balance"
          >
            See exactly where you went
          </Heading>
          <Text>
            Open a GPX file from your run, ride or hike and get your route on a
            map, with distance, elevation, time, speed and pace when your
            recording includes them. Your file stays on your device, and there’s
            no account to create.
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
      </Stack>
    </Container>
  );
};

export default Home;
