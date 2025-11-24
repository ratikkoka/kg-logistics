'use client';

import Link from 'next/link';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { Icon } from '@iconify/react';

export default function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#FFFAF0] px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='flex flex-col items-center gap-2'>
          <Icon
            className='text-warning'
            icon='solar:shield-warning-outline'
            width={64}
          />
          <h2 className='text-center text-3xl font-bold text-gray-900'>
            Access Denied
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            You don&apos;t have permission to access this page.
          </p>
        </CardHeader>
        <CardBody>
          <div className='flex flex-col gap-4'>
            <p className='text-center text-sm text-gray-500'>
              If you believe this is an error, please contact your administrator
              to request access.
            </p>
            <Button as={Link} className='w-full' color='primary' href='/'>
              Go to Home
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
