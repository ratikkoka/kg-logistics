'use client';

import React from 'react';
import { cn } from '@heroui/react';
import dynamic from 'next/dynamic';

import truckAnimation from '../../public/truck.json';

import VerticalSteps from './vertical-steps';
import RowSteps from './row-steps';

export type MultiStepSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  currentPage: number;
  onBack: () => void;
  onNext: () => void;
  onChangePage: (page: number) => void;
  isSubmitted?: boolean;
};

const DynamicLottieWithNoSSR = dynamic(() => import('lottie-react'), {
  ssr: false,
});

const stepperClasses = cn(
  // light
  '[--step-color:hsl(var(--heroui-secondary-400))]',
  '[--active-color:hsl(var(--heroui-secondary-400))]',
  '[--inactive-border-color:hsl(var(--heroui-secondary-200))]',
  '[--inactive-bar-color:hsl(var(--heroui-secondary-200))]',
  '[--inactive-color:hsl(var(--heroui-secondary-300))]',
  // dark
  'dark:[--step-color:rgba(255,255,255,0.1)]',
  'dark:[--active-color:hsl(var(--heroui-foreground-600))]',
  'dark:[--active-border-color:rgba(255,255,255,0.5)]',
  'dark:[--inactive-border-color:rgba(255,255,255,0.1)]',
  'dark:[--inactive-bar-color:rgba(255,255,255,0.1)]',
  'dark:[--inactive-color:rgba(255,255,255,0.2)]'
);

const MultiStepSidebar = React.forwardRef<
  HTMLDivElement,
  MultiStepSidebarProps
>(
  (
    {
      children,
      className,
      currentPage,
      isSubmitted,
      onBack,
      onNext,
      onChangePage,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex h-[calc(100vh-64px)] w-full gap-x-2', className)}
        {...props}
      >
        <div className='flex hidden h-[calc(100vh-120px)] w-[344px] flex-shrink-0 flex-col items-start gap-y-8 rounded-large bg-gradient-to-b from-sky-100 via-indigo-100 to-purple-100 px-8 py-6 shadow-small lg:flex'>
          <DynamicLottieWithNoSSR animationData={truckAnimation} loop={true} />
          <div className='-mt-8'>
            <div className='text-xl font-medium leading-7 text-default-foreground'>
              Shipping Quote
            </div>
            <div className='mt-1 text-base font-medium leading-6 text-default-500'>
              Get a personalized quote for your vehicle.
            </div>
          </div>
          {/* Desktop Steps */}
          <VerticalSteps
            className={stepperClasses}
            color='secondary'
            currentStep={currentPage}
            disabled={isSubmitted}
            steps={[
              {
                title: 'Contact Information',
                description: 'How can we contact you?',
              },
              {
                title: 'Vehicle Information',
                description: 'Tell us about your vehicle.',
              },
              {
                title: 'Pickup / Dropoff',
                description: 'Set your pickup and dropoff location.',
              },
              {
                title: 'Submit',
                description: 'Finalize your quote.',
              },
            ]}
            onStepChange={onChangePage}
          />
        </div>
        <div className='flex h-full w-full flex-col items-center gap-4 md:p-4'>
          <div className='sticky top-0 z-10 w-full rounded-large bg-gradient-to-r from-default-100 via-danger-100 to-secondary-100 py-4 shadow-small md:max-w-xl lg:hidden'>
            <div className='flex justify-center'>
              {/* Mobile Steps */}
              <RowSteps
                className={cn('pl-6', stepperClasses)}
                currentStep={currentPage}
                disabled={isSubmitted}
                steps={[
                  {
                    title: 'Contact',
                  },
                  {
                    title: 'Vehicle',
                  },
                  {
                    title: 'Addresses',
                  },
                  {
                    title: 'Submit',
                  },
                ]}
                onStepChange={onChangePage}
              />
            </div>
          </div>
          <div className='h-full w-full p-4 sm:max-w-md md:max-w-lg'>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

MultiStepSidebar.displayName = 'MultiStepSidebar';

export default MultiStepSidebar;
