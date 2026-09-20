import type { MetadataRoute } from 'next';
import { publicOrigin } from './siteMetadata';

export const dynamic = 'force-static';

const sitemap = (): MetadataRoute.Sitemap => {
  return [
    '/',
    '/tools/gpx-file-viewer',
    '/help/how-to-get-a-gpx-file',
    '/help/gpx-file-empty-or-missing-data',
    '/privacy',
    '/limitations'
  ].map((path) => {
    return { url: new URL(path, publicOrigin).href };
  });
};

export default sitemap;
