'use client';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import { Navbar } from '@/components/navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();

  return (
    <div className='relative flex h-screen flex-col'>
      <Navbar />
      <main
        className={clsx(
          'h-[calc(100vh-64px)]',
          pathName !== '/ship' &&
            'container mx-auto flex flex-1 flex-col items-center justify-center px-8'
        )}
      >
        {children}
      </main>
      <footer className='flex w-full items-center justify-center py-3' />
    </div>
  );
}
