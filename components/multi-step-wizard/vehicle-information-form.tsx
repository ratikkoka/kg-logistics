'use client';

import type { InputProps } from '@heroui/react';
import type { VehicleInformation } from '@/types/forms';

import React from 'react';
import { Input, RadioGroup, Radio, Spinner } from '@heroui/react';
import { cn } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';

import Vindec from '../vindec';

import { localStorageService } from '@/utils/localStorage';
import { validateVIN } from '@/utils/validation';
import { useDebounce } from '@/hooks/useDebounce';

export type VehicleInformationFormProps =
  React.HTMLAttributes<HTMLFormElement> & {
    onNext: () => void;
  };

const VehicleInformationForm = React.forwardRef<
  HTMLFormElement,
  VehicleInformationFormProps
>(({ className, onNext }, _ref) => {
  const inputProps: Pick<InputProps, 'labelPlacement' | 'classNames'> = {
    labelPlacement: 'outside',
    classNames: {
      label:
        'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
    },
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleInformation>({
    defaultValues: {
      vin: '',
      year: '',
      make: '',
      model: '',
      transportType: 'both',
    },
  });

  const vin = watch('vin');
  const debouncedVin = useDebounce(vin, 500);
  const isVinValid = React.useRef(false);
  const [isDecodingVin, setIsDecodingVin] = React.useState(false);
  const [vinError, setVinError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const data = localStorageService.get<VehicleInformation>('vehicle-info', {
      vin: '',
      year: '',
      make: '',
      model: '',
      transportType: 'both',
    });

    if (data && Object.keys(data).length > 0) {
      if (data.vin) {
        setValue('vin', data.vin);
        isVinValid.current = true;
      }
      setValue('year', data.year || '');
      setValue('make', data.make || '');
      setValue('model', data.model || '');
      setValue('transportType', data.transportType || 'both');
    }
  }, [setValue]);

  // Debounced VIN decoding
  React.useEffect(() => {
    const decodeVin = async (vinValue: string) => {
      if (!vinValue || vinValue.length !== 17) {
        isVinValid.current = false;
        setVinError(null);
        if (vinValue.length > 0 && vinValue.length < 17) {
          setVinError('VIN must be exactly 17 characters');
        }
        setValue('year', '');
        setValue('make', '');
        setValue('model', '');

        return;
      }

      if (!validateVIN(vinValue)) {
        isVinValid.current = false;
        setVinError(
          'Invalid VIN format. VINs cannot contain I, O, Q. or symbols.'
        );
        setValue('year', '');
        setValue('make', '');
        setValue('model', '');

        return;
      }

      const vindec = new Vindec();

      if (vindec.validate(vinValue)) {
        setIsDecodingVin(true);
        setVinError(null);
        try {
          const res = await vindec.nhtsa(vinValue);
          const decodedVehicle = res.data.Results[0];

          if (decodedVehicle) {
            isVinValid.current = true;
            setValue('year', decodedVehicle.ModelYear || '');
            setValue('make', decodedVehicle.Make || '');
            setValue('model', decodedVehicle.Model || '');
            setVinError(null);
          } else {
            isVinValid.current = false;
            setVinError(
              'VIN not found in database. Please enter vehicle details manually.'
            );
            setValue('year', '');
            setValue('make', '');
            setValue('model', '');
          }
        } catch (err) {
          isVinValid.current = false;
          setVinError(
            'Failed to decode VIN. Please enter vehicle details manually.'
          );
          // eslint-disable-next-line no-console
          console.error('Error decoding VIN:', err);
          setValue('year', '');
          setValue('make', '');
          setValue('model', '');
        } finally {
          setIsDecodingVin(false);
        }
      } else {
        isVinValid.current = false;
        setVinError('Invalid VIN. Please check and try again.');
        setValue('year', '');
        setValue('make', '');
        setValue('model', '');
      }
    };

    if (debouncedVin) {
      decodeVin(debouncedVin);
    }
  }, [debouncedVin, setValue]);

  const onSubmit = (data: VehicleInformation) => {
    localStorageService.set('vehicle-info', data);
    onNext();
  };

  const radioClassNames = {
    base: cn(
      'inline-flex m-0 bg-default-100 items-center justify-between',
      'flex-row-reverse w-full max-w-full cursor-pointer rounded-lg p-4 border-medium border-transparent',
      'data-[selected=true]:border-secondary'
    ),
    control: 'bg-secondary text-secondary-foreground',
    wrapper: 'group-data-[selected=true]:border-secondary',
    label: 'text-small text-default-700 font-medium',
    labelWrapper: 'm-0',
  };

  return (
    <>
      <div className='text-default-foreground text-3xl leading-9 font-bold'>
        Vehicle Information
      </div>
      <div className='text-default-500 py-4'>
        Please provide your vehicle&apos;s information
      </div>
      <form
        className={cn('flex flex-col gap-4 py-8', className)}
        id='vehicle-info'
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          name='vin'
          render={({ field, fieldState }) => (
            <Input
              {...field}
              className='col-span-12'
              endContent={isDecodingVin ? <Spinner size='sm' /> : null}
              errorMessage={vinError || fieldState.error?.message}
              isInvalid={!!vinError || fieldState.invalid}
              label='VIN (Optional)'
              maxLength={17}
              placeholder='Enter your VIN (17 characters)'
              onChange={(e) => {
                const value = e.target.value.toUpperCase();

                field.onChange(value);
                setVinError(null);
              }}
              {...inputProps}
            />
          )}
        />

        <div className='grid grid-cols-12 gap-4'>
          <Controller
            control={control}
            name='year'
            render={({ field }) => (
              <Input
                {...field}
                className='col-span-4'
                errorMessage={errors.year?.message || 'Year is required'}
                isInvalid={!!errors.year}
                isRequired={!isVinValid.current}
                label='Year'
                placeholder='Year'
                readOnly={isVinValid.current}
                {...inputProps}
              />
            )}
          />

          <Controller
            control={control}
            name='make'
            render={({ field }) => (
              <Input
                {...field}
                className='col-span-4'
                errorMessage={errors.make?.message || 'Make is required'}
                isInvalid={!!errors.make}
                isRequired={!isVinValid.current}
                label='Make'
                placeholder='Make'
                readOnly={isVinValid.current}
                {...inputProps}
              />
            )}
          />

          <Controller
            control={control}
            name='model'
            render={({ field }) => (
              <Input
                {...field}
                className='col-span-4'
                errorMessage={errors.model?.message || 'Model is required'}
                isInvalid={!!errors.model}
                isRequired={!isVinValid.current}
                label='Model'
                placeholder='Model'
                readOnly={isVinValid.current}
                {...inputProps}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name='transportType'
          render={({ field }) => (
            <RadioGroup
              {...field}
              isRequired
              className='col-span-12 mt-10'
              classNames={{
                wrapper: 'gap-4',
                label: cn(
                  'absolute pointer-events-none origin-top-left shrink-0',
                  'rtl:origin-top-right subpixel-antialiased block will-change-auto',
                  'duration-200! ease-out! motion-reduce:transition-none',
                  'transition-[transform,color,left,opacity]',
                  'group-data-[filled-within=true]:pointer-events-auto pb-0 z-20',
                  '-top-7 left-0 group-data-[filled-within=true]:start-0',
                  'start-3 end-auto group-data-[filled-within=true]:-translate-y-[calc(100%_+_theme(fontSize.small)/2_+_20px)]',
                  'pe-2 max-w-full text-ellipsis overflow-hidden text-small font-medium',
                  'text-default-700 group-data-[filled-within=true]:text-default-700'
                ),
              }}
              label='Transport Type'
              value={field.value} // Ensure the value is controlled
              onChange={(value) => field.onChange(value)} // Properly handle onChange
            >
              <Radio classNames={radioClassNames} value='enclosed'>
                Enclosed
              </Radio>
              <Radio classNames={radioClassNames} value='open'>
                Open
              </Radio>
              <Radio classNames={radioClassNames} value='both'>
                Quote both
              </Radio>
            </RadioGroup>
          )}
          rules={{ required: 'Transport type is required' }}
        />
      </form>
    </>
  );
});

VehicleInformationForm.displayName = 'VehicleInformationForm';

export default VehicleInformationForm;
