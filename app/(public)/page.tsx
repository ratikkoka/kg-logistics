import type { Metadata } from 'next';

import { HomeHero } from '@/components/home/home-hero';
import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ship Your Car Stress-Free',
  description:
    'KG Logistics pairs enthusiast care with vetted nationwide carriers for enclosed and open auto transport. Get insured quotes, and delivery support.',
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: 'KG Logistics | Premium Vehicle Shipping & Logistics',
    description:
      'Ship exotics & daily drivers with insured, door-to-door service.',
    url: absoluteUrl('/'),
    siteName: siteConfig.name,
  },
};

export default function Home() {
  return <HomeHero />;
}
