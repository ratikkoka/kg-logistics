'use client';
import Lottie from 'lottie-react';
import { DatePicker, Input } from '@nextui-org/react';
import { getLocalTimeZone, today } from '@internationalized/date';

import truckAnimation from '../../public/truck.json';

export default function DocsPage() {
  return (
    <div>
      <Lottie animationData={truckAnimation} loop={true} />
      <div className='flex w-full max-w-xl flex-row gap-4'>
        <div className='mb-6 flex w-full flex-wrap gap-4 md:mb-0 md:flex-nowrap'>
          <Input
            label='Email'
            labelPlacement='outside'
            placeholder='you@example.com'
            type='email'
          />
          <DatePicker
            defaultValue={today(getLocalTimeZone()).add({ days: 2 })}
            label='Pickup Date'
            labelPlacement='outside'
            minValue={today(getLocalTimeZone()).add({ days: 2 })}
          />
        </div>
      </div>
    </div>
  );
}
