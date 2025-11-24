'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  RadioGroup,
  Radio,
} from '@heroui/react';
import { Icon } from '@iconify/react';

import { formatPhoneNumber, validatePhone } from '@/utils/validation';

type FormData = {
  formType: 'CONTACT' | 'SHIPPING_QUOTE';
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Vehicle info
  vin: string;
  year: string;
  make: string;
  model: string;
  transportType: string;
  // Address info
  pickupDate: string;
  dropoffDate: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffState: string;
  dropoffZip: string;
  // Quotes
  openQuote: string;
  enclosedQuote: string;
  message: string;
  notes: string;
};

export default function ManualLeadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FormData>>({
    formType: 'SHIPPING_QUOTE',
    status: 'NEW',
    transportType: '',
  });

  const handleInputChange = (field: keyof FormData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || '',
    }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);

    setFormData((prev) => ({
      ...prev,
      phone: formatted,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (!formData.email || !formData.formType) {
      setError('Email and Form Type are required');
      setIsSubmitting(false);

      return;
    }

    // Validate phone if provided
    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      setIsSubmitting(false);

      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: formData.formType,
          status: formData.status || 'NEW',
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          email: formData.email,
          phone: formData.phone || null,
          // Vehicle info
          vin: formData.vin || null,
          year: formData.year || null,
          make: formData.make || null,
          model: formData.model || null,
          transportType: formData.transportType || null,
          // Address info
          pickupDate: formData.pickupDate || null,
          dropoffDate: formData.dropoffDate || null,
          pickupAddress: formData.pickupAddress || null,
          pickupCity: formData.pickupCity || null,
          pickupState: formData.pickupState || null,
          pickupZip: formData.pickupZip || null,
          dropoffAddress: formData.dropoffAddress || null,
          dropoffCity: formData.dropoffCity || null,
          dropoffState: formData.dropoffState || null,
          dropoffZip: formData.dropoffZip || null,
          // Quotes
          openQuote: formData.openQuote || null,
          enclosedQuote: formData.enclosedQuote || null,
          message: formData.message || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Failed to create lead');
      }

      const lead = await response.json();

      router.push(`/leads/${lead.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create lead. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isShippingQuote = formData.formType === 'SHIPPING_QUOTE';

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      {error && (
        <Card className='border-danger bg-danger-50'>
          <CardBody>
            <p className='text-danger text-sm'>{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold'>Basic Information</h2>
        </CardHeader>
        <CardBody className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Select
              isRequired
              label='Form Type'
              selectedKeys={formData.formType ? [formData.formType] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;

                handleInputChange('formType', value);
              }}
            >
              <SelectItem key='CONTACT'>Contact</SelectItem>
              <SelectItem key='SHIPPING_QUOTE'>Shipping Quote</SelectItem>
            </Select>

            <Select
              label='Status'
              selectedKeys={formData.status ? [formData.status] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;

                handleInputChange('status', value);
              }}
            >
              <SelectItem key='NEW'>New</SelectItem>
              <SelectItem key='CONTACTED'>Contacted</SelectItem>
              <SelectItem key='QUOTED'>Quoted</SelectItem>
              <SelectItem key='CONVERTED'>Converted</SelectItem>
              <SelectItem key='LOST'>Lost</SelectItem>
            </Select>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Input
              label='First Name'
              placeholder='John'
              value={formData.firstName || ''}
              onValueChange={(value) => handleInputChange('firstName', value)}
            />
            <Input
              label='Last Name'
              placeholder='Doe'
              value={formData.lastName || ''}
              onValueChange={(value) => handleInputChange('lastName', value)}
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Input
              isRequired
              label='Email'
              placeholder='john.doe@example.com'
              type='email'
              value={formData.email || ''}
              onValueChange={(value) => handleInputChange('email', value)}
            />
            <Input
              label='Phone'
              placeholder='425-555-1234'
              type='tel'
              value={formData.phone || ''}
              onValueChange={handlePhoneChange}
            />
          </div>
        </CardBody>
      </Card>

      {/* Vehicle Information (for Shipping Quote) */}
      {isShippingQuote && (
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold'>Vehicle Information</h2>
          </CardHeader>
          <CardBody className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Input
                label='VIN'
                placeholder='1HGBH41JXMN109186'
                value={formData.vin || ''}
                onValueChange={(value) => handleInputChange('vin', value)}
              />
              <Input
                label='Year'
                placeholder='2024'
                value={formData.year || ''}
                onValueChange={(value) => handleInputChange('year', value)}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Input
                label='Make'
                placeholder='Toyota'
                value={formData.make || ''}
                onValueChange={(value) => handleInputChange('make', value)}
              />
              <Input
                label='Model'
                placeholder='Camry'
                value={formData.model || ''}
                onValueChange={(value) => handleInputChange('model', value)}
              />
            </div>

            <RadioGroup
              label='Transport Type'
              orientation='horizontal'
              value={formData.transportType || ''}
              onValueChange={(value) =>
                handleInputChange('transportType', value)
              }
            >
              <Radio value='open'>Open</Radio>
              <Radio value='enclosed'>Enclosed</Radio>
              <Radio value='both'>Both</Radio>
            </RadioGroup>
          </CardBody>
        </Card>
      )}

      {/* Address Information (for Shipping Quote) */}
      {isShippingQuote && (
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold'>Address Information</h2>
          </CardHeader>
          <CardBody className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Input
                label='Pickup Date'
                type='date'
                value={formData.pickupDate || ''}
                onValueChange={(value) =>
                  handleInputChange('pickupDate', value)
                }
              />
              <Input
                label='Drop-off Date'
                type='date'
                value={formData.dropoffDate || ''}
                onValueChange={(value) =>
                  handleInputChange('dropoffDate', value)
                }
              />
            </div>

            <div className='space-y-4'>
              <h3 className='text-default-700 font-medium'>Pickup Address</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Input
                  label='Address'
                  placeholder='123 Main St'
                  value={formData.pickupAddress || ''}
                  onValueChange={(value) =>
                    handleInputChange('pickupAddress', value)
                  }
                />
                <Input
                  label='City'
                  placeholder='Seattle'
                  value={formData.pickupCity || ''}
                  onValueChange={(value) =>
                    handleInputChange('pickupCity', value)
                  }
                />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Input
                  label='State'
                  placeholder='WA'
                  value={formData.pickupState || ''}
                  onValueChange={(value) =>
                    handleInputChange('pickupState', value)
                  }
                />
                <Input
                  label='ZIP Code'
                  placeholder='98101'
                  value={formData.pickupZip || ''}
                  onValueChange={(value) =>
                    handleInputChange('pickupZip', value)
                  }
                />
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-default-700 font-medium'>Drop-off Address</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Input
                  label='Address'
                  placeholder='456 Oak Ave'
                  value={formData.dropoffAddress || ''}
                  onValueChange={(value) =>
                    handleInputChange('dropoffAddress', value)
                  }
                />
                <Input
                  label='City'
                  placeholder='Portland'
                  value={formData.dropoffCity || ''}
                  onValueChange={(value) =>
                    handleInputChange('dropoffCity', value)
                  }
                />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Input
                  label='State'
                  placeholder='OR'
                  value={formData.dropoffState || ''}
                  onValueChange={(value) =>
                    handleInputChange('dropoffState', value)
                  }
                />
                <Input
                  label='ZIP Code'
                  placeholder='97201'
                  value={formData.dropoffZip || ''}
                  onValueChange={(value) =>
                    handleInputChange('dropoffZip', value)
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quotes and Messages */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold'>Quotes & Messages</h2>
        </CardHeader>
        <CardBody className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Input
              description='Numeric value only (e.g., 1200)'
              label='Open Quote'
              placeholder='1200'
              type='number'
              value={formData.openQuote || ''}
              onValueChange={(value) => handleInputChange('openQuote', value)}
            />
            <Input
              description='Numeric value only (e.g., 1500)'
              label='Enclosed Quote'
              placeholder='1500'
              type='number'
              value={formData.enclosedQuote || ''}
              onValueChange={(value) =>
                handleInputChange('enclosedQuote', value)
              }
            />
          </div>

          <Textarea
            label='Message'
            minRows={3}
            placeholder='Customer message or inquiry...'
            value={formData.message || ''}
            onValueChange={(value) => handleInputChange('message', value)}
          />

          <Textarea
            label='Internal Notes'
            minRows={3}
            placeholder='Internal notes about this lead...'
            value={formData.notes || ''}
            onValueChange={(value) => handleInputChange('notes', value)}
          />
        </CardBody>
      </Card>

      {/* Actions */}
      <div className='flex justify-end gap-4'>
        <Button
          isDisabled={isSubmitting}
          variant='light'
          onPress={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          color='primary'
          isLoading={isSubmitting}
          startContent={
            !isSubmitting && <Icon icon='solar:add-circle-outline' width={20} />
          }
          type='submit'
        >
          {isSubmitting ? 'Creating...' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
