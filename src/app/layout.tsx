import type { Metadata } from 'next';
import { Provider } from '@/components/ui/provider';

export const metadata: Metadata = {
  title: 'GPSGoblin',
  description:
    'Open GPX files locally to inspect routes, track segments and calculated distance—free and entirely in your browser.'
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en'>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
