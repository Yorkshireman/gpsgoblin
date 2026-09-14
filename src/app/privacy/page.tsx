import { Heading, Link, Text } from '@chakra-ui/react';
import { InformationPage } from '@/components/InformationPage';
import { createPageMetadata } from '../siteMetadata';

export const metadata = createPageMetadata('/privacy', 'Privacy — GPSGoblin',
  'How GPSGoblin keeps your activity file on your device, what online maps request, and how cookies, advertising and analytics are handled.');

const PrivacyPage = () => {
  return (
    <InformationPage title='Privacy'>
      <Text>Your activity file stays on your device. GPSGoblin does not upload your file, its name or its contents.</Text>
      <Heading as='h2' size='xl'>Your file and choices</Heading>
      <Text>The viewer holds your file and results while you use the tool. Clearing the file, refreshing or leaving the tool closes it and resets your choices. GPSGoblin does not save activity files in browser storage or offer cloud storage. Your original file is unchanged.</Text>
      <Heading as='h2' size='xl'>Online maps</Heading>
      <Text>Map backgrounds come from OpenStreetMap. Your browser requests map images for the area you view. These requests reveal that area, your IP address and ordinary connection information, including the GPSGoblin site address, to the OpenStreetMap Foundation. Your imported file and route overlay are not sent.</Text>
      <Text>If map backgrounds cannot load, your route, summaries and charts remain available where your browser can display them.</Text>
      <Link href='https://osmfoundation.org/wiki/Privacy_Policy' minH='44px'>OpenStreetMap Foundation privacy policy</Link>
      <Heading as='h2' size='xl'>Website hosting</Heading>
      <Text>Cloudflare serves the website and receives ordinary web requests, including your IP address and the page or asset requested. These requests do not contain your imported activity file. Cloudflare controls its own handling of connection information.</Text>
      <Link href='https://www.cloudflare.com/privacypolicy/' minH='44px'>Cloudflare privacy policy</Link>
      <Heading as='h2' size='xl'>Cookies, storage and consent</Heading>
      <Text>GPSGoblin does not set advertising or analytics cookies, run product analytics, show advertisements or use session recording. There is no advertising or analytics consent choice to make in this version.</Text>
      <Text>The page uses your browser’s colour preference for its appearance. GPSGoblin can read a saved light or dark colour preference in your browser. It does not store activity data there. Your browser may cache website assets and map images.</Text>
    </InformationPage>
  );
};

export default PrivacyPage;
