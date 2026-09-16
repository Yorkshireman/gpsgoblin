import { Heading, Text } from '@chakra-ui/react';
import { InformationPage } from '@/components/InformationPage';
import { createPageMetadata } from '../siteMetadata';

export const metadata = createPageMetadata(
  '/limitations',
  'Support and limitations — GPSGoblin',
  'GPX formats and measurements GPSGoblin supports, tested browser and file examples, and practical limits when viewing large recordings.'
);

const LimitationsPage = () => {
  return (
    <InformationPage title="Support and limitations">
      <Text>
        GPSGoblin currently offers a GPX 1.1 viewer. It displays tracks,
        separate track sections, planned routes and waypoints, with available
        elevation and timing information.
      </Text>
      <Heading as="h2" size="xl">
        Files and measurements
      </Heading>
      <Text>
        GPX 1.0, FIT and TCX are not supported. Extra device fields such as
        heart rate, cadence and power are not interpreted. Files with broken
        structure or invalid coordinates are rejected; this tool does not repair
        them.
      </Text>
      <Text>
        Distance, speed and pace are calculated from recorded positions and
        times. GPS errors, missing readings and gaps can affect the results.
        Duration includes stops; a chart with chosen stops left out is not a
        measurement of your whole activity’s true moving time. Use the original
        recording when you need its original values.
      </Text>
      <Text>
        The map helps you inspect a recording. It is not a navigation service
        and does not check current access, hazards or whether a route is safe.
      </Text>
      <Heading as="h2" size="xl">
        Tested examples
      </Heading>
      <Text>
        Checks on macOS covered Chrome 153, Playwright Firefox 155 and WebKit
        26.6, including phone-sized layouts. These are desktop browser and
        engine checks, not tests on physical phones or native Safari.
      </Text>
      <Text>
        Synthetic 12-hour and 48-hour recordings, a 50,000-point file with 2,500
        separate sections and a file with additional device fields opened in all
        three engines. Chrome performance checks also opened a 250,000-point
        recording. These examples are not file limits or a guarantee for every
        recording.
      </Text>
      <Text>
        Real-file coverage includes a sanitised 8,142-point Strava recording and
        a Bikerouter planned route. This does not establish support for every
        file from those services.
      </Text>
      <Heading as="h2" size="xl">
        Large files and recovery
      </Heading>
      <Text>
        There is no fixed file-size or point-count cap. Available browser memory
        still matters, and large or complex files can make the page slow or
        cause the browser to close it. Physical-phone performance has not been
        verified.
      </Text>
      <Text>
        If opening a file takes too long, use Cancel import. A failed or
        cancelled replacement keeps the previous file open. Try closing other
        tabs or opening the file on a computer with more available memory.
      </Text>
      <Heading as="h2" size="xl">
        Map availability
      </Heading>
      <Text>
        Online map backgrounds need a connection and may be unavailable.
        Summaries and charts can still be used. If your browser cannot draw the
        map, use those results to inspect the file.
      </Text>
    </InformationPage>
  );
};

export default LimitationsPage;
