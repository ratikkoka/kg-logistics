'use client';

import type { User } from '@supabase/supabase-js';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { Button } from '@heroui/button';

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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

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
        setUser(session.user);
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
        setUser(null);
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className='hidden h-full shrink-0 lg:block'>
      <nav className='border-default-200 bg-default-50 flex h-full flex-col rounded-2xl border shadow-lg'>
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='mb-6'>
            <h2 className='text-default-900 text-2xl font-semibold'>Welcome</h2>
            <p className='text-default-500 truncate text-lg'>
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
        </div>
        <div className='border-default-200 border-t p-4'>
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
    </aside>
  );
}
