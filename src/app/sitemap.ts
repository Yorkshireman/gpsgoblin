import type { MetadataRoute } from 'next';
import { publicOrigin } from './siteMetadata';

export const dynamic = 'force-static';

const sitemap = (): MetadataRoute.Sitemap => {
  return ['/', '/tools/gpx-file-viewer', '/privacy', '/limitations'].map((path) => {
    return { url: new URL(path, publicOrigin).href };
  });
};

export default sitemap;
