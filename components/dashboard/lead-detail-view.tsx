'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';

import { useInvalidateLeads } from '@/lib/queries/leads';
import { useInvalidateLoads } from '@/lib/queries/loads';

type Lead = {
  id: string;
  formType: 'CONTACT' | 'SHIPPING_QUOTE';
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  openQuote: string | null;
  enclosedQuote: string | null;
  vin: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  transportType: string | null;
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
  message: string | null;
  notes: string | null;
  assignedTo: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  emails: Array<{
    id: string;
    sentTo: string;
    subject: string;
    sentAt: Date;
    template: { name: string } | null;
  }>;
};

const statusColors: Record<
  Lead['status'],
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  NEW: 'primary',
  CONTACTED: 'secondary',
  QUOTED: 'warning',
  CONVERTED: 'success',
  LOST: 'danger',
};

const statusLabels: Record<Lead['status'], string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUOTED: 'Quoted',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

interface LeadDetailViewProps {
  lead: Lead;
}

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export default function LeadDetailView({ lead }: LeadDetailViewProps) {
  const router = useRouter();
  const invalidateLeads = useInvalidateLeads();
  const invalidateLoads = useInvalidateLoads();
  const [status, setStatus] = useState<Lead['status']>(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');
  const sanitizeQuoteValue = (value: string) => value.replace(/\D/g, '');
  const [openQuote, setOpenQuote] = useState(
    sanitizeQuoteValue(lead.openQuote || '')
  );
  const [enclosedQuote, setEnclosedQuote] = useState(
    sanitizeQuoteValue(lead.enclosedQuote || '')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingQuotes, setIsSavingQuotes] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [hasLoad, setHasLoad] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const {
    isOpen: isEmailOpen,
    onOpen: onEmailOpen,
    onOpenChange: onEmailOpenChange,
    onClose: onEmailClose,
  } = useDisclosure();
  const {
    isOpen: isConvertOpen,
    onOpen: onConvertOpen,
    onOpenChange: onConvertOpenChange,
  } = useDisclosure();

  const handleStatusUpdate = async (newStatus: Lead['status']) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        // Invalidate cache to refresh dashboard
        invalidateLeads();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        // Notes saved successfully
        // Invalidate cache to refresh dashboard
        invalidateLeads();
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuoteUpdate = async () => {
    setIsSavingQuotes(true);
    const sanitizedOpen = sanitizeQuoteValue(openQuote);
    const sanitizedEnclosed = sanitizeQuoteValue(enclosedQuote);

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          openQuote: sanitizedOpen || null,
          enclosedQuote: sanitizedEnclosed || null,
        }),
      });

      if (response.ok) {
        setOpenQuote(sanitizedOpen);
        setEnclosedQuote(sanitizedEnclosed);
        // Invalidate cache to refresh dashboard stats
        invalidateLeads();
      }
    } catch (error) {
      console.error('Error updating quotes:', error);
    } finally {
      setIsSavingQuotes(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();

      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const checkForLoad = async () => {
    try {
      // Check if a load exists for this lead
      const response = await fetch(`/api/loads?leadId=${lead.id}`);

      if (response.ok) {
        const data = await response.json();

        setHasLoad(data.loads && data.loads.length > 0);
      }
    } catch (error) {
      console.error('Error checking for load:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    checkForLoad();
  }, [lead.id]);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          templateId: selectedTemplateId || null,
          customSubject: selectedTemplateId ? null : customSubject,
          customBody: selectedTemplateId ? null : customBody,
        }),
      });

      if (response.ok) {
        onEmailClose();
        setSelectedTemplateId('');
        setCustomSubject('');
        setCustomBody('');
        // Refresh the page to show updated email history
        router.refresh();
      } else {
        const error = await response.json();

        alert(error.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date: Date | string | null) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const copyToClipboard = async (text: string, _label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you have one
      // Copied to clipboard
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatQuoteDisplay = (value: string | null) => {
    if (!value) return 'Not set';
    const number = Number(value);

    if (Number.isNaN(number)) return value;

    return `$${number.toLocaleString()}`;
  };

  const getLeadName = () => {
    if (lead.firstName || lead.lastName) {
      return `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    }

    return 'Unknown';
  };

  return (
    <div className='space-y-4 pb-6 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start gap-3'>
        <Button
          isIconOnly
          className='mt-1 flex-shrink-0'
          size='sm'
          variant='light'
          onPress={() => router.push('/dashboard')}
        >
          <Icon icon='solar:arrow-left-outline' width={20} />
        </Button>
        <div className='min-w-0 flex-1'>
          <h1 className='text-lg leading-tight font-bold break-words sm:text-2xl lg:text-3xl'>
            {getLeadName()}
          </h1>
          <p className='text-default-500 mt-1 text-xs sm:text-sm'>
            Lead Details
          </p>
        </div>
        <Chip
          className='mt-1 flex-shrink-0 px-4 py-2 text-base'
          color={statusColors[status]}
          size='lg'
          variant='flat'
        >
          {statusLabels[status]}
        </Chip>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold'>Contact Information</h2>
            </CardHeader>
            <CardBody className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <p className='text-default-500 text-sm'>Email</p>
                    <p className='font-medium'>{lead.email || 'N/A'}</p>
                  </div>
                  {lead.email && (
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() => copyToClipboard(lead.email!, 'Email')}
                    >
                      <Icon icon='solar:copy-outline' width={18} />
                    </Button>
                  )}
                </div>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <p className='text-default-500 text-sm'>Phone</p>
                    <p className='font-medium'>{lead.phone || 'N/A'}</p>
                  </div>
                  {lead.phone && (
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() => copyToClipboard(lead.phone!, 'Phone')}
                    >
                      <Icon icon='solar:copy-outline' width={18} />
                    </Button>
                  )}
                </div>
                <div>
                  <p className='text-default-500 text-sm'>Form Type</p>
                  <Chip size='sm' variant='flat'>
                    {lead.formType === 'CONTACT' ? 'Contact' : 'Shipping Quote'}
                  </Chip>
                </div>
                <div>
                  <p className='text-default-500 text-sm'>Created</p>
                  <p className='font-medium'>{formatDate(lead.createdAt)}</p>
                </div>
              </div>
              <Divider />
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <p className='text-default-500 text-sm'>Open Quote</p>
                    <p className='font-medium'>
                      {formatQuoteDisplay(openQuote || null)}
                    </p>
                  </div>
                  {openQuote && (
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() => copyToClipboard(openQuote, 'Open Quote')}
                    >
                      <Icon icon='solar:copy-outline' width={18} />
                    </Button>
                  )}
                </div>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <p className='text-default-500 text-sm'>Enclosed Quote</p>
                    <p className='font-medium'>
                      {formatQuoteDisplay(enclosedQuote || null)}
                    </p>
                  </div>
                  {enclosedQuote && (
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() =>
                        copyToClipboard(enclosedQuote, 'Enclosed Quote')
                      }
                    >
                      <Icon icon='solar:copy-outline' width={18} />
                    </Button>
                  )}
                </div>
              </div>
              {lead.message && (
                <>
                  <Divider />
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1'>
                      <p className='text-default-500 mb-2 text-sm'>Message</p>
                      <p className='text-default-700'>{lead.message}</p>
                    </div>
                    <Button
                      isIconOnly
                      size='sm'
                      variant='light'
                      onPress={() => copyToClipboard(lead.message!, 'Message')}
                    >
                      <Icon icon='solar:copy-outline' width={18} />
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Vehicle Information (for shipping quotes) */}
          {lead.formType === 'SHIPPING_QUOTE' && (lead.make || lead.model) && (
            <Card>
              <CardHeader>
                <h2 className='text-xl font-semibold'>Vehicle Information</h2>
              </CardHeader>
              <CardBody>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {lead.year && (
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p className='text-default-500 text-sm'>Year</p>
                        <p className='font-medium'>{lead.year}</p>
                      </div>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        onPress={() => copyToClipboard(lead.year!, 'Year')}
                      >
                        <Icon icon='solar:copy-outline' width={18} />
                      </Button>
                    </div>
                  )}
                  {lead.make && (
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p className='text-default-500 text-sm'>Make</p>
                        <p className='font-medium'>{lead.make}</p>
                      </div>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        onPress={() => copyToClipboard(lead.make!, 'Make')}
                      >
                        <Icon icon='solar:copy-outline' width={18} />
                      </Button>
                    </div>
                  )}
                  {lead.model && (
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p className='text-default-500 text-sm'>Model</p>
                        <p className='font-medium'>{lead.model}</p>
                      </div>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        onPress={() => copyToClipboard(lead.model!, 'Model')}
                      >
                        <Icon icon='solar:copy-outline' width={18} />
                      </Button>
                    </div>
                  )}
                  {lead.vin && (
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p className='text-default-500 text-sm'>VIN</p>
                        <p className='font-mono text-sm font-medium'>
                          {lead.vin}
                        </p>
                      </div>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        onPress={() => copyToClipboard(lead.vin!, 'VIN')}
                      >
                        <Icon icon='solar:copy-outline' width={18} />
                      </Button>
                    </div>
                  )}
                  {lead.transportType && (
                    <div>
                      <p className='text-default-500 text-sm'>Transport Type</p>
                      <p className='font-medium capitalize'>
                        {lead.transportType}
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Address Information (for shipping quotes) */}
          {lead.formType === 'SHIPPING_QUOTE' && lead.pickupAddress && (
            <Card>
              <CardHeader>
                <h2 className='text-xl font-semibold'>Shipping Addresses</h2>
              </CardHeader>
              <CardBody className='space-y-4'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <p className='text-default-500 mb-2 text-sm font-semibold'>
                      Pickup Address
                    </p>
                    <p className='font-medium'>
                      {lead.pickupAddress}
                      {lead.pickupCity && `, ${lead.pickupCity}`}
                      {lead.pickupState && `, ${lead.pickupState}`}
                      {lead.pickupZip && ` ${lead.pickupZip}`}
                    </p>
                    {lead.pickupDate && (
                      <p className='text-default-500 mt-1 text-sm'>
                        Pickup Date: {formatDateOnly(lead.pickupDate)}
                      </p>
                    )}
                  </div>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    onPress={() => {
                      const address = `${lead.pickupAddress}${lead.pickupCity ? `, ${lead.pickupCity}` : ''}${lead.pickupState ? `, ${lead.pickupState}` : ''}${lead.pickupZip ? ` ${lead.pickupZip}` : ''}`;

                      copyToClipboard(address, 'Pickup Address');
                    }}
                  >
                    <Icon icon='solar:copy-outline' width={18} />
                  </Button>
                </div>
                {lead.dropoffAddress && (
                  <>
                    <Divider />
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p className='text-default-500 mb-2 text-sm font-semibold'>
                          Drop-off Address
                        </p>
                        <p className='font-medium'>
                          {lead.dropoffAddress}
                          {lead.dropoffCity && `, ${lead.dropoffCity}`}
                          {lead.dropoffState && `, ${lead.dropoffState}`}
                          {lead.dropoffZip && ` ${lead.dropoffZip}`}
                        </p>
                        {lead.dropoffDate && (
                          <p className='text-default-500 mt-1 text-sm'>
                            Drop-off Date: {formatDateOnly(lead.dropoffDate)}
                          </p>
                        )}
                      </div>
                      <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        onPress={() => {
                          const address = `${lead.dropoffAddress}${lead.dropoffCity ? `, ${lead.dropoffCity}` : ''}${lead.dropoffState ? `, ${lead.dropoffState}` : ''}${lead.dropoffZip ? ` ${lead.dropoffZip}` : ''}`;

                          copyToClipboard(address, 'Drop-off Address');
                        }}
                      >
                        <Icon icon='solar:copy-outline' width={18} />
                      </Button>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {/* Email History */}
          {lead.emails.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className='text-xl font-semibold'>Email History</h2>
              </CardHeader>
              <CardBody>
                <div className='space-y-3'>
                  {lead.emails.map((email) => (
                    <div
                      key={email.id}
                      className='border-default-200 border-b pb-3 last:border-0'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium'>{email.subject}</p>
                          <p className='text-default-500 text-sm'>
                            To: {email.sentTo}
                            {email.template && (
                              <span className='ml-2'>
                                • Template: {email.template.name}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className='text-default-500 text-sm'>
                          {formatDate(email.sentAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Quote Amounts */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Quote Amounts</h2>
            </CardHeader>
            <CardBody className='space-y-3'>
              <Input
                inputMode='numeric'
                label='Open Quote'
                pattern='[0-9]*'
                placeholder='e.g., 1200'
                type='text'
                value={openQuote}
                onChange={(e) =>
                  setOpenQuote(sanitizeQuoteValue(e.target.value))
                }
              />
              <Input
                inputMode='numeric'
                label='Enclosed Quote'
                pattern='[0-9]*'
                placeholder='e.g., 1800'
                type='text'
                value={enclosedQuote}
                onChange={(e) =>
                  setEnclosedQuote(sanitizeQuoteValue(e.target.value))
                }
              />
              <Button
                className='w-full'
                color='primary'
                isLoading={isSavingQuotes}
                onPress={handleQuoteUpdate}
              >
                Save Quotes
              </Button>
            </CardBody>
          </Card>

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
                  const newStatus = Array.from(keys)[0] as Lead['status'];

                  handleStatusUpdate(newStatus);
                }}
              >
                <SelectItem key='NEW'>New</SelectItem>
                <SelectItem key='CONTACTED'>Contacted</SelectItem>
                <SelectItem key='QUOTED'>Quoted</SelectItem>
                <SelectItem key='CONVERTED'>Converted</SelectItem>
                <SelectItem key='LOST'>Lost</SelectItem>
              </Select>
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <h2 className='text-lg font-semibold'>Internal Notes</h2>
            </CardHeader>
            <CardBody className='space-y-3'>
              <Textarea
                minRows={6}
                placeholder='Add notes about this lead...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                className='w-full'
                color='primary'
                isLoading={isSaving}
                onPress={handleNotesUpdate}
              >
                Save Notes
              </Button>
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
                isDisabled={!lead.email}
                startContent={<Icon icon='solar:letter-outline' width={20} />}
                variant='bordered'
                onPress={onEmailOpen}
              >
                Send Email
              </Button>
              <Button
                className='w-full justify-start'
                isDisabled={!lead.phone}
                startContent={
                  <Icon icon='solar:phone-calling-outline' width={20} />
                }
                variant='bordered'
                onPress={() => {
                  if (lead.phone) {
                    window.location.href = `tel:${lead.phone.replace(/\D/g, '')}`;
                  }
                }}
              >
                Call Lead
              </Button>
              {lead.formType === 'SHIPPING_QUOTE' && !hasLoad && (
                <Button
                  className='w-full justify-start'
                  color='success'
                  startContent={<Icon icon='solar:truck-outline' width={20} />}
                  variant='bordered'
                  onPress={onConvertOpen}
                >
                  Convert to Load
                </Button>
              )}
              {hasLoad && (
                <Button
                  className='w-full justify-start'
                  color='primary'
                  startContent={<Icon icon='solar:truck-outline' width={20} />}
                  variant='bordered'
                  onPress={async () => {
                    const response = await fetch(
                      `/api/loads?leadId=${lead.id}`
                    );

                    if (response.ok) {
                      const data = await response.json();

                      if (data.loads && data.loads.length > 0) {
                        router.push(`/loads/${data.loads[0].id}`);
                      }
                    }
                  }}
                >
                  View Load
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Send Email Modal */}
      <Modal
        isOpen={isEmailOpen}
        scrollBehavior='inside'
        size='2xl'
        onOpenChange={onEmailOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Send Email to {lead.email || 'Lead'}</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <Select
                    label='Select Template (or write custom)'
                    placeholder='Choose a template...'
                    selectedKeys={
                      selectedTemplateId ? [selectedTemplateId] : []
                    }
                    onSelectionChange={(keys) => {
                      const templateId = Array.from(keys)[0] as string;

                      setSelectedTemplateId(templateId || '');
                      if (templateId) {
                        const template = templates.find(
                          (t) => t.id === templateId
                        );

                        if (template) {
                          setCustomSubject(template.subject);
                          setCustomBody(template.body);
                        }
                      }
                    }}
                  >
                    {templates.map((template) => (
                      <SelectItem key={template.id}>{template.name}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    isRequired
                    label='Subject'
                    placeholder='Email subject...'
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />

                  <Textarea
                    isRequired
                    label='Body'
                    minRows={8}
                    placeholder='Email body...'
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                  />

                  <div className='bg-default-100 rounded-lg p-3 text-sm'>
                    <p className='mb-2 font-semibold'>Available Variables:</p>
                    <ul className='text-default-600 list-inside list-disc space-y-1 text-xs'>
                      <li>
                        <code>{'{{lead.name}}'}</code> - Full name
                      </li>
                      <li>
                        <code>{'{{lead.firstName}}'}</code> - First name
                      </li>
                      <li>
                        <code>{'{{lead.email}}'}</code> - Email
                      </li>
                      <li>
                        <code>{'{{lead.phone}}'}</code> - Phone
                      </li>
                      <li>
                        <code>{'{{lead.vehicle}}'}</code> - Vehicle
                      </li>
                      <li>
                        <code>{'{{lead.pickupLocation}}'}</code> - Pickup
                        address
                      </li>
                      <li>
                        <code>{'{{lead.dropoffLocation}}'}</code> - Drop-off
                        address
                      </li>
                      <li>
                        <code>{'{{lead.openQuote}}'}</code> - Open transport
                        quote
                      </li>
                      <li>
                        <code>{'{{lead.enclosedQuote}}'}</code> - Enclosed
                        transport quote
                      </li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isDisabled={!customSubject || !customBody}
                  isLoading={isSendingEmail}
                  onPress={handleSendEmail}
                >
                  Send Email
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Convert to Load Modal */}
      <Modal isOpen={isConvertOpen} onOpenChange={onConvertOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Convert Lead to Load</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <p className='text-default-500 text-sm'>
                    Select the load type for this shipment. This will create a
                    new load and mark the lead as converted.
                  </p>
                  <Select
                    label='Load Type'
                    placeholder='Select load type'
                    selectedKeys={[]}
                    onSelectionChange={async (keys) => {
                      const loadType = Array.from(keys)[0] as
                        | 'OPEN'
                        | 'ENCLOSED';

                      if (!loadType) return;

                      setIsConverting(true);
                      try {
                        const response = await fetch('/api/loads', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            leadId: lead.id,
                            loadType,
                          }),
                        });

                        if (response.ok) {
                          const load = await response.json();

                          // Invalidate both leads and loads cache
                          invalidateLeads();
                          invalidateLoads();
                          router.push(`/loads/${load.id}`);
                        } else {
                          const error = await response.json();

                          alert(error.error || 'Failed to create load');
                        }
                      } catch (error) {
                        console.error('Error creating load:', error);
                        alert('Failed to create load');
                      } finally {
                        setIsConverting(false);
                        onClose();
                      }
                    }}
                  >
                    <SelectItem key='OPEN'>Open</SelectItem>
                    <SelectItem key='ENCLOSED'>Enclosed</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  isDisabled={isConverting}
                  variant='light'
                  onPress={onClose}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Convert to Load Modal */}
      <Modal isOpen={isConvertOpen} onOpenChange={onConvertOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Convert Lead to Load</ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <p className='text-default-500 text-sm'>
                    Select the load type for this shipment. This will create a
                    new load and mark the lead as converted.
                  </p>
                  <Select
                    label='Load Type'
                    placeholder='Select load type'
                    selectedKeys={[]}
                    onSelectionChange={async (keys) => {
                      const loadType = Array.from(keys)[0] as
                        | 'OPEN'
                        | 'ENCLOSED';

                      if (!loadType) return;

                      setIsConverting(true);
                      try {
                        const response = await fetch('/api/loads', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            leadId: lead.id,
                            loadType,
                          }),
                        });

                        if (response.ok) {
                          const load = await response.json();

                          // Invalidate both leads and loads cache
                          invalidateLeads();
                          invalidateLoads();
                          router.push(`/loads/${load.id}`);
                        } else {
                          const error = await response.json();

                          alert(error.error || 'Failed to create load');
                        }
                      } catch (error) {
                        console.error('Error creating load:', error);
                        alert('Failed to create load');
                      } finally {
                        setIsConverting(false);
                        onClose();
                      }
                    }}
                  >
                    <SelectItem key='OPEN'>Open</SelectItem>
                    <SelectItem key='ENCLOSED'>Enclosed</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  isDisabled={isConverting}
                  variant='light'
                  onPress={onClose}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
