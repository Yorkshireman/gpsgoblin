import type { Metadata } from 'next';
import localFont from 'next/font/local';
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
          {children}
          <SiteFooter />
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
