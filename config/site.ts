export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'KG Logistics',
  description: 'Shipping your exotic, made easy.',
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
  links: {
    github: 'https://github.com/heroui/heroui',
    twitter: 'https://twitter.com/getnextui',
    docs: 'https://heroui.org',
    discord: 'https://discord.gg/9b6yyZKmH4',
    sponsor: 'https://patreon.com/jrgarciadev',
  },
};
