import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/auth/',
          '/api/',
          '/dashboard',
          '/leads',
          '/loads',
          '/templates',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
