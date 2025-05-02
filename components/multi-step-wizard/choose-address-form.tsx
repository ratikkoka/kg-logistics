'use client';

import React from 'react';
import {
  Input,
  InputProps,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
} from '@heroui/react';
import { cn } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';
import usePlacesAutocomplete, { getDetails } from 'use-places-autocomplete';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

export type ChooseAddressFormProps = React.HTMLAttributes<HTMLFormElement> & {
  onNext: () => void;
};

const ChooseAddressForm = React.forwardRef<
  HTMLFormElement,
  ChooseAddressFormProps
>(({ className, onNext, ...props }, ref) => {
  const inputProps: Pick<InputProps, 'labelPlacement' | 'classNames'> = {
    labelPlacement: 'outside',
    classNames: {
      label:
        'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
    },
  };

  const { control, handleSubmit, setValue } = useForm();

  const {
    value: pickupValue,
    suggestions: { status: pickupStatus, data: pickupData },
    setValue: setPickupAutoCompleteValue,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: ['us'] } },
    callbackName: 'kg_auto_callback',
  });

  const {
    value: dropOffValue,
    suggestions: { status: dropOffStatus, data: dropOffData },
    setValue: setDropoffAutoCompleteValue,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: ['us'] } },
    callbackName: 'kg_auto_callback',
  });

  React.useEffect(() => {
    const data = JSON.parse(localStorage.getItem('address-info') ?? '{}');

    if (data && Object.keys(data).length > 0) {
      setPickupAutoCompleteValue(data.pickupAddress);
      setDropoffAutoCompleteValue(data.dropoffAddress);
      const [pickupYear, pickupMonth, pickupDay] = data.pickupDate
        .split('-')
        .map(Number);

      setValue(
        'pickupDate',
        new CalendarDate(pickupYear, pickupMonth, pickupDay)
      );

      if (data.dropoffDate) {
        const [dropoffYear, dropoffMonth, dropoffDay] = data.dropoffDate
          .split('-')
          .map(Number);

        setValue(
          'dropoffDate',
          new CalendarDate(dropoffYear, dropoffMonth, dropoffDay)
        );
      }

      setValue('pickupAddress', data.pickupAddress);
      setValue('pickupCity', data.pickupCity);
      setValue('pickupState', data.pickupState);
      setValue('pickupZip', data.pickupZip);
      setValue('dropoffAddress', data.dropoffAddress);
      setValue('dropoffCity', data.dropoffCity);
      setValue('dropoffState', data.dropoffState);
      setValue('dropoffZip', data.dropoffZip);
    }
  }, [setValue]);

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      pickupDate: data.pickupDate?.toString(),
      dropoffDate: data.dropoffDate?.toString(),
    };

    localStorage.setItem('address-info', JSON.stringify(formattedData));
    onNext();
  };

  const handlePickupInput = (value: string) => {
    setPickupAutoCompleteValue(value);
  };

  const handlePickupSelectionChange = (key: React.Key | null) => {
    if (key !== null) {
      const param = { placeId: key as string };

      getDetails(param).then((details: any) => {
        const fullAddress = details.formatted_address.split(', ');
        const street = fullAddress[0];
        const city = fullAddress[1];
        const stateZip = fullAddress[2].split(' ');
        const state = stateZip[0];
        const zip = stateZip[1];

        setPickupAutoCompleteValue(street, false);
        setValue('pickupAddress', street);
        setValue('pickupCity', city);
        setValue('pickupState', state);
        setValue('pickupZip', zip);
      });
    }
  };

  const handleDropoffInput = (value: string) => {
    setDropoffAutoCompleteValue(value);
  };

  const handleDropoffSelectionChange = (key: React.Key | null) => {
    if (key !== null) {
      const param = { placeId: key as string };

      getDetails(param).then((details: any) => {
        const fullAddress = details.formatted_address.split(', ');
        const street = fullAddress[0];
        const city = fullAddress[1];
        const stateZip = fullAddress[2].split(' ');
        const state = stateZip[0];
        const zip = stateZip[1];

        setDropoffAutoCompleteValue(street, false);
        setValue('dropoffAddress', street);
        setValue('dropoffCity', city);
        setValue('dropoffState', state);
        setValue('dropoffZip', zip);
      });
    }
  };

  return (
    <>
      <div className='text-3xl font-bold leading-9 text-default-foreground'>
        Address Information
      </div>
      <div className='py-4 text-default-500'>
        Please provide the pickup and dropoff addresses
      </div>
      <form
        ref={ref}
        className={cn('flex flex-col gap-4 py-8', className)}
        id='address-info'
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        <div className='text-xl font-semibold text-default-700'>
          Pickup and Dropoff Dates
        </div>
        <div className='grid grid-cols-12 gap-4'>
          <Controller
            control={control}
            name='pickupDate'
            render={({ field }) => (
              <DatePicker
                {...field}
                isRequired
                className='col-span-6 md:col-span-6'
                label='Earliest Pickup Date'
                minValue={today(getLocalTimeZone()).add({ days: 1 })}
                {...inputProps}
              />
            )}
          />
          <Controller
            control={control}
            name='dropoffDate'
            render={({ field }) => (
              <DatePicker
                {...field}
                className='col-span-6 md:col-span-6'
                label='Preffered Dropoff Date'
                minValue={today(getLocalTimeZone()).add({ days: 2 })}
                {...inputProps}
              />
            )}
          />
        </div>
        <div className='mt-10 text-xl font-semibold text-default-700'>
          Pickup Address
        </div>
        <Controller
          control={control}
          name='pickupAddress'
          render={({ field }) => (
            <Autocomplete
              {...field}
              allowsCustomValue
              isRequired
              className='col-span-12'
              errorMessage='Pickup address is required'
              inputValue={pickupValue}
              label='Street Address'
              placeholder='Enter pickup address'
              onInputChange={handlePickupInput}
              onSelectionChange={handlePickupSelectionChange}
              {...inputProps}
            >
              {pickupStatus === 'OK'
                ? pickupData.map(({ place_id, description }) => (
                    <AutocompleteItem key={place_id}>
                      {description}
                    </AutocompleteItem>
                  ))
                : []}
            </Autocomplete>
          )}
        />
        <div className='grid grid-cols-12 gap-4'>
          <Controller
            control={control}
            name='pickupCity'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                className='col-span-6 md:col-span-4'
                errorMessage='Pickup city is required'
                label='City'
                placeholder='Enter city'
                {...inputProps}
              />
            )}
          />
          <Controller
            control={control}
            name='pickupState'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                className='col-span-6 md:col-span-4'
                errorMessage='Pickup state is required'
                label='State'
                placeholder='Enter state'
                {...inputProps}
              />
            )}
          />
          <Controller
            control={control}
            name='pickupZip'
            render={({ field }) => (
              <Input
                {...field}
                isRequired
                className='col-span-6 md:col-span-4'
                errorMessage='Pickup zip code is required'
                label='Zip Code'
                placeholder='Enter zip code'
                {...inputProps}
              />
            )}
          />
        </div>

        <div className='mt-10 text-xl font-semibold text-default-700'>
          Dropoff Address
        </div>
        <Controller
          control={control}
          name='dropoffAddress'
          render={({ field, fieldState }) => (
            <Autocomplete
              {...field}
              allowsCustomValue
              isRequired
              className='col-span-12'
              errorMessage='Dropoff address is required'
              inputValue={dropOffValue}
              label='Street Address'
              placeholder='Enter pickup address'
              onInputChange={handleDropoffInput}
              onSelectionChange={handleDropoffSelectionChange}
              {...inputProps}
            >
              {dropOffStatus === 'OK'
                ? dropOffData.map(({ place_id, description }) => (
                    <AutocompleteItem key={place_id}>
                      {description}
                    </AutocompleteItem>
                  ))
                : []}
            </Autocomplete>
          )}
        />
        <div className='grid grid-cols-12 gap-4'>
          <Controller
            control={control}
            name='dropoffCity'
            render={({ field, fieldState }) => (
              <Input
                {...field}
                isRequired
                className='col-span-6 md:col-span-4'
                errorMessage='Dropoff city is required'
                label='City'
                placeholder='Enter city'
                {...inputProps}
              />
            )}
          />
          <Controller
            control={control}
            name='dropoffState'
            render={({ field, fieldState }) => (
              <Input
                {...field}
                isRequired
                className='col-span-6 md:col-span-4'
                errorMessage='Dropoff state is required'
                label='State'
                placeholder='Enter state'
                {...inputProps}
              />
            )}
          />
          <Controller
            control={control}
            name='dropoffZip'
            render={({ field, fieldState }) => (
              <Input
                {...field}
                isRequired
                className='col-span-6 md:col-span-4'
                errorMessage='Dropoff zip code is required'
                label='Zip Code'
                placeholder='Enter zip code'
                {...inputProps}
              />
            )}
          />
        </div>
      </form>
    </>
  );
});

ChooseAddressForm.displayName = 'ChooseAddressForm';

export default ChooseAddressForm;
