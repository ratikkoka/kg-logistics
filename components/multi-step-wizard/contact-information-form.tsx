'use client';

import type { ContactInformation } from '@/types/forms';
import type { FormProps, InputProps } from '@heroui/react';

import { Controller, useForm } from 'react-hook-form';
import React from 'react';
import { Input } from '@heroui/react';
import { cn } from '@heroui/react';

import { localStorageService } from '@/utils/localStorage';
import {
  validateEmail,
  validatePhone,
  formatPhoneNumber,
} from '@/utils/validation';

export type ContactInformationFormProps = FormProps & {
  onNext: () => void;
};

const ContactInformationForm = React.forwardRef<
  HTMLFormElement,
  ContactInformationFormProps
>(({ className, onNext, ..._props }, _ref) => {
  const inputProps: Pick<InputProps, 'labelPlacement' | 'classNames'> = {
    labelPlacement: 'outside',
    classNames: {
      label:
        'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
    },
  };

  const { control, register, handleSubmit, setValue } =
    useForm<ContactInformation>({
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        tel: '',
      },
    });

  const onSubmit = (data: ContactInformation) => {
    localStorageService.set('contact-info', data);
    onNext();
  };

  React.useEffect(() => {
    const data = localStorageService.get<ContactInformation>('contact-info', {
      firstName: '',
      lastName: '',
      email: '',
      tel: '',
    });

    if (data && Object.keys(data).length > 0) {
      setValue('firstName', data.firstName || '');
      setValue('lastName', data.lastName || '');
      setValue('email', data.email || '');
      setValue('tel', data.tel || '');
    }
  }, [setValue]);

  return (
    <form id='contact-info' onSubmit={handleSubmit(onSubmit)}>
      <div className='text-default-foreground text-3xl leading-9 font-bold'>
        Contact Information
      </div>
      <div
        className={cn('flex grid grid-cols-12 flex-col gap-4 py-8', className)}
      >
        <Controller
          control={control}
          name='firstName'
          render={({ field }) => (
            <Input
              {...field}
              {...register('firstName')}
              isRequired
              className='col-span-12 md:col-span-6'
              errorMessage='First Name is required'
              label='First Name'
              placeholder='John'
              {...inputProps}
            />
          )}
        />

        <Controller
          control={control}
          name='lastName'
          render={({ field }) => (
            <Input
              {...field}
              {...register('lastName')}
              isRequired
              className='col-span-12 md:col-span-6'
              errorMessage='Last Name is required'
              label='Last Name'
              placeholder='doe'
              {...inputProps}
            />
          )}
        />

        <Controller
          control={control}
          name='email'
          render={({ field, fieldState }) => (
            <Input
              {...field}
              isRequired
              className='col-span-12 md:col-span-6'
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label='Email'
              placeholder='john.doe@gmail.com'
              type='email'
              {...inputProps}
            />
          )}
          rules={{
            required: 'Email is required',
            validate: (value) =>
              validateEmail(value) || 'Please enter a valid email address',
          }}
        />

        <Controller
          control={control}
          name='tel'
          render={({ field, fieldState }) => (
            <Input
              {...field}
              isRequired
              className='col-span-12 md:col-span-6'
              errorMessage={fieldState.error?.message}
              isInvalid={fieldState.invalid}
              label='Mobile Number'
              placeholder='xxx-xxx-xxxx'
              type='tel'
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);

                field.onChange(formatted);
              }}
              {...inputProps}
            />
          )}
          rules={{
            required: 'Mobile Number is required',
            validate: (value) =>
              validatePhone(value) ||
              'Please enter a valid 10-digit phone number',
          }}
        />
      </div>
    </form>
  );
});

ContactInformationForm.displayName = 'ContactInformationForm';

export default ContactInformationForm;
