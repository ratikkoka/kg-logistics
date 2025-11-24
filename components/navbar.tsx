'use client';
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import KGLogo from '../public/Logo.svg';

import { siteConfig } from '@/config/site';
import { createClient } from '@/lib/supabase/client';

export const Navbar = () => {
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <HeroUINavbar
      classNames={{
        base: ['bg-[#FFFAF0]'],
        item: [
          '[&>a]:data-[active=true]:text-transparent! bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text',
          '[&>a]:data-[active=true]:hover:opacity-100',
          '[&>a]:hover:opacity-50',
        ],
      }}
      isMenuOpen={isMenuOpen}
      maxWidth='2xl'
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarBrand>
        <Link className='flex items-center' color='foreground' href='/'>
          <Image
            alt='Logo'
            className='mr-2'
            height={32}
            src={KGLogo}
            width={32}
          />
          <p className='font-bold text-inherit'>KG Logistics</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className='hidden gap-4 sm:flex' justify='end'>
        {siteConfig.navItems.map((item, idx) => {
          if (idx < 3) {
            return (
              <NavbarItem key={item.href} isActive={pathName == item.href}>
                <Link color='foreground' href={item.href}>
                  {item.label}
                </Link>
              </NavbarItem>
            );
          }
        })}
        {isLoggedIn ? (
          <NavbarItem className='hidden lg:flex'>
            <Button
              as={Link}
              className='bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:opacity-80!'
              href='/dashboard'
              radius='full'
            >
              Dashboard
            </Button>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem className='hidden lg:flex'>
              <Button as={Link} href='/login' radius='full' variant='light'>
                Login
              </Button>
            </NavbarItem>
            <NavbarItem className='hidden lg:flex'>
              <Button
                as={Link}
                className='bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:opacity-80!'
                href='/ship'
                radius='full'
              >
                Get Started
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className='text-default-400 md:hidden'
      />
      <NavbarMenu className='bg-[#FFFAF0]'>
        {siteConfig.navItems.map((item, idx) => {
          if (idx < 3) {
            return (
              <NavbarMenuItem key={item.href} isActive={pathName == item.href}>
                <Link
                  color='foreground'
                  href={item.href}
                  onPress={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          }
        })}
        {isLoggedIn ? (
          <>
            {(pathName?.startsWith('/dashboard') ||
              pathName?.startsWith('/leads') ||
              pathName?.startsWith('/templates')) && (
              <>
                <NavbarMenuItem>
                  <Link
                    color='foreground'
                    href='/dashboard'
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                  <Link
                    color='foreground'
                    href='/templates'
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Templates
                  </Link>
                </NavbarMenuItem>
              </>
            )}
            {!pathName?.startsWith('/dashboard') &&
              !pathName?.startsWith('/leads') &&
              !pathName?.startsWith('/templates') && (
                <NavbarMenuItem>
                  <Button
                    as={Link}
                    className='bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:opacity-80!'
                    href='/dashboard'
                    radius='full'
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Button>
                </NavbarMenuItem>
              )}
          </>
        ) : (
          <>
            <NavbarMenuItem>
              <Link
                color='foreground'
                href='/login'
                onPress={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                as={Link}
                className='bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:opacity-80!'
                href='/ship'
                radius='full'
                onPress={() => setIsMenuOpen(false)}
              >
                Get Started
              </Button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
