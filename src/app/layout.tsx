import type { Metadata } from 'next';
import { Provider } from '@/components/ui/provider';

export const metadata: Metadata = {
  title: 'GPSGoblin',
  referrer: 'strict-origin-when-cross-origin',
  description:
    'View your GPX route, elevation, speed and pace. Your file stays on your device.'
};

const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
};

export default RootLayout;
