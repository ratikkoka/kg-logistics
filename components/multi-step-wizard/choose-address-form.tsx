'use client';

import type { AddressInformation } from '@/types/forms';

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

import { localStorageService } from '@/utils/localStorage';
import { parseAddress, parseAddressComponents } from '@/utils/address';

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

  const datePickerProps = {
    classNames: {
      label:
        'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
    },
  };

  type AddressFormData = Omit<
    AddressInformation,
    'pickupDate' | 'dropoffDate'
  > & {
    pickupDate?: CalendarDate;
    dropoffDate?: CalendarDate;
  };

  const { control, handleSubmit, setValue } = useForm<AddressFormData>({
    defaultValues: {
      pickupDate: undefined,
      dropoffDate: undefined,
      pickupAddress: '',
      pickupCity: '',
      pickupState: '',
      pickupZip: '',
      dropoffAddress: '',
      dropoffCity: '',
      dropoffState: '',
      dropoffZip: '',
    },
  });

  const {
    value: pickupValue,
    suggestions: { status: pickupStatus, data: pickupData },
    setValue: setPickupAutoCompleteValue,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: ['us'] } },
  });

  const {
    value: dropOffValue,
    suggestions: { status: dropOffStatus, data: dropOffData },
    setValue: setDropoffAutoCompleteValue,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: ['us'] } },
  });

  React.useEffect(() => {
    const data = localStorageService.get<AddressInformation>('address-info', {
      pickupDate: '',
      dropoffDate: '',
      pickupAddress: '',
      pickupCity: '',
      pickupState: '',
      pickupZip: '',
      dropoffAddress: '',
      dropoffCity: '',
      dropoffState: '',
      dropoffZip: '',
    });

    if (data && Object.keys(data).length > 0) {
      if (data.pickupAddress) {
        setPickupAutoCompleteValue(data.pickupAddress);
      }
      if (data.dropoffAddress) {
        setDropoffAutoCompleteValue(data.dropoffAddress);
      }

      if (data.pickupDate) {
        try {
          const dateStr =
            typeof data.pickupDate === 'string'
              ? data.pickupDate
              : data.pickupDate.toString();
          const [pickupYear, pickupMonth, pickupDay] = dateStr
            .split('-')
            .map(Number);

          if (!isNaN(pickupYear) && !isNaN(pickupMonth) && !isNaN(pickupDay)) {
            setValue(
              'pickupDate',
              new CalendarDate(pickupYear, pickupMonth, pickupDay)
            );
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error parsing pickup date:', error);
        }
      }

      if (data.dropoffDate) {
        try {
          const dateStr =
            typeof data.dropoffDate === 'string'
              ? data.dropoffDate
              : data.dropoffDate.toString();
          const [dropoffYear, dropoffMonth, dropoffDay] = dateStr
            .split('-')
            .map(Number);

          if (
            !isNaN(dropoffYear) &&
            !isNaN(dropoffMonth) &&
            !isNaN(dropoffDay)
          ) {
            setValue(
              'dropoffDate',
              new CalendarDate(dropoffYear, dropoffMonth, dropoffDay)
            );
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error parsing dropoff date:', error);
        }
      }

      setValue('pickupAddress', data.pickupAddress || '');
      setValue('pickupCity', data.pickupCity || '');
      setValue('pickupState', data.pickupState || '');
      setValue('pickupZip', data.pickupZip || '');
      setValue('dropoffAddress', data.dropoffAddress || '');
      setValue('dropoffCity', data.dropoffCity || '');
      setValue('dropoffState', data.dropoffState || '');
      setValue('dropoffZip', data.dropoffZip || '');
    }
  }, [setValue, setPickupAutoCompleteValue, setDropoffAutoCompleteValue]);

  const onSubmit = (data: AddressFormData) => {
    const formattedData: AddressInformation = {
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      pickupState: data.pickupState,
      pickupZip: data.pickupZip,
      dropoffAddress: data.dropoffAddress,
      dropoffCity: data.dropoffCity,
      dropoffState: data.dropoffState,
      dropoffZip: data.dropoffZip,
      pickupDate: data.pickupDate?.toString() || '',
      dropoffDate: data.dropoffDate?.toString() || '',
    };

    localStorageService.set('address-info', formattedData);
    onNext();
  };

  const handlePickupInput = (value: string) => {
    setPickupAutoCompleteValue(value);
  };

  const handlePickupSelectionChange = (value: React.Key | null) => {
    if (value === null) return;

    const param = { placeId: String(value) };

    getDetails(param)
      .then((details) => {
        if (!details || typeof details === 'string') {
          // eslint-disable-next-line no-console
          console.error('Invalid address details');

          return;
        }

        // Try to parse from address_components first (more reliable)
        if (
          details.address_components &&
          Array.isArray(details.address_components)
        ) {
          const parsed = parseAddressComponents(details.address_components);

          if (parsed) {
            setPickupAutoCompleteValue(parsed.street, false);
            setValue('pickupAddress', parsed.street);
            setValue('pickupCity', parsed.city);
            setValue('pickupState', parsed.state);
            setValue('pickupZip', parsed.zip);

            return;
          }
        }

        // Fallback to parsing formatted_address
        if (details.formatted_address) {
          const parsed = parseAddress(details.formatted_address);

          if (parsed) {
            setPickupAutoCompleteValue(parsed.street, false);
            setValue('pickupAddress', parsed.street);
            setValue('pickupCity', parsed.city);
            setValue('pickupState', parsed.state);
            setValue('pickupZip', parsed.zip);
          } else {
            // Final fallback to manual entry
            setPickupAutoCompleteValue(details.formatted_address, false);
            setValue('pickupAddress', details.formatted_address);
          }
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error getting address details:', error);
      });
  };

  const handleDropoffInput = (value: string) => {
    setDropoffAutoCompleteValue(value);
  };

  const handleDropoffSelectionChange = (value: React.Key | null) => {
    if (value === null) return;

    const param = { placeId: String(value) };

    getDetails(param)
      .then((details) => {
        if (!details || typeof details === 'string') {
          // eslint-disable-next-line no-console
          console.error('Invalid address details');

          return;
        }

        // Try to parse from address_components first (more reliable)
        if (
          details.address_components &&
          Array.isArray(details.address_components)
        ) {
          const parsed = parseAddressComponents(details.address_components);

          if (parsed) {
            setDropoffAutoCompleteValue(parsed.street, false);
            setValue('dropoffAddress', parsed.street);
            setValue('dropoffCity', parsed.city);
            setValue('dropoffState', parsed.state);
            setValue('dropoffZip', parsed.zip);

            return;
          }
        }

        // Fallback to parsing formatted_address
        if (details.formatted_address) {
          const parsed = parseAddress(details.formatted_address);

          if (parsed) {
            setDropoffAutoCompleteValue(parsed.street, false);
            setValue('dropoffAddress', parsed.street);
            setValue('dropoffCity', parsed.city);
            setValue('dropoffState', parsed.state);
            setValue('dropoffZip', parsed.zip);
          } else {
            // Final fallback to manual entry
            setDropoffAutoCompleteValue(details.formatted_address, false);
            setValue('dropoffAddress', details.formatted_address);
          }
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error getting address details:', error);
      });
  };

  return (
    <>
      <div className='text-default-foreground text-3xl leading-9 font-bold'>
        Address Information
      </div>
      <div className='text-default-500 py-4'>
        Please provide the pickup and dropoff addresses
      </div>
      <form
        ref={ref}
        className={cn('flex flex-col gap-4 py-8', className)}
        id='address-info'
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        <div className='text-default-700 text-xl font-semibold'>
          Pickup and Dropoff Dates
        </div>
        <div className='grid grid-cols-12 gap-4'>
          <Controller
            control={control}
            name='pickupDate'
            render={({ field }) => (
              <DatePicker
                isRequired
                className='col-span-6 md:col-span-6'
                label='Earliest Pickup Date'
                labelPlacement='outside'
                minValue={today(getLocalTimeZone()).add({ days: 1 })}
                value={field.value}
                onChange={field.onChange}
                {...datePickerProps}
              />
            )}
          />
          <Controller
            control={control}
            name='dropoffDate'
            render={({ field }) => (
              <DatePicker
                className='col-span-6 md:col-span-6'
                label='Preferred Dropoff Date'
                labelPlacement='outside'
                minValue={today(getLocalTimeZone()).add({ days: 2 })}
                value={field.value}
                onChange={field.onChange}
                {...datePickerProps}
              />
            )}
          />
        </div>
        <div className='text-default-700 mt-10 text-xl font-semibold'>
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

        <div className='text-default-700 mt-10 text-xl font-semibold'>
          Dropoff Address
        </div>
        <Controller
          control={control}
          name='dropoffAddress'
          render={({ field }) => (
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
            render={({ field }) => (
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
            render={({ field }) => (
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
            render={({ field }) => (
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
