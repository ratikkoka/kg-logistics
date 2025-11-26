const fallbackSiteUrl = 'https://kg-logistics.vercel.app';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'KG Logistics',
  description:
    'Concierge-level, fully insured vehicle shipping for enthusiasts, collectors, and dealerships across the continental United States.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, ''),
  ogImage: '/Logo.svg',
  keywords: [
    'auto transport',
    'vehicle shipping',
    'enclosed car transport',
    'exotic car shipping',
    'nationwide car hauler',
    'KG Logistics',
    'door to door auto transport',
  ],
  contact: {
    email:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@kgautologistics.com',
    address: {
      street:
        process.env.NEXT_PUBLIC_CONTACT_STREET ||
        '15117 Main St, Suite 205 Unit #988',
      locality: process.env.NEXT_PUBLIC_CONTACT_CITY || 'Mill Creek',
      region: process.env.NEXT_PUBLIC_CONTACT_REGION || 'WA',
      postalCode: process.env.NEXT_PUBLIC_CONTACT_POSTAL || '98012',
      country: process.env.NEXT_PUBLIC_CONTACT_COUNTRY || 'USA',
    },
  },
  socialProfiles: [
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ||
      'https://www.facebook.com/p/KG-Auto-Logistics-61567521187816/',
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ||
      'https://www.instagram.com/kgalogistics/',
  ].filter((profile): profile is string => Boolean(profile)),
  navItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Contact Us',
      href: '/contact',
    },
    {
      label: 'Ship Now',
      href: '/ship',
    },
  ],
};
