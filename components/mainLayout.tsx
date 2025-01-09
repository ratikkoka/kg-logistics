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
          'container mx-auto flex flex-1 flex-col items-center overflow-hidden px-8',
          pathName !== '/ship' && 'justify-center'
        )}
      >
        {children}
      </main>
      <footer className='flex w-full items-center justify-center py-3' />
    </div>
  );
}
