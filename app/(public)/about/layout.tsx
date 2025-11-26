import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About KG Logistics',
  description:
    'Learn how KG Logistics combines enthusiast-level care with vetted carriers to deliver secure nationwide enclosed and open auto transport.',
  alternates: {
    canonical: absoluteUrl('/about'),
  },
  openGraph: {
    title: 'About KG Logistics | Premium Auto Transport Specialists',
    description:
      'Get to know the KG Logistics founders, obsessive vehicle care standards, and why exotic owners trust our team for enclosed transport.',
    url: absoluteUrl('/about'),
    siteName: siteConfig.name,
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <section className='min-h-[calc(100vh-64px)]'>
      <div className='flex min-h-[calc(100vh-64px)] w-screen items-start justify-center p-8'>
        {children}
      </div>
    </section>
  );
}
