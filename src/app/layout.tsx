import type { Metadata } from 'next';
import { Provider } from '@/components/ui/provider';
import { SiteFooter } from '@/components/SiteFooter';
import { publicOrigin } from './siteMetadata';

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin),
  title: 'GPSGoblin',
  referrer: 'strict-origin-when-cross-origin',
  description:
    'View your GPX route, elevation, speed and pace. Your file stays on your device.'
};

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Provider>{children}<SiteFooter /></Provider>
      </body>
    </html>
  );
};

export default RootLayout;
