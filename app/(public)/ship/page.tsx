'use client';

import React from 'react';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { Button, cn } from '@heroui/react';
import clsx from 'clsx';
import { Icon } from '@iconify/react';

import MultistepSidebar from '@/components/multi-step-wizard/multistep-sidebar';
import ContactInformationForm from '@/components/multi-step-wizard/contact-information-form';
import VehicleInformationForm from '@/components/multi-step-wizard/vehicle-information-form';
import ChooseAddressForm from '@/components/multi-step-wizard/choose-address-form';
import ReviewForm from '@/components/multi-step-wizard/review-form';

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

export default function Component() {
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isSubmitted, setIsSubmitted] = React.useState(false); // Track submission status
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Track submission in progress

  const paginate = React.useCallback((newDirection: number) => {
    setPage((prev) => {
      const nextPage = prev[0] + newDirection;

      if (nextPage < 0 || nextPage > 3) return prev;

      return [nextPage, newDirection];
    });
  }, []);

  const onChangePage = React.useCallback((newPage: number) => {
    setPage((prev) => {
      if (newPage < 0 || newPage > 3) return prev;
      const currentPage = prev[0];

      return [newPage, newPage > currentPage ? 1 : -1];
    });
  }, []);

  const onBack = React.useCallback(() => {
    paginate(-1);
  }, [paginate]);

  const onNext = React.useCallback(() => {
    paginate(1);
  }, [paginate]);

  const handleSubmission = React.useCallback(() => {
    setIsSubmitted(true); // Update submission status from ReviewForm
  }, []);

  const content = React.useMemo(() => {
    let component = <ContactInformationForm onNext={onNext} />;

    switch (page) {
      case 1:
        component = <VehicleInformationForm onNext={onNext} />;
        break;
      case 2:
        component = <ChooseAddressForm onNext={onNext} />;
        break;
      case 3:
        component = (
          <ReviewForm
            onSubmitSuccess={handleSubmission}
            onSubmittingChange={setIsSubmitting}
          />
        );
        break;
    }

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          key={page}
          animate='center'
          className='col-span-12'
          custom={direction}
          exit='exit'
          initial='exit'
          transition={{
            y: {
              ease: 'backOut',
              duration: 0.35,
            },
            opacity: { duration: 0.4 },
          }}
          variants={variants}
        >
          {component}
        </m.div>
      </LazyMotion>
    );
  }, [direction, page, onNext, handleSubmission]);

  const methods = useForm();
  const form =
    page === 0
      ? 'contact-info'
      : page === 1
        ? 'vehicle-info'
        : page === 3
          ? 'submit-step'
          : 'address-info';
  const backButtonProps = {
    isDisabled: page === 0 || isSubmitted || isSubmitting,
  }; // Disable back button if submitted or submitting
  const nextButtonProps = {
    children:
      page === 0
        ? 'Continue'
        : page === 3
          ? isSubmitting
            ? 'Submitting...'
            : 'Submit'
          : 'Continue',
    isDisabled: isSubmitted || isSubmitting, // Disable if submitted or submitting
    isLoading: page === 3 && isSubmitting, // Show loading spinner on submit
  };

  return (
    <MultistepSidebar
      currentPage={page}
      isSubmitted={isSubmitted}
      onBack={onBack}
      onChangePage={onChangePage}
      onNext={onNext}
    >
      <div className='relative flex h-fit w-full flex-col pt-6 text-center lg:h-full lg:justify-center lg:pt-0'>
        <FormProvider {...methods}>
          {content}
          {!isSubmitted && ( // Hide the entire button container if submitted
            <div
              className={cn(
                'mx-auto my-6 flex w-full items-center justify-center gap-x-4', // Removed 'lg:flex' to make it always flex
                'justify-start' // Ensure visibility on all screen sizes
              )}
            >
              <Button
                className={clsx(
                  'rounded-medium border-default-200 text-medium text-default-500 font-medium',
                  backButtonProps?.isDisabled && 'hidden'
                )}
                variant='bordered'
                onPress={onBack}
                {...backButtonProps}
              >
                <Icon icon='solar:arrow-left-outline' width={24} />
                Go Back
              </Button>

              <Button
                className={clsx(
                  'text-medium bg-linear-to-r from-sky-500 via-indigo-500 to-purple-600 font-medium text-white',
                  nextButtonProps?.isDisabled && 'hidden'
                )}
                form={form}
                type='submit'
                {...nextButtonProps}
              >
                {nextButtonProps?.children || 'Sign Up for Free'}
              </Button>
            </div>
          )}
        </FormProvider>
      </div>
    </MultistepSidebar>
  );
}
