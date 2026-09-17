import type { Metadata } from 'next';

export const publicOrigin = 'https://gpsgoblin.com';

export const createPageMetadata = (
  path: string,
  title: string,
  description: string
): Metadata => {
  const url = new URL(path, publicOrigin).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'GPSGoblin',
      type: 'website'
    }
  };
};
