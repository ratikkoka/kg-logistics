'use client';

import type { ContactFormData } from '@/types/forms';

import React from 'react';
import {
  Accordion,
  AccordionItem,
  Alert,
  Button,
  Divider,
  Input,
  InputProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Radio,
  RadioGroup,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Controller, useForm } from 'react-hook-form';

import faqs from './faqs';

import { sendEmail } from '@/utils/emailjs';

export default function ContactPage() {
  const inputProps: Pick<InputProps, 'labelPlacement' | 'classNames'> = {
    labelPlacement: 'outside',
    classNames: {
      label:
        'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
    },
  };
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { control, register, handleSubmit } = useForm<ContactFormData>();

  const [contactType, setContactType] = React.useState<'text' | 'email'>(
    'text'
  );

  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_CONTACT_ID || '';
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

    const result = await sendEmail(
      serviceId,
      templateId,
      data as unknown as Record<string, unknown>,
      publicKey
    );

    if (result.success) {
      setIsSubmitted(true);
      onClose();
    } else {
      setSubmitError(
        result.error?.text ||
          'Failed to send your message. Please try again or contact us directly.'
      );
    }

    setIsSubmitting(false);
  };

  return (
    <section className='mx-auto w-full max-w-6xl px-4 sm:py-32 md:px-6 lg:px-8'>
      <div className='mx-auto flex w-full max-w-4xl flex-col items-center gap-8'>
        <h2 className='leading-[1.25 from-foreground to-foreground-600 w-full max-w-3xl bg-linear-to-br bg-clip-text px-2 text-center text-3xl font-bold tracking-tight text-transparent md:text-5xl md:leading-tight'>
          <span className='inline-block md:hidden'>FAQs</span>
          <span className='hidden md:inline-block'>
            Frequently asked questions
          </span>
        </h2>
        <div>
          <Button
            disableAnimation
            className='from-foreground to-foreground-600 text-background bg-linear-to-br font-medium'
            endContent={<Icon icon='lucide:chevron-right' width={24} />}
            size='lg'
            variant='shadow'
            onPress={onOpen}
          >
            Contact Us
          </Button>
        </div>
        <Accordion
          fullWidth
          keepContentMounted
          itemClasses={{
            base: 'px-0 md:px-2 md:px-6',
            title: 'font-medium',
            trigger: 'py-6 flex-row-reverse',
            content: 'pt-0 pb-6 text-base text-default-500',
            indicator: 'rotate-0 data-[open=true]:-rotate-45',
          }}
          items={faqs}
          selectionMode='multiple'
        >
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              indicator={
                <Icon
                  className='text-secondary'
                  icon='lucide:plus'
                  width={24}
                />
              }
              title={item.title}
            >
              <pre className='font-mono whitespace-pre-wrap'>
                {item.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </pre>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Modal
        isOpen={isOpen}
        placement='top'
        scrollBehavior='inside'
        shouldBlockScroll={false}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <ModalHeader className='flex-col items-center gap-1 px-0 text-center'>
                <h1 className='text-xl'>Contact Us</h1>
                <p className='text-small text-default-500 font-normal'>
                  Have a question? Feel free to reach out to us!
                </p>
              </ModalHeader>
              <form id='contact-info' onSubmit={handleSubmit(onSubmit)}>
                <div className='flex grid grid-cols-12 flex-col gap-4 pb-8'>
                  <Controller
                    control={control}
                    name='contactName'
                    render={({ field }) => (
                      <Input
                        {...field}
                        {...register('contactName')}
                        isRequired
                        className='col-span-12 md:col-span-6'
                        errorMessage='First Name is required'
                        label='Name'
                        placeholder='John'
                        {...inputProps}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name='contactEmail'
                    render={({ field }) => (
                      <Input
                        {...field}
                        {...register('contactEmail')}
                        className='col-span-12 md:col-span-6'
                        errorMessage='Email is required'
                        isRequired={contactType === 'email'}
                        label='Email'
                        placeholder='john.doe@gmail.com'
                        type='email'
                        {...inputProps}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name='contactTel'
                    render={({ field }) => (
                      <Input
                        {...field}
                        {...register('contactTel')}
                        className='col-span-12 md:col-span-6'
                        errorMessage='Mobile Number is required'
                        isRequired={contactType === 'text'}
                        label='Mobile Number'
                        placeholder='xxx-xxx-xxxx'
                        type='tel'
                        {...inputProps}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name='contactType'
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        isRequired
                        className='col-span-12 md:col-span-6'
                        classNames={{
                          wrapper: 'gap-4',
                          label:
                            'text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700',
                        }}
                        color='secondary'
                        defaultValue='text'
                        errorMessage='Contact method is required'
                        label='Preferred Contact Method'
                        orientation='horizontal'
                        value={field.value}
                        onChange={(value) => {
                          const contactTypeValue = value.target.value as
                            | 'text'
                            | 'email';

                          field.onChange(contactTypeValue);
                          setContactType(contactTypeValue);
                        }}
                      >
                        <Radio value='text'>Text</Radio>
                        <Radio value='email'>Email</Radio>
                      </RadioGroup>
                    )}
                  />
                </div>
                <Controller
                  control={control}
                  name='contactMessage'
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      {...register('contactMessage')}
                      isRequired
                      className='col-span-12 md:col-span-6'
                      errorMessage='Message is required'
                      label='Message'
                      maxRows={8}
                      minRows={8}
                      {...inputProps}
                    />
                  )}
                />
                <Divider className='my-2' />
                <div className='flex w-full items-end justify-end pb-4'>
                  <div className='flex gap-2'>
                    <Button
                      color='danger'
                      isDisabled={isSubmitting}
                      type='button'
                      variant='flat'
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      color='secondary'
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                      type='submit'
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              </form>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
      {submitError && (
        <Alert
          color='danger'
          description={submitError}
          isVisible={!!submitError}
          title='Error'
          variant='faded'
          onClose={() => setSubmitError(null)}
        />
      )}
      <Alert
        color='success'
        description='Your message was sent successfully!'
        isVisible={isSubmitted}
        title='Great Success!'
        variant='faded'
        onClose={() => setIsSubmitted(false)}
      />
    </section>
  );
}
