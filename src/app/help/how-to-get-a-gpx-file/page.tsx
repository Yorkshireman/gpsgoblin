import NextLink from 'next/link';
import {
  Box,
  Button,
  Heading,
  Link,
  List,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/react';

import { createPageMetadata } from '@/app/siteMetadata';
import { InformationPage } from '@/components/InformationPage';

export const metadata = createPageMetadata(
  '/help/how-to-get-a-gpx-file',
  'How to get and open a GPX file — GPSGoblin',
  'Export a GPX file from Garmin Connect, Strava, komoot or Polar Flow, find the download, and open it in GPSGoblin.'
);

const sourceOptions = [
  {
    availability: 'Website',
    href: '#garmin-heading',
    name: 'Garmin Connect'
  },
  { availability: 'Website', href: '#strava-heading', name: 'Strava' },
  {
    availability: 'Website or mobile app',
    href: '#komoot-heading',
    name: 'komoot'
  },
  { availability: 'Website', href: '#polar-heading', name: 'Polar Flow' },
  {
    availability: 'FIT only — GPSGoblin cannot open it',
    href: '#wahoo-heading',
    name: 'Wahoo'
  }
] as const;

const ViewerLink = () => {
  return (
    <Button
      asChild
      alignSelf="start"
      colorPalette="action"
      maxW="full"
      whiteSpace="normal"
    >
      <NextLink href="/tools/gpx-file-viewer">Explore my GPX file</NextLink>
    </Button>
  );
};

const HowToGetAGpxFilePage = () => {
  return (
    <InformationPage title="How to get and open a GPX file">
      <Stack align="start" gap={3}>
        <Text>
          <strong>Already have a .gpx file?</strong> Open it now with no
          account. The file stays on your device.
        </Text>
        <ViewerLink />
      </Stack>

      <Text>
        GPX export is not available in the same place for every service. Choose
        yours below to see where to export and what data the file may leave out.
      </Text>

      <Box as="section" aria-labelledby="source-chooser-heading">
        <Stack gap={4}>
          <Heading as="h2" id="source-chooser-heading" size="xl">
            Choose your service
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {sourceOptions.map((source) => {
              return (
                <Link
                  key={source.href}
                  asChild
                  borderColor="border.subtle"
                  borderWidth="1px"
                  color="fg"
                  minH="88px"
                  p={4}
                  rounded="lg"
                  textDecoration="none"
                  _hover={{
                    borderColor: 'action.fg',
                    textDecoration: 'none'
                  }}
                >
                  <NextLink href={source.href}>
                    <Stack gap={1}>
                      <Text
                        fontWeight="semibold"
                        textDecoration="underline"
                        textUnderlineOffset="3px"
                      >
                        {source.name}
                      </Text>
                      <Text color="fg.muted">{source.availability}</Text>
                    </Stack>
                  </NextLink>
                </Link>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="garmin-heading">
        <Stack gap={3}>
          <Heading as="h2" id="garmin-heading" size="xl">
            Garmin Connect
          </Heading>
          <Text color="fg.muted" fontWeight="medium">
            Use the Garmin Connect website
          </Text>
          <Text>
            Choose GPX only when the activity has GPS positions. Garmin says an
            indoor activity can export as an empty GPX, and a very long activity
            can be empty or incomplete. Garmin recommends the original FIT file
            in those cases, but GPSGoblin cannot open FIT yet.
          </Text>
          <List.Root as="ol" ps={5} gap={2}>
            <List.Item>Open Activities, then All Activities.</List.Item>
            <List.Item>Open the activity you want.</List.Item>
            <List.Item>
              Open the settings menu and choose <strong>Export to GPX</strong>.
            </List.Item>
            <List.Item>
              Look in your browser&apos;s Downloads folder for the .gpx file.
            </List.Item>
          </List.Root>
          <Link
            href="https://support.garmin.com/en-AU/?faq=W1TvTPW8JZ6LfJSfK512Q8"
            minH="44px"
            alignContent="center"
          >
            Garmin&apos;s activity export instructions
          </Link>
          <Link
            href="https://support.garmin.com/en-GB/?faq=BBISz2o26Z37QlY14mTLF9"
            minH="44px"
            alignContent="center"
          >
            Garmin&apos;s empty or incomplete export guidance
          </Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="strava-heading">
        <Stack gap={3}>
          <Heading as="h2" id="strava-heading" size="xl">
            Strava
          </Heading>
          <Text color="fg.muted" fontWeight="medium">
            Use the Strava website
          </Text>
          <Text>
            Do not choose Export Original when you specifically need GPX. An
            activity without GPS data produces an empty or unreadable GPX. GPX
            may contain accessory readings, but the current GPSGoblin viewer
            does not display heart rate, cadence, power or temperature.
          </Text>
          <List.Root as="ol" ps={5} gap={2}>
            <List.Item>Open one of your activity pages.</List.Item>
            <List.Item>
              Open the more menu (three dots) and choose{' '}
              <strong>Export GPX</strong>.
            </List.Item>
            <List.Item>
              Look in your browser&apos;s Downloads folder for the .gpx file.
            </List.Item>
          </List.Root>
          <Link
            href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export"
            minH="44px"
            alignContent="center"
          >
            Strava&apos;s export instructions
          </Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="komoot-heading">
        <Stack gap={3}>
          <Heading as="h2" id="komoot-heading" size="xl">
            komoot
          </Heading>
          <Text color="fg.muted" fontWeight="medium">
            Use the komoot website or app
          </Text>
          <Text>
            The starting region must be unlocked. The GPX contains the route
            shape, but not planned waypoints, voice navigation or komoot maps.
            GPSGoblin can show the exported route but cannot restore those
            omitted details.
          </Text>
          <List.Root as="ol" ps={5} gap={2}>
            <List.Item>
              Open Profile, then Saved routes or Completed activities.
            </List.Item>
            <List.Item>Open one route or activity.</List.Item>
            <List.Item>
              Choose <strong>Download GPX file</strong>.
            </List.Item>
            <List.Item>
              On the website, check your browser&apos;s Downloads folder. On
              Android, check Downloads. On iPhone or iPad, use the prompt to
              save the file or open it in another app.
            </List.Item>
          </List.Root>
          <Link
            href="https://support.komoot.com/hc/en-us/articles/10115477099674-Export-and-import-Routes-and-Activities"
            minH="44px"
            alignContent="center"
          >
            komoot&apos;s GPX export instructions
          </Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="polar-heading">
        <Stack gap={3}>
          <Heading as="h2" id="polar-heading" size="xl">
            Polar Flow
          </Heading>
          <Text color="fg.muted" fontWeight="medium">
            Use the Polar Flow website
          </Text>
          <Text>
            Polar describes GPX as route data. Heart rate, calories, cadence and
            other training data are available in richer formats, which the
            current GPSGoblin viewer does not support. Other tools may also
            calculate totals differently without the file being damaged.
          </Text>
          <List.Root as="ol" ps={5} gap={2}>
            <List.Item>Open Diary, then choose a training session.</List.Item>
            <List.Item>
              Open Export and choose <strong>GPX</strong> or a GPX ZIP package.
            </List.Item>
            <List.Item>
              Find the download in your browser&apos;s Downloads folder.
            </List.Item>
            <List.Item>
              If it is a ZIP file, extract it before choosing the .gpx file.
            </List.Item>
          </List.Root>
          <Link
            href="https://support.polar.com/us-en/export-training-sessions-flow"
            minH="44px"
            alignContent="center"
          >
            Polar&apos;s session export instructions
          </Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="wahoo-heading">
        <Stack gap={3}>
          <Heading as="h2" id="wahoo-heading" size="xl">
            Wahoo uses FIT
          </Heading>
          <Text>
            Wahoo&apos;s current instructions describe sharing completed
            activity summaries as FIT files. GPSGoblin cannot open those files
            yet. Keep the original FIT filename and use a tool that supports
            FIT; changing the filename to .gpx will not change the file&apos;s
            contents.
          </Text>
          <Link
            href="https://support.wahoofitness.com/hc/en-us/articles/204280874-Share-an-activity-to-a-third-party-app-Wahoo-app"
            minH="44px"
            alignContent="center"
          >
            Wahoo&apos;s activity-sharing instructions
          </Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="open-gpx-heading">
        <Stack gap={3}>
          <Heading as="h2" id="open-gpx-heading" size="xl">
            Open the GPX file
          </Heading>
          <Text>
            Once you have a .gpx file, open it in the GPX File Viewer. You do
            not need an account, and GPSGoblin does not upload your file.
          </Text>
          <ViewerLink />
          <Link asChild minH="44px" alignContent="center">
            <NextLink href="/help/gpx-file-empty-or-missing-data">
              Troubleshoot an empty or incomplete GPX file
            </NextLink>
          </Link>
        </Stack>
      </Box>

      <Text color="fg.muted" fontSize="sm">
        Provider instructions were checked against the official pages linked
        above on 20 September 2026. They were not tested inside private provider
        accounts.
      </Text>
    </InformationPage>
  );
};

export default HowToGetAGpxFilePage;
