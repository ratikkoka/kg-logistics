import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ship a Vehicle with KG Logistics',
  description:
    'Ship exotics & daily drivers with insured, door-to-door service.',
  alternates: {
    canonical: absoluteUrl('/ship'),
  },
  openGraph: {
    title: 'Ship Now | Auto Transport Quotes from KG Logistics',
    description:
      'Share pickup, delivery, and vehicle details to receive a fully insured transport plan tailored to your vehicle.',
    url: absoluteUrl('/ship'),
    siteName: siteConfig.name,
  },
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <section className='flex h-[calc(100vh-64px)] min-h-0 flex-col'>
      <div className='flex h-full min-h-0 w-screen items-start justify-center p-8'>
        {children}
      </div>
    </section>
  );
}
