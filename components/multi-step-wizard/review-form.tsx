'use client';

import type {
  ContactInformation,
  VehicleInformation,
  AddressInformation,
  ShippingQuoteFormData,
} from '@/types/forms';

import React from 'react';
import { Button, cn, Spinner } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';

import { localStorageService } from '@/utils/localStorage';
import { sendEmail } from '@/utils/emailjs';

export type ReviewFormProps = React.HTMLAttributes<HTMLFormElement> & {
  onSubmitSuccess?: () => void; // Callback for successful submission
  onSubmittingChange?: (isSubmitting: boolean) => void; // Callback for submission state changes
};

const ReviewForm = React.forwardRef<HTMLFormElement, ReviewFormProps>(
  ({ className, ...props }, ref) => {
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);

    const { handleSubmit } = useForm();

    const onSubmit = async () => {
      setIsSubmitting(true);
      setSubmitError(null);
      props.onSubmittingChange?.(true);

      const contactValues = localStorageService.get<ContactInformation>(
        'contact-info',
        {
          firstName: '',
          lastName: '',
          email: '',
          tel: '',
        }
      );
      const vehicleValues = localStorageService.get<VehicleInformation>(
        'vehicle-info',
        {
          year: '',
          make: '',
          model: '',
          transportType: 'both',
        }
      );
      const addressValues = localStorageService.get<AddressInformation>(
        'address-info',
        {
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
        }
      );

      const formValues: ShippingQuoteFormData = {
        ...contactValues,
        ...vehicleValues,
        ...addressValues,
      };

      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

      const result = await sendEmail(
        serviceId,
        templateId,
        formValues as unknown as Record<string, unknown>,
        publicKey
      );

      if (result.success) {
        localStorageService.clear();
        setIsSubmitted(true);
        props.onSubmitSuccess?.();
      } else {
        setSubmitError(
          result.error?.text ||
            'Failed to submit your quote request. Please try again or contact us directly.'
        );
      }

      setIsSubmitting(false);
      props.onSubmittingChange?.(false);
    };

    const formatDate = (date: string) => {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) return date; // Return original value if not a valid date

      return parsedDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    };

    const formatLabel = (label: string) => {
      return label
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
    };

    const toStartCase = (value: string) => {
      return value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Memoize localStorage reads to avoid re-reading on every render
    const contactValues = React.useMemo(
      () =>
        localStorageService.get<ContactInformation>('contact-info', {
          firstName: '',
          lastName: '',
          email: '',
          tel: '',
        }),
      []
    );
    const vehicleValues = React.useMemo(
      () =>
        localStorageService.get<VehicleInformation>('vehicle-info', {
          year: '',
          make: '',
          model: '',
          transportType: 'both',
        }),
      []
    );
    const addressValues = React.useMemo(
      () =>
        localStorageService.get<AddressInformation>('address-info', {
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
        }),
      []
    );

    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        id='submit-step'
        onSubmit={handleSubmit(onSubmit)}
        {...props}
      >
        {isSubmitted ? (
          <div className='text-center text-lg font-semibold text-default-700'>
            <div className='mb-4 flex justify-center'>
              <Icon
                className='text-success'
                icon='solar:check-circle-bold'
                width={64}
              />
            </div>
            Your request was submitted successfully! <br />
            We will reach out with a quote within 24 hours.
            <div className='mx-auto my-6 mt-4 flex w-full items-center justify-center gap-x-4 lg:mx-0'>
              <Button
                className='rounded-medium border-default-200 text-medium font-medium text-default-500'
                variant='bordered'
                onPress={() => (window.location.href = '/')}
              >
                <Icon icon='solar:arrow-left-outline' width={24} />
                <span className='hidden sm:inline'>Return to Home</span>
                <span className='inline sm:hidden'>Home</span>
              </Button>
              <Button
                className='bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-medium font-medium text-white'
                onPress={() => {
                  window.location.reload();
                }}
              >
                <span className='hidden sm:inline'>Start Another Quote</span>
                <span className='inline sm:hidden'>Restart</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isSubmitting && (
              <div className='mb-4 flex items-center justify-center gap-2 text-default-600'>
                <Spinner size='sm' />
                <span>Submitting your request...</span>
              </div>
            )}
            <div className='text-3xl font-bold leading-9 text-default-foreground'>
              Review Your Information
            </div>
            <div
              className={cn(
                'mt-6 space-y-8 rounded-large bg-gradient-to-b from-sky-100 via-indigo-100 to-purple-100 p-6 shadow-small',
                isSubmitting && 'pointer-events-none opacity-50'
              )}
            >
              {/* Contact Information */}
              <div>
                <h3 className='text-lg font-semibold'>Contact Information</h3>
                <div className='mt-2 space-y-2'>
                  {Object.entries(contactValues).map(([key, value]) => {
                    if (key === 'lastName') return null; // Skip individual name fields
                    if (key === 'firstName') {
                      key = 'Name'; // Rename firstName to Name
                      value = `${contactValues.firstName || ''} ${
                        contactValues.lastName || ''
                      }`.trim(); // Combine firstName and lastName into Name
                    }

                    return (
                      <div key={key}>
                        <span className='font-medium'>{formatLabel(key)}:</span>{' '}
                        <span>
                          {key.toLowerCase().includes('date')
                            ? formatDate(String(value))
                            : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className='text-lg font-semibold'>Vehicle Information</h3>
                <div className='mt-2 space-y-2'>
                  {Object.entries(vehicleValues).map(([key, value]) => {
                    if (
                      key.toLowerCase() === 'make' ||
                      key.toLowerCase() === 'transporttype'
                    ) {
                      value = toStartCase(String(value)); // Convert to Start Case
                    }

                    return (
                      <div key={key}>
                        <span className='font-medium'>{formatLabel(key)}:</span>{' '}
                        <span>
                          {key.toLowerCase().includes('date')
                            ? formatDate(String(value))
                            : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className='text-lg font-semibold'>Address Information</h3>
                <div className='mt-2 space-y-2'>
                  {Object.entries(addressValues).map(([key, value]) => {
                    if (key === 'pickupAddress') {
                      key = 'Pickup Address';
                      value = `${addressValues.pickupAddress || ''}, ${
                        addressValues.pickupCity || ''
                      }, ${addressValues.pickupState || ''} ${
                        addressValues.pickupZip || ''
                      }`.trim(); // Combine pickup address fields
                    } else if (key === 'dropoffAddress') {
                      key = 'Dropoff Address';
                      value = `${addressValues.dropoffAddress || ''}, ${
                        addressValues.dropoffCity || ''
                      }, ${addressValues.dropoffState || ''} ${
                        addressValues.dropoffZip || ''
                      }`.trim(); // Combine dropoff address fields
                    } else if (
                      [
                        'pickupCity',
                        'pickupState',
                        'pickupZip',
                        'dropoffCity',
                        'dropoffState',
                        'dropoffZip',
                      ].includes(key)
                    ) {
                      return null; // Skip redundant keys
                    }

                    return (
                      <div key={key}>
                        <span className='font-medium'>{formatLabel(key)}:</span>{' '}
                        <span>
                          {key.toLowerCase().includes('date')
                            ? formatDate(String(value))
                            : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {submitError && (
              <div className='mt-4 rounded-lg bg-danger-50 p-4 text-danger'>
                <div className='flex items-center gap-2'>
                  <Icon icon='solar:danger-triangle-bold' width={20} />
                  <span className='font-medium'>{submitError}</span>
                </div>
                <p className='mt-2 text-sm'>
                  If this problem persists, please contact us directly at{' '}
                  <a className='underline hover:opacity-80' href='/contact'>
                    our contact page
                  </a>
                  .
                </p>
              </div>
            )}
          </>
        )}
      </form>
    );
  }
);

ReviewForm.displayName = 'ReviewForm';

export default ReviewForm;
