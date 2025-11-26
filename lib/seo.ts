import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

export const siteUrl = siteConfig.url || 'https://kg-logistics.vercel.app';

export const absoluteUrl = (path = '') => {
  if (path.startsWith('http')) return path;

  const formattedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  return `${siteUrl}${formattedPath}`;
};

export const sitemapRoutes: Array<MetadataRoute.Sitemap[number]> = [
  {
    url: absoluteUrl('/'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: absoluteUrl('/about'),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/contact'),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/ship'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
];

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteUrl,
  logo: absoluteUrl(siteConfig.ogImage),
  email: siteConfig.contact.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.contact.address.street,
    addressLocality: siteConfig.contact.address.locality,
    addressRegion: siteConfig.contact.address.region,
    postalCode: siteConfig.contact.address.postalCode,
    addressCountry: siteConfig.contact.address.country,
  },
  sameAs: siteConfig.socialProfiles,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: siteConfig.contact.email,
      areaServed: 'US',
      availableLanguage: ['English'],
    },
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
  inLanguage: 'en-US',
  publisher: {
    '@type': 'Organization',
    name: siteConfig.name,
  },
};
