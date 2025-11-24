'use client';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import clsx from 'clsx';

import { Navbar } from '@/components/navbar';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminMobileNav from '@/components/admin/admin-mobile-nav';

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathName = usePathname();
  const isAdminRoute =
    pathName?.startsWith('/dashboard') ||
    pathName?.startsWith('/leads') ||
    pathName?.startsWith('/contacts') ||
    pathName?.startsWith('/loads') ||
    pathName?.startsWith('/templates') ||
    pathName?.startsWith('/users') ||
    pathName?.startsWith('/login');
  const isShipRoute = pathName === '/ship';

  return (
    <div className='relative flex h-screen flex-col'>
      <Navbar />
      {isAdminRoute && !pathName?.startsWith('/login') ? (
        <div className='flex h-[calc(100vh-64px)] overflow-hidden'>
          <div className='hidden w-64 shrink-0 flex-col px-4 py-4 lg:flex'>
            <AdminSidebar />
          </div>
          <main className='flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-8'>
            {children}
          </main>
          <AdminMobileNav />
        </div>
      ) : (
        <main
          className={clsx(
            'h-[calc(100vh-64px)]',
            isShipRoute && 'overflow-hidden',
            !isShipRoute &&
              !isAdminRoute &&
              'container mx-auto flex flex-1 flex-col items-center justify-center px-8',
            isAdminRoute && 'overflow-y-auto'
          )}
        >
          {children}
        </main>
      )}
      <footer className='flex w-full items-center justify-center py-3' />
    </div>
  );
}
