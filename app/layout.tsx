import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import clsx from 'clsx';

import { Providers } from './providers';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import MainLayout from '@/components/mainLayout';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className='bg-[#FFFAF0]' lang='en'>
      <head>
        <meta charSet='UTF-8' />
        <meta content='width=device-width, initial-scale=1.0' name='viewport' />
        <script
          defer
          src='https://maps.googleapis.com/maps/api/js?key=AIzaSyDzB7zFJfIzOxd1_I2gzJZwtIvDgGJhAkg&libraries=places&callback=kg_auto_callback'
        />
      </head>
      <body
        className={clsx(
          'min-h-screen font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
