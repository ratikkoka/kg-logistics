'use client';
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from '@nextui-org/navbar';
import { Button } from '@nextui-org/button';
import { Link } from '@nextui-org/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import KGLogo from '../public/Logo.svg';

import { siteConfig } from '@/config/site';

export const Navbar = () => {
  const pathName = usePathname();

  return (
    <NextUINavbar
      classNames={{
        base: ['bg-[#FFFAF0]'],
        item: [
          '[&>a]:data-[active=true]:!text-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text',
          '[&>a]:data-[active=true]:hover:opacity-100',
          '[&>a]:hover:opacity-50',
        ],
      }}
      maxWidth='2xl'
    >
      <NavbarBrand>
        <Image
          alt='Logo'
          className='mr-2'
          height={32}
          src={KGLogo}
          width={32}
        />
        <p className='font-bold text-inherit'>KG Logistics</p>
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
        <NavbarItem className='hidden lg:flex'>
          <Button
            as={Link}
            className='bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg hover:!opacity-80'
            href='/ship'
            radius='full'
          >
            Get Started
          </Button>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
