import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Quote Submitted | KG Logistics',
  description:
    'Thanks for trusting KG Logistics. A transport concierge will confirm route details, carrier insurance, and pickup timing shortly.',
  alternates: {
    canonical: absoluteUrl('/ship/success'),
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Quote Received | KG Logistics',
    description:
      'Your custom auto transport request is in review. Expect a curated shipping plan with vetted carriers within 24 hours.',
    url: absoluteUrl('/ship/success'),
    siteName: siteConfig.name,
  },
};

export default function ShipSuccessLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className='h-[calc(100vh-64px)]'>
      <div className='flex h-[calc(100vh-64px)] w-screen items-start justify-center p-8'>
        {children}
      </div>
    </section>
  );
}
