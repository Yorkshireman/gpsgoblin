import NextLink from 'next/link';
import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import { createPageMetadata } from '@/app/siteMetadata';
import { InformationPage } from '@/components/InformationPage';

export const metadata = createPageMetadata(
  '/help/gpx-file-empty-or-missing-data',
  'Why a GPX file is empty or missing data — GPSGoblin',
  'Find out why a GPX file has no route, misses charts or contains less data than expected, and choose the next valid step.'
);

const RecoveryStep = ({
  children,
  effect,
  title
}: Readonly<{
  children: ReactNode;
  effect: string;
  title: string;
}>) => {
  return (
    <Box
      as="section"
      borderInlineStartWidth="4px"
      borderColor="border.emphasized"
      ps={{ base: 4, md: 5 }}
    >
      <Stack gap={3}>
        <Heading as="h2" size="xl">
          {title}
        </Heading>
        <Text>
          <strong>What this means:</strong> {effect}
        </Text>
        <Text>
          <strong>What to do:</strong> {children}
        </Text>
      </Stack>
    </Box>
  );
};

const GpxFileEmptyOrMissingDataPage = () => {
  return (
    <InformationPage title="Why a GPX file is empty or missing data">
      <Text>
        A file can open without containing every route or measurement you
        expected. Start with what you downloaded, then use the matching section
        below. Missing data is not automatically a damaged file.
      </Text>

      <RecoveryStep
        title="You downloaded a ZIP file"
        effect="A ZIP is a container that can hold the GPX file. The viewer cannot open the container itself."
      >
        Extract or unzip the download, then choose the file that ends in .gpx.
        Do not rename the ZIP file to .gpx.
      </RecoveryStep>

      <RecoveryStep
        title="The file is FIT or TCX"
        effect="FIT and TCX are different activity-file formats. Changing the filename does not change the contents."
      >
        Return to the service that exported the activity and choose its GPX
        option when one is available and suitable. The current GPSGoblin viewer
        supports GPX 1.1, not FIT or TCX.
      </RecoveryStep>

      <RecoveryStep
        title="The GPX has no route"
        effect="The source may not have recorded GPS positions. Indoor activities often have time or training readings but no geographic path to put in GPX."
      >
        Check the original activity for a map or GPS track. If there is none, a
        new GPX export cannot recreate the missing positions. Keep the original
        activity file for its non-location data.
      </RecoveryStep>

      <RecoveryStep
        title="A long Garmin activity is incomplete"
        effect="Garmin says a very long activity can produce an empty GPX or leave out some data points."
      >
        Download the original FIT file as Garmin recommends. GPSGoblin cannot
        open FIT yet, so use a FIT-compatible tool rather than relying on the
        partial GPX.
      </RecoveryStep>

      <RecoveryStep
        title="The map works but a chart is missing"
        effect="The route positions are usable, but the file does not contain the readings needed for that chart."
      >
        Elevation needs height readings. Speed and pace need usable positions
        and times. Try another export from the source if it offers one, but a
        viewer cannot recover readings that were never included.
      </RecoveryStep>

      <RecoveryStep
        title="Device readings or navigation details are missing"
        effect="GPX exports often contain less information than the source service or device. GPSGoblin also limits what it displays."
      >
        Use the original service or file when you need heart rate, cadence,
        power, calories, planned waypoints, voice directions or device totals.
        GPSGoblin currently shows GPX routes and supported location, elevation
        and timing data; it does not restore omitted information.
      </RecoveryStep>

      <RecoveryStep
        title="The file is GPX 1.0 or malformed"
        effect="GPSGoblin tests GPX 1.1. A different version, broken XML or invalid coordinates can prevent the file from opening."
      >
        Export a fresh GPX 1.1 copy from the original source when possible. Do
        not edit the filename to claim a different version. GPSGoblin does not
        repair broken files.
      </RecoveryStep>

      <Box as="section" aria-labelledby="try-viewer-heading">
        <Stack gap={3}>
          <Heading as="h2" id="try-viewer-heading" size="xl">
            When the viewer can help
          </Heading>
          <Text>
            Open a GPX 1.1 file when you want to check whether it contains a
            route, elevation or timing data. Your file stays on your device and
            no account is required.
          </Text>
          <Link asChild minH="44px" alignContent="center">
            <NextLink href="/tools/gpx-file-viewer">
              Open the GPX File Viewer
            </NextLink>
          </Link>
          <Link asChild minH="44px" alignContent="center">
            <NextLink href="/help/how-to-get-a-gpx-file">
              Learn how to get a GPX file
            </NextLink>
          </Link>
        </Stack>
      </Box>

      <Box as="section" aria-labelledby="official-sources-heading">
        <Stack gap={3}>
          <Heading as="h2" id="official-sources-heading" size="xl">
            Official guidance for provider-specific problems
          </Heading>
          <Link
            href="https://support.garmin.com/en-GB/?faq=BBISz2o26Z37QlY14mTLF9"
            minH="44px"
            alignContent="center"
          >
            Garmin: empty or incomplete GPX exports
          </Link>
          <Link
            href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export"
            minH="44px"
            alignContent="center"
          >
            Strava: GPX exports and activities without GPS
          </Link>
        </Stack>
      </Box>

      <Text color="fg.muted" fontSize="sm">
        Provider limitations were checked against official documentation on 20
        September 2026. Provider account workflows were not tested.
      </Text>
    </InformationPage>
  );
};

export default GpxFileEmptyOrMissingDataPage;
