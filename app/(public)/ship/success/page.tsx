'use client';

import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ShipSuccessPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const allowed = window.sessionStorage.getItem('ship-success-allowed');

    if (!allowed) {
      router.replace('/ship');

      return;
    }

    window.sessionStorage.removeItem('ship-success-allowed');
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className='text-default-700 flex h-full w-full flex-col items-center justify-center px-6 text-center'>
      <div className='mb-4 flex justify-center'>
        <Icon
          className='text-success'
          icon='solar:check-circle-bold'
          width={72}
        />
      </div>
      <h1 className='text-default-foreground text-3xl font-bold'>
        Your request was submitted successfully!
      </h1>
      <p className='mt-2 text-lg font-medium'>
        We&apos;ll reach out with a personalized shipping quote within 24 hours.
      </p>
      <div className='mx-auto my-6 mt-6 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row lg:mx-0'>
        <Button
          className='rounded-medium border-default-200 text-medium text-default-500 font-medium'
          variant='bordered'
          onPress={() => router.push('/')}
        >
          <Icon icon='solar:arrow-left-outline' width={24} />
          <span className='hidden sm:inline'>Return to Home</span>
          <span className='inline sm:hidden'>Home</span>
        </Button>
        <Button
          className='text-medium bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 font-medium text-white'
          onPress={() => router.push('/ship')}
        >
          <span className='hidden sm:inline'>Start Another Quote</span>
          <span className='inline sm:hidden'>Restart</span>
        </Button>
      </div>
    </div>
  );
}
