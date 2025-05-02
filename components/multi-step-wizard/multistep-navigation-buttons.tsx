import type { ButtonProps } from '@heroui/react';

import * as React from 'react';
import clsx from 'clsx';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';

type MultistepNavigationButtonsProps = React.HTMLAttributes<HTMLDivElement> & {
  form: string;
  onBack?: () => void;
  onNext?: () => void;
  backButtonProps?: ButtonProps;
  nextButtonProps?: ButtonProps;
};

const MultistepNavigationButtons = React.forwardRef<
  HTMLDivElement,
  MultistepNavigationButtonsProps
>(
  (
    {
      className,
      form,
      onBack,
      onNext,
      backButtonProps,
      nextButtonProps,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto my-6 flex w-full items-center justify-center gap-x-4 lg:mx-0',
        className
      )}
      {...props}
    >
      <Button
        className={clsx(
          'rounded-medium border-default-200 text-medium font-medium text-default-500',
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
          'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-medium font-medium text-white',
          nextButtonProps?.isDisabled && 'hidden'
        )}
        form={form}
        type='submit'
        onPress={onNext}
        {...nextButtonProps}
      >
        {nextButtonProps?.children || 'Sign Up for Free'}
      </Button>

      <Button
        className={clsx(
          'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-medium font-medium text-white',
          !nextButtonProps?.isDisabled && 'hidden'
        )}
        form={form}
        type='submit'
      >
        {nextButtonProps?.children || 'Sign Up for Free'}
      </Button>
    </div>
  )
);

MultistepNavigationButtons.displayName = 'MultistepNavigationButtons';

export default MultistepNavigationButtons;
