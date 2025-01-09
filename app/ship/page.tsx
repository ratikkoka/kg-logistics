'use client';
import Lottie from 'lottie-react';
import { Form, DatePicker, Input } from '@nextui-org/react';
import { getLocalTimeZone, today } from '@internationalized/date';

import truckAnimation from '../../public/truck.json';

export default function DocsPage() {
  return (
    <div>
      <Lottie animationData={truckAnimation} loop={true} />
      <div className='mt-3 flex w-full max-w-xl flex-row gap-4'>
        <Form
          className='w-full items-center justify-center space-y-4'
          validationBehavior='native'
        >
          <div className='mb-6 flex w-full flex-wrap gap-4 md:mb-0 md:flex-nowrap'>
            <Input
              isRequired
              errorMessage='Please enter a valid email'
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
        </Form>
      </div>
    </div>
  );
}
