'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';

type Load = {
  id: string;
  leadId: string;
  status:
    | 'UNLISTED'
    | 'LISTED'
    | 'CARRIER_ASSIGNED'
    | 'PICKED_UP'
    | 'COMPLETED';
  loadType: 'OPEN' | 'ENCLOSED';
  vin: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  pickupDate: Date | null;
  dropoffDate: Date | null;
  pickupAddress: string | null;
  pickupCity: string | null;
  pickupState: string | null;
  pickupZip: string | null;
  dropoffAddress: string | null;
  dropoffCity: string | null;
  dropoffState: string | null;
  dropoffZip: string | null;
  pickupContactName: string | null;
  pickupContactPhone: string | null;
  dropoffContactName: string | null;
  dropoffContactPhone: string | null;
  quotedCost: string | null;
  carrierCost: string | null;
  carrierName: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lead: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

const statusColors: Record<
  Load['status'],
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  UNLISTED: 'danger',
  LISTED: 'primary',
  CARRIER_ASSIGNED: 'secondary',
  PICKED_UP: 'warning',
  COMPLETED: 'success',
};

const statusLabels: Record<Load['status'], string> = {
  UNLISTED: 'Unlisted',
  LISTED: 'Listed',
  CARRIER_ASSIGNED: 'Carrier Assigned',
  PICKED_UP: 'Picked Up',
  COMPLETED: 'Completed',
};

interface LoadDetailViewProps {
  load: Load;
}

export default function LoadDetailView({
  load: initialLoad,
}: LoadDetailViewProps) {
  const router = useRouter();
  const [load, setLoad] = useState<Load>(initialLoad);
  const [status, setStatus] = useState<Load['status']>(initialLoad.status);
  const [pickupContactName, setPickupContactName] = useState(
    initialLoad.pickupContactName || ''
  );
  const [pickupContactPhone, setPickupContactPhone] = useState(
    initialLoad.pickupContactPhone || ''
  );
  const [dropoffContactName, setDropoffContactName] = useState(
    initialLoad.dropoffContactName || ''
  );
  const [dropoffContactPhone, setDropoffContactPhone] = useState(
    initialLoad.dropoffContactPhone || ''
  );
  const [quotedCost, setQuotedCost] = useState(
    initialLoad.quotedCost ? initialLoad.quotedCost.replace(/\D/g, '') : ''
  );
  const [carrierCost, setCarrierCost] = useState(
    initialLoad.carrierCost ? initialLoad.carrierCost.replace(/\D/g, '') : ''
  );
  const [carrierName, setCarrierName] = useState(initialLoad.carrierName || '');
  const [isSaving, setIsSaving] = useState(false);

  const sanitizeCost = (value: string) => value.replace(/\D/g, '');

  const calculateProfit = () => {
    if (!quotedCost || !carrierCost) return null;
    const quoted = parseFloat(quotedCost);
    const carrier = parseFloat(carrierCost);

    if (isNaN(quoted) || isNaN(carrier)) return null;

    return (quoted - carrier).toFixed(2);
  };

  const handleStatusUpdate = async (newStatus: Load['status']) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/loads/${load.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();

        setLoad(updated);
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/loads/${load.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupContactName,
          pickupContactPhone: sanitizeCost(pickupContactPhone),
          dropoffContactName,
          dropoffContactPhone: sanitizeCost(dropoffContactPhone),
        }),
      });

      if (response.ok) {
        const updated = await response.json();

        setLoad(updated);
      }
    } catch (error) {
      console.error('Error updating contacts:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinancialUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/loads/${load.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotedCost: sanitizeCost(quotedCost),
          carrierCost: sanitizeCost(carrierCost),
          carrierName,
        }),
      });

      if (response.ok) {
        const updated = await response.json();

        setLoad(updated);
        setQuotedCost(updated.quotedCost || '');
        setCarrierCost(updated.carrierCost || '');
        setCarrierName(updated.carrierName || '');
      }
    } catch (error) {
      console.error('Error updating financial info:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  };

  const profit = calculateProfit();
  const customerName =
    load.lead.firstName || load.lead.lastName
      ? `${load.lead.firstName || ''} ${load.lead.lastName || ''}`.trim()
      : load.lead.email;

  return (
    <div className='space-y-6 overflow-x-hidden'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-1'>
          <h1 className='mb-2 text-2xl font-bold break-words sm:text-3xl'>
            Load Details
          </h1>
          <div className='flex flex-wrap items-center gap-2'>
            <Chip
              className='px-4 py-2'
              color={statusColors[status]}
              size='lg'
              variant='flat'
            >
              {statusLabels[status]}
            </Chip>
            <Chip
              color={load.loadType === 'OPEN' ? 'warning' : 'primary'}
              size='sm'
              variant='flat'
            >
              {load.loadType}
            </Chip>
          </div>
        </div>
        <Button
          startContent={<Icon icon='solar:arrow-left-outline' width={20} />}
          variant='light'
          onPress={() => router.push('/loads')}
        >
          Back to Loads
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold'>Customer Information</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <p className='text-default-500 text-sm'>Name</p>
                  <p className='font-medium'>{customerName}</p>
                </div>
                <div>
                  <p className='text-default-500 text-sm'>Email</p>
                  <p className='font-medium'>{load.lead.email}</p>
                </div>
                {load.lead.phone && (
                  <div>
                    <p className='text-default-500 text-sm'>Phone</p>
                    <p className='font-medium'>
                      {formatPhone(load.lead.phone)}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Vehicle Information */}
          {(load.make || load.model) && (
            <Card>
              <CardHeader>
                <h2 className='text-xl font-semibold'>Vehicle Information</h2>
              </CardHeader>
              <CardBody>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {load.year && (
                    <div>
                      <p className='text-default-500 text-sm'>Year</p>
                      <p className='font-medium'>{load.year}</p>
                    </div>
                  )}
                  {load.make && (
                    <div>
                      <p className='text-default-500 text-sm'>Make</p>
                      <p className='font-medium'>{load.make}</p>
                    </div>
                  )}
                  {load.model && (
                    <div>
                      <p className='text-default-500 text-sm'>Model</p>
                      <p className='font-medium'>{load.model}</p>
                    </div>
                  )}
                  {load.vin && (
                    <div>
                      <p className='text-default-500 text-sm'>VIN</p>
                      <p className='font-mono text-sm font-medium'>
                        {load.vin}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Address Information */}
          {load.pickupAddress && (
            <Card>
              <CardHeader>
                <h2 className='text-xl font-semibold'>Shipping Addresses</h2>
              </CardHeader>
              <CardBody className='space-y-4'>
                <div>
                  <p className='text-default-500 mb-2 text-sm font-semibold'>
                    Pickup Address
                  </p>
                  <p className='font-medium'>
                    {load.pickupAddress}
                    {load.pickupCity && `, ${load.pickupCity}`}
                    {load.pickupState && `, ${load.pickupState}`}
                    {load.pickupZip && ` ${load.pickupZip}`}
                  </p>
                  {load.pickupDate && (
                    <p className='text-default-500 mt-1 text-sm'>
                      Date: {formatDate(load.pickupDate)}
                    </p>
                  )}
                </div>
                <Divider />
                <div>
                  <p className='text-default-500 mb-2 text-sm font-semibold'>
                    Dropoff Address
                  </p>
                  <p className='font-medium'>
                    {load.dropoffAddress}
                    {load.dropoffCity && `, ${load.dropoffCity}`}
                    {load.dropoffState && `, ${load.dropoffState}`}
                    {load.dropoffZip && ` ${load.dropoffZip}`}
                  </p>
                  {load.dropoffDate && (
                    <p className='text-default-500 mt-1 text-sm'>
                      Date: {formatDate(load.dropoffDate)}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold'>Contact Information</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='space-y-4'>
                <div>
                  <p className='text-default-500 mb-2 text-sm font-semibold'>
                    Pickup Contact
                  </p>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <Input
                      label='Name'
                      placeholder='Pickup contact name'
                      value={pickupContactName}
                      onChange={(e) => setPickupContactName(e.target.value)}
                    />
                    <Input
                      label='Phone'
                      placeholder='xxx-xxx-xxxx'
                      value={pickupContactPhone}
                      onChange={(e) => {
                        const formatted = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                          .slice(0, 12);

                        setPickupContactPhone(formatted);
                      }}
                    />
                  </div>
                </div>
                <Divider />
                <div>
                  <p className='text-default-500 mb-2 text-sm font-semibold'>
                    Dropoff Contact
                  </p>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <Input
                      label='Name'
                      placeholder='Dropoff contact name'
                      value={dropoffContactName}
                      onChange={(e) => setDropoffContactName(e.target.value)}
                    />
                    <Input
                      label='Phone'
                      placeholder='xxx-xxx-xxxx'
                      value={dropoffContactPhone}
                      onChange={(e) => {
                        const formatted = e.target.value
                          .replace(/\D/g, '')
                          .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                          .slice(0, 12);

                        setDropoffContactPhone(formatted);
                      }}
                    />
                  </div>
                </div>
              </div>
              <Button
                className='w-full'
                color='primary'
                isLoading={isSaving}
                onPress={handleContactUpdate}
              >
                Save Contacts
              </Button>
            </CardBody>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold'>Financial Information</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Input
                  inputMode='numeric'
                  label='Quoted Cost'
                  placeholder='e.g., 1200'
                  value={quotedCost}
                  onChange={(e) => setQuotedCost(sanitizeCost(e.target.value))}
                />
                <Input
                  inputMode='numeric'
                  label='Carrier Cost'
                  placeholder='e.g., 800'
                  value={carrierCost}
                  onChange={(e) => setCarrierCost(sanitizeCost(e.target.value))}
                />
              </div>
              <Input
                label='Carrier Name'
                placeholder='Carrier company name'
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
              />
              {profit !== null && (
                <div className='border-default-200 bg-default-50 rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-default-500 text-sm'>Profit</span>
                    <span
                      className={`text-2xl font-bold ${
                        parseFloat(profit) >= 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      ${parseFloat(profit).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <Button
                className='w-full'
                color='primary'
                isLoading={isSaving}
                onPress={handleFinancialUpdate}
              >
                Save Financial Info
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Status Update */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Update Status</h2>
            </CardHeader>
            <CardBody>
              <Select
                isDisabled={isSaving}
                selectedKeys={[status]}
                onSelectionChange={(keys) => {
                  const newStatus = Array.from(keys)[0] as Load['status'];

                  if (newStatus) {
                    handleStatusUpdate(newStatus);
                  }
                }}
              >
                <SelectItem key='UNLISTED'>Unlisted</SelectItem>
                <SelectItem key='LISTED'>Listed</SelectItem>
                <SelectItem key='CARRIER_ASSIGNED'>Carrier Assigned</SelectItem>
                <SelectItem key='PICKED_UP'>Picked Up</SelectItem>
                <SelectItem key='COMPLETED'>Completed</SelectItem>
              </Select>
            </CardBody>
          </Card>

          {/* Load Info */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Load Information</h2>
            </CardHeader>
            <CardBody className='space-y-3'>
              <div>
                <p className='text-default-500 text-sm'>Load Type</p>
                <Chip
                  className='mt-1'
                  color={load.loadType === 'OPEN' ? 'warning' : 'primary'}
                  size='sm'
                  variant='flat'
                >
                  {load.loadType}
                </Chip>
              </div>
              <div>
                <p className='text-default-500 text-sm'>Created</p>
                <p className='font-medium'>{formatDate(load.createdAt)}</p>
              </div>
              {load.completedAt && (
                <div>
                  <p className='text-default-500 text-sm'>Completed</p>
                  <p className='font-medium'>{formatDate(load.completedAt)}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Quick Actions</h2>
            </CardHeader>
            <CardBody className='space-y-2'>
              <Button
                className='w-full justify-start'
                startContent={<Icon icon='solar:document-outline' width={20} />}
                variant='bordered'
                onPress={() => router.push(`/leads/${load.leadId}`)}
              >
                View Original Lead
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
