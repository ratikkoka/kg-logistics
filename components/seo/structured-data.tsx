import Script from 'next/script';

import { organizationSchema, websiteSchema } from '@/lib/seo';

export function StructuredData() {
  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
        id='kg-organization-schema'
        strategy='afterInteractive'
        type='application/ld+json'
      />
      <Script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
        id='kg-website-schema'
        strategy='afterInteractive'
        type='application/ld+json'
      />
    </>
  );
}
