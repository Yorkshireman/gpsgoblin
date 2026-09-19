import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Box, Flex } from '@chakra-ui/react';
import { SiteHeader } from '@/components/SiteHeader';
import { Provider } from '@/components/ui/provider';
import { SiteFooter } from '@/components/SiteFooter';
import { publicOrigin } from './siteMetadata';

const sourceSans3 = localFont({
  src: './fonts/SourceSans3VF-Upright.woff2',
  weight: '200 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-source-sans-3',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Helvetica',
    'Arial',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol'
  ]
});

const fraunces = localFont({
  src: './fonts/Fraunces.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-fraunces',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Helvetica',
    'Arial',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol'
  ]
});

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin),
  title: 'GPSGoblin',
  referrer: 'strict-origin-when-cross-origin',
  description:
    'View your GPX route, elevation, speed and pace. Your file stays on your device.'
};

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html
      lang="en"
      className={`${sourceSans3.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Provider>
          <Flex direction="column" minH="100dvh">
            <SiteHeader />
            <Box flex="1" minH={0}>
              {children}
            </Box>
            <SiteFooter />
          </Flex>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
