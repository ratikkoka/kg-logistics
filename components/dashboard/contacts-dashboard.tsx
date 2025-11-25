'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Select,
  SelectItem,
  Button,
  Spinner,
  Pagination,
} from '@heroui/react';
import { Icon } from '@iconify/react';

import { useContacts } from '@/lib/queries/contacts';

type Contact = {
  id: string;
  formType: 'CONTACT';
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  notes: string | null;
  assignedTo: string | null;
  lastContactedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ContactStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';

const statusColors: Record<
  ContactStatus,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  NEW: 'primary',
  CONTACTED: 'secondary',
  QUOTED: 'warning',
  CONVERTED: 'success',
  LOST: 'danger',
};

const statusLabels: Record<ContactStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUOTED: 'Quoted',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

export default function ContactsDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>(
    'all'
  );
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (page !== 1) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, page]);

  // Use React Query hook
  const { data: contactsData, isLoading: loading } = useContacts({
    page,
    limit: 10,
    status: statusFilter,
    search: debouncedSearch,
  });

  // Extract data from query results
  const contacts = contactsData?.leads || [];
  const totalPages = contactsData?.pagination.totalPages || 1;

  const getContactName = (contact: Contact) => {
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    }

    return contact.email;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardBody className='space-y-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
              <Input
                classNames={{
                  inputWrapper: 'h-14',
                }}
                placeholder='Search by name, email, or phone...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                classNames={{
                  trigger: 'h-14',
                }}
                label='Status'
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as ContactStatus | 'all';

                  setStatusFilter(value);
                }}
              >
                <SelectItem key='all'>All Statuses</SelectItem>
                <SelectItem key='NEW'>New</SelectItem>
                <SelectItem key='CONTACTED'>Contacted</SelectItem>
                <SelectItem key='QUOTED'>Quoted</SelectItem>
                <SelectItem key='CONVERTED'>Converted</SelectItem>
                <SelectItem key='LOST'>Lost</SelectItem>
              </Select>
            </div>
            <Button
              className='h-14'
              color='primary'
              startContent={<Icon icon='solar:add-circle-outline' width={20} />}
              onPress={() => router.push('/leads/new')}
            >
              New Contact
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spinner size='lg' />
            </div>
          ) : contacts.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              No contacts found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <Table aria-label='Contacts table'>
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>PHONE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>MESSAGE</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className='hover:bg-default-100 cursor-pointer'
                    >
                      <TableCell
                        className='max-w-[150px] cursor-pointer sm:max-w-none'
                        onClick={() => router.push(`/leads/${contact.id}`)}
                      >
                        <div className='break-words'>
                          {getContactName(contact)}
                        </div>
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${contact.id}`)}
                      >
                        {contact.email}
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${contact.id}`)}
                      >
                        {contact.phone || 'N/A'}
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${contact.id}`)}
                      >
                        <Chip
                          color={statusColors[contact.status]}
                          size='sm'
                          variant='flat'
                        >
                          {statusLabels[contact.status]}
                        </Chip>
                      </TableCell>
                      <TableCell
                        className='max-w-[200px] cursor-pointer'
                        onClick={() => router.push(`/leads/${contact.id}`)}
                      >
                        <div className='truncate'>
                          {contact.message || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${contact.id}`)}
                      >
                        {formatDate(contact.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className='mt-4 flex justify-center'>
                <Pagination
                  showControls
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
