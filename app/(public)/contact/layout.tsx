import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact KG Logistics',
  description:
    'Have questions about enclosed or open auto transport? Reach the KG Logistics team for rapid quotes, carrier vetting details, or shipping timelines.',
  alternates: {
    canonical: absoluteUrl('/contact'),
  },
  openGraph: {
    title: 'Contact KG Logistics | Request a Custom Auto Transport Quote',
    description:
      'Connect with KG Logistics for expert guidance on coast-to-coast shipping, insurance coverage, timelines, and concierge-level updates.',
    url: absoluteUrl('/contact'),
    siteName: siteConfig.name,
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <section className='min-h-[calc(100vh-64px)]'>
      <div className='flex min-h-[calc(100vh-64px)] w-screen items-start justify-center p-8'>
        {children}
      </div>
    </section>
  );
}
