'use client';

import React from 'react';
import { Button, cn } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { Icon } from '@iconify/react';

const SERVICE_ID = 'service_smifkhn';
const TEMPLATE_ID = 'template_gqweqiu';
const PUBLIC_KEY = 'BYUGVToQki0Vw-jy0';

export type ReviewFormProps = React.HTMLAttributes<HTMLFormElement> & {
  onSubmitSuccess?: () => void; // Callback for successful submission
};

const ReviewForm = React.forwardRef<HTMLFormElement, ReviewFormProps>(
  ({ className, ...props }, ref) => {
    const [isSubmitted, setIsSubmitted] = React.useState(false); // Track submission status
    const appearanceNoneClassName =
      '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

    const { handleSubmit } = useForm();

    const onSubmit = (data: any) => {
      const contactValues = JSON.parse(
        localStorage.getItem('contact-info') ?? '{}'
      );
      const vehicleValues = JSON.parse(
        localStorage.getItem('vehicle-info') ?? '{}'
      );
      const addressValues = JSON.parse(
        localStorage.getItem('address-info') ?? '{}'
      );
      const formValues = {
        ...contactValues,
        ...vehicleValues,
        ...addressValues,
      };

      console.log(formValues);
      if (formValues) {
        sendEmail(formValues);
      }
    };

    const sendEmail = (formValues: Record<string, unknown>) => {
      setIsSubmitted(true); // Set submission status to true
      props.onSubmitSuccess?.(); // Notify parent component
      // emailjs
      //   .send(SERVICE_ID, TEMPLATE_ID, formValues, {
      //     publicKey: PUBLIC_KEY,
      //   })
      //   .then(
      //     () => {
      //       // localStorage.clear();
      //       setIsSubmitted(true); // Set submission status to true
      //       props.onSubmitSuccess?.(); // Notify parent component
      //     },
      //     (error) => {
      //       console.log('FAILED...', error.text);
      //     }
      //   );
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

    const contactValues = JSON.parse(
      localStorage.getItem('contact-info') ?? '{}'
    );
    const vehicleValues = JSON.parse(
      localStorage.getItem('vehicle-info') ?? '{}'
    );
    const addressValues = JSON.parse(
      localStorage.getItem('address-info') ?? '{}'
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
            <div className='text-3xl font-bold leading-9 text-default-foreground'>
              Review Your Information
            </div>
            <div className='mt-6 space-y-8 rounded-large bg-gradient-to-b from-sky-100 via-indigo-100 to-purple-100 p-6 shadow-small'>
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
          </>
        )}
      </form>
    );
  }
);

ReviewForm.displayName = 'ReviewForm';

export default ReviewForm;
