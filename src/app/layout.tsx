import type { Metadata } from 'next';
import { Provider } from '@/components/ui/provider';

export const metadata: Metadata = {
  title: 'GPSGoblin',
  description:
    'Open GPX files locally to inspect routes, elevation and available timing with metric or imperial units.'
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
