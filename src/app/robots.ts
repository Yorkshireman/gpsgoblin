import type { MetadataRoute } from 'next';
import { publicOrigin } from './siteMetadata';

export const dynamic = 'force-static';

const robots = (): MetadataRoute.Robots => {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${publicOrigin}/sitemap.xml`
  };
};

export default robots;
