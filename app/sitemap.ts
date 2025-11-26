import type { MetadataRoute } from 'next';

import { sitemapRoutes } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes;
}
