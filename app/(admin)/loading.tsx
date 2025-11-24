'use client';

import { Spinner } from '@heroui/react';

export default function AdminLoading() {
  return (
    <div className='flex h-full items-center justify-center py-12'>
      <Spinner size='lg' />
    </div>
  );
}
