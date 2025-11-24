'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/button';
import clsx from 'clsx';

import { createClient } from '@/lib/supabase/client';

const navItems = [
  {
    title: 'Leads',
    href: '/dashboard',
    icon: 'solar:graph-up-outline',
  },
  {
    title: 'Loads',
    href: '/loads',
    icon: 'solar:box-outline',
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: 'solar:user-outline',
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: 'solar:document-text-outline',
  },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Try to get name from user metadata first
        let name =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name;

        // If no name in metadata, try to fetch from profile
        if (!name) {
          try {
            const response = await fetch(`/api/user/profile?userId=${user.id}`);

            if (response.ok) {
              const profile = await response.json();

              name = profile.name;
            }
          } catch {
            // Ignore errors
          }
        }

        // Fallback to email username or "User"
        setUserName(name || user.email?.split('@')[0] || 'User');
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        let name =
          session.user.user_metadata?.name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.display_name;

        if (!name) {
          try {
            const response = await fetch(
              `/api/user/profile?userId=${session.user.id}`
            );

            if (response.ok) {
              const profile = await response.json();

              name = profile.name;
            }
          } catch {
            // Ignore errors
          }
        }

        setUserName(name || session.user.email?.split('@')[0] || 'User');
      } else {
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
    setIsOpen(false);
  };

  return (
    <div className='lg:hidden'>
      <Button
        isIconOnly
        className='fixed top-20 right-4 z-50 rounded-full shadow-lg'
        variant='light'
        onPress={() => setIsOpen(!isOpen)}
      >
        <Icon
          icon={
            isOpen
              ? 'solar:close-circle-outline'
              : 'solar:menu-dots-circle-outline'
          }
          width={24}
        />
      </Button>
      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/50'
            role='button'
            tabIndex={0}
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
          />
          <nav className='border-default-200 bg-default-50 fixed top-28 right-4 z-50 w-64 rounded-2xl border p-4 shadow-lg'>
            <div className='border-default-200 mb-4 border-b pb-4'>
              <h3 className='text-default-900 text-xl font-semibold'>
                Welcome
              </h3>
              <p className='text-default-500 truncate text-base'>
                {userName || 'Loading...'}
              </p>
            </div>
            <ul className='space-y-1'>
              {navItems.map((item) => {
                const isActive =
                  item.href === pathname ||
                  (item.href === '/dashboard' &&
                    pathname?.startsWith('/leads')) ||
                  (item.href === '/contacts' &&
                    pathname?.startsWith('/contacts')) ||
                  (item.href === '/loads' && pathname?.startsWith('/loads'));

                return (
                  <li key={item.href}>
                    <Link
                      className={clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-default-600 hover:bg-default-100 hover:text-default-900'
                      )}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => {
                        // Prefetch on hover for faster navigation
                        router.prefetch(item.href);
                      }}
                    >
                      <Icon icon={item.icon} width={20} />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className='border-default-200 mt-4 border-t pt-4'>
              <Button
                className='text-default-600 w-full justify-start'
                startContent={<Icon icon='solar:logout-2-outline' width={20} />}
                variant='light'
                onPress={handleLogout}
              >
                Logout
              </Button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
