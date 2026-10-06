import NextLink from 'next/link';
import {
  Box,
  Button,
  Container,
  Grid,
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

// Path data from the homepage audit-actions Figma file (see docs/brand-assets.md).
const RouteIllustration = () => {
  return (
    <Box
      aria-hidden="true"
      color="action.fg"
      maxW={{ base: '20rem', lg: 'none' }}
      width="full"
    >
      <svg
        fill="none"
        style={{ display: 'block' }}
        viewBox="0 0 528 297"
        width="100%"
      >
        <path
          d="M0.965565 151.498L139.466 34.9981L268.966 140.498L392.966 1.99813L506.466 82.4981"
          stroke="currentColor"
          strokeDasharray="6 6"
          strokeOpacity={0.2}
          strokeWidth={3}
          transform="translate(0.04 130.5)"
        />
        <path
          d="M1.49896 80.626C4.04438 148.793 31.2216 285.126 119.567 285.126C229.999 285.126 141.271 80.626 237.635 80.626C333.999 80.626 242.999 195.49 352.499 195.49C461.999 195.49 352.499 1.5 464.499 1.5"
          stroke="currentColor"
          strokeDasharray="6 6"
          strokeWidth={3}
          transform="translate(34.52 9.87)"
        />
        <circle cx={37} cy={76} r={10} stroke="currentColor" strokeWidth={2} />
        <circle cx={517} cy={12} r={10} stroke="currentColor" strokeWidth={2} />
      </svg>
    </Box>
  );
};

const Home = () => {
  return (
    <Container
      as="main"
      maxW="6xl"
      px={{ base: 4, md: 6 }}
      py={{ base: 8, md: 16 }}
    >
      <Grid
        alignItems="center"
        columnGap={12}
        rowGap={6}
        templateColumns={{
          base: 'minmax(0, 1fr)',
          lg: 'minmax(0, 36rem) minmax(0, 1fr)'
        }}
      >
        <Stack gap={6} align="start" maxW="prose">
          <Stack gap={4}>
            <Text color="fg.muted" fontWeight="semibold">
              Free tools for GPS and activity files
            </Text>
            <Heading
              as="h1"
              // Whole-pixel line boxes: 48px × 1.125 and 60px × 1.1.
              lineHeight={{ base: '1.125', md: '1.1' }}
              size={{ base: '5xl', md: '6xl' }}
              textWrap="balance"
            >
              See exactly where you went
            </Heading>
            <Text>
              Open a GPX file from your run, ride or hike and get your route on
              a map, with distance, elevation, time, speed and pace when your
              recording includes them. Your file stays on your device, and
              there’s no account to create.
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
        <RouteIllustration />
      </Grid>
    </Container>
  );
};

export default Home;
