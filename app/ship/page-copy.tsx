'use client';
import Lottie from 'lottie-react';
import {
  cn,
  Form,
  DatePicker,
  Input,
  RadioGroup,
  Radio,
  InputProps,
  RadioGroupProps,
} from '@heroui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import React from 'react';

import truckAnimation from '../../public/truck.json';

export default function DocsPage() {
  const [selected, setSelected] = React.useState('text');

  const inputProps: Pick<InputProps, 'labelPlacement' | 'classNames'> = {
    labelPlacement: 'outside',
    classNames: {
      label:
        'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
    },
  };

  const radioProps: Pick<RadioGroupProps, 'classNames'> = {
    classNames: {
      label:
        'text-left text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
      wrapper: 'gap-4',
    },
  };

  return (
    <div>
      <Lottie animationData={truckAnimation} loop={true} />
      <div className='relative flex h-fit w-full flex-col pt-6 text-center lg:h-full lg:justify-center lg:pt-0'>
        <Form
          className={cn('flex grid grid-cols-12 flex-col gap-4 py-8')}
          validationBehavior='native'
        >
          <Input
            className='col-span-12 md:col-span-6'
            label='First Name'
            name='first-name'
            placeholder='Type your first name here'
            {...inputProps}
          />

          <Input
            className='col-span-12 md:col-span-6'
            label='Last Name'
            name='last-name'
            placeholder='Type your last name here'
            {...inputProps}
          />

          <RadioGroup
            className='col-span-12'
            label='Preffered contact method'
            orientation='horizontal'
            value={selected}
            onValueChange={setSelected}
            {...radioProps}
          >
            <Radio value='email'>Email</Radio>
            <Radio value='text'>Text</Radio>
          </RadioGroup>

          <Input
            className='col-span-12 md:col-span-6'
            label='Email'
            name='email'
            placeholder='john.doe@gmail.com'
            type='email'
            {...inputProps}
          />

          <Input
            className='col-span-12 md:col-span-6'
            label='Mobile number'
            name='tel'
            placeholder=''
            type='tel'
            {...inputProps}
          />

          <DatePicker
            className='col-span-12 md:col-span-6'
            defaultValue={today(getLocalTimeZone()).add({ days: 2 })}
            label='Pickup Date'
            labelPlacement='outside'
            minValue={today(getLocalTimeZone()).add({ days: 2 })}
          />

          <Input
            className='col-span-12 md:col-span-6'
            label='Confirm Password'
            name='confirm-password'
            placeholder='*********'
            type='password'
            {...inputProps}
          />
        </Form>
      </div>
    </div>
  );
}
