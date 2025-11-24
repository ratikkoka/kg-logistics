'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
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
// Using Prisma types - will be available after migration
type Lead = {
  id: string;
  formType: 'CONTACT' | 'SHIPPING_QUOTE';
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';
  firstName: string | null;
  lastName: string | null;
  email: string;
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
};

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'LOST';
type FormType = 'CONTACT' | 'SHIPPING_QUOTE';

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusColors: Record<
  LeadStatus,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  NEW: 'primary',
  CONTACTED: 'secondary',
  QUOTED: 'warning',
  CONVERTED: 'success',
  LOST: 'danger',
};

const statusLabels: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUOTED: 'Quoted',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

interface DashboardStats {
  total: number;
  statusCounts: {
    NEW: number;
    CONTACTED: number;
    QUOTED: number;
    CONVERTED: number;
    LOST: number;
  };
  formTypeCounts: {
    CONTACT: number;
    SHIPPING_QUOTE: number;
  };
  conversionRate: string;
  quotesWithValues: number;
  recentLeads: number;
  weeklyLeads: number;
  avgOpenQuote: number;
  avgEnclosedQuote: number;
  totalOpenQuoteValue: number;
  totalEnclosedQuoteValue: number;
}

export default function LeadsDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [formTypeFilter, setFormTypeFilter] = useState<FormType | 'all'>(
    'SHIPPING_QUOTE'
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (formTypeFilter !== 'all') {
        params.append('formType', formTypeFilter);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data: LeadsResponse = await response.json();

      setLeads(data.leads);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats');

      if (response.ok) {
        const data = await response.json();

        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, formTypeFilter]);

  // Fetch stats only once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchLeads();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

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

  const getLeadName = (lead: Lead) => {
    if (lead.firstName || lead.lastName) {
      return `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
    }

    return 'Unknown';
  };

  // Calculate percentages for circular charts
  const getStatusPercentage = (status: LeadStatus) => {
    if (!stats || stats.total === 0) return 0;

    return (stats.statusCounts[status] / stats.total) * 100;
  };

  // Circular progress component
  const CircularProgress = ({
    percentage,
    color,
    size = 120,
    strokeWidth = 8,
  }: {
    percentage: number;
    color: string;
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className='relative' style={{ width: size, height: size }}>
        <svg className='-rotate-90 transform' height={size} width={size}>
          <circle
            className='text-default-200'
            cx={size / 2}
            cy={size / 2}
            fill='none'
            r={radius}
            stroke='currentColor'
            strokeWidth={strokeWidth}
          />
          <circle
            className={`transition-all duration-500 ${color}`}
            cx={size / 2}
            cy={size / 2}
            fill='none'
            r={radius}
            stroke='currentColor'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-lg font-bold sm:text-xl md:text-2xl'>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* KPI Stat Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Total Leads
                </p>
                <p className='text-3xl font-bold'>{stats?.total || total}</p>
              </div>
              <div className='rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20'>
                <Icon
                  className='text-blue-600 dark:text-blue-400'
                  icon='solar:graph-up-outline'
                  width={24}
                />
              </div>
            </div>
            <div className='text-default-400 flex items-center gap-1 text-sm'>
              <Icon icon='solar:calendar-outline' width={16} />
              <span>{stats?.weeklyLeads || 0} this week</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  New Leads
                </p>
                <p className='text-3xl font-bold'>
                  {stats?.statusCounts.NEW ||
                    leads.filter((l) => l.status === 'NEW').length}
                </p>
              </div>
              <div className='rounded-lg bg-green-100 p-3 dark:bg-green-900/20'>
                <Icon
                  className='text-green-600 dark:text-green-400'
                  icon='solar:star-outline'
                  width={24}
                />
              </div>
            </div>
            <div className='text-default-400 flex items-center gap-1 text-sm'>
              <Icon icon='solar:calendar-outline' width={16} />
              <span>{stats?.recentLeads || 0} last 30 days</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Converted
                </p>
                <p className='text-3xl font-bold'>
                  {stats?.statusCounts.CONVERTED ||
                    leads.filter((l) => l.status === 'CONVERTED').length}
                </p>
              </div>
              <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20'>
                <Icon
                  className='text-purple-600 dark:text-purple-400'
                  icon='solar:check-circle-outline'
                  width={24}
                />
              </div>
            </div>
            <div className='text-default-400 flex items-center gap-1 text-sm'>
              <Icon icon='solar:chart-outline' width={16} />
              <span>{stats?.conversionRate || '0'}% conversion rate</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>Quoted</p>
                <p className='text-3xl font-bold'>
                  {stats?.statusCounts.QUOTED ||
                    leads.filter((l) => l.status === 'QUOTED').length}
                </p>
              </div>
              <div className='rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20'>
                <Icon
                  className='text-orange-600 dark:text-orange-400'
                  icon='solar:dollar-outline'
                  width={24}
                />
              </div>
            </div>
            <div className='text-default-400 flex items-center gap-1 text-sm'>
              <Icon icon='solar:wallet-outline' width={16} />
              <span>{stats?.quotesWithValues || 0} with values</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Status Distribution</h3>
          </CardHeader>
          <CardBody>
            {statsLoading ? (
              <div className='flex justify-center py-8'>
                <Spinner size='lg' />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5'>
                {(
                  [
                    'NEW',
                    'CONTACTED',
                    'QUOTED',
                    'CONVERTED',
                    'LOST',
                  ] as LeadStatus[]
                ).map((status) => {
                  const percentage = getStatusPercentage(status);
                  const count = stats?.statusCounts[status] || 0;
                  const colors = {
                    NEW: 'text-blue-500',
                    CONTACTED: 'text-secondary-500',
                    QUOTED: 'text-warning-500',
                    CONVERTED: 'text-success-500',
                    LOST: 'text-danger-500',
                  };

                  return (
                    <div
                      key={status}
                      className='flex flex-col items-center gap-2'
                    >
                      <div className='scale-75 sm:scale-90 md:scale-100'>
                        <CircularProgress
                          color={colors[status]}
                          percentage={percentage}
                          size={100}
                          strokeWidth={6}
                        />
                      </div>
                      <div className='text-center'>
                        <div className='text-xs font-semibold sm:text-sm'>
                          {count}
                        </div>
                        <div className='text-default-500 text-[10px] sm:text-xs'>
                          {statusLabels[status]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quote Value Overview */}
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Quote Value Overview</h3>
          </CardHeader>
          <CardBody>
            {statsLoading ? (
              <div className='flex justify-center py-8'>
                <Spinner size='lg' />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-6'>
                <div className='flex flex-col items-center gap-2'>
                  <div className='text-default-500 text-sm font-medium'>
                    Open Quotes
                  </div>
                  <div className='text-warning text-2xl font-bold'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats?.totalOpenQuoteValue || 0)}
                  </div>
                  <div className='text-default-400 text-xs'>
                    Avg:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats?.avgOpenQuote || 0)}
                  </div>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <div className='text-default-500 text-sm font-medium'>
                    Enclosed Quotes
                  </div>
                  <div className='text-primary text-2xl font-bold'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats?.totalEnclosedQuoteValue || 0)}
                  </div>
                  <div className='text-default-400 text-xs'>
                    Avg:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats?.avgEnclosedQuote || 0)}
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className='space-y-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-3'>
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
                  const value = Array.from(keys)[0] as LeadStatus | 'all';

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
              <Select
                classNames={{
                  trigger: 'h-14',
                }}
                label='Form Type'
                selectedKeys={[formTypeFilter]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as FormType | 'all';

                  setFormTypeFilter(value);
                }}
              >
                <SelectItem key='all'>All Types</SelectItem>
                <SelectItem key='SHIPPING_QUOTE'>Shipping Quote</SelectItem>
              </Select>
            </div>
            <Button
              className='h-14'
              color='primary'
              startContent={<Icon icon='solar:add-circle-outline' width={20} />}
              onPress={() => router.push('/leads/new')}
            >
              New Lead
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spinner size='lg' />
            </div>
          ) : leads.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              No leads found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <Table aria-label='Leads table'>
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>PHONE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>VEHICLE</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className='hover:bg-default-100 cursor-pointer'
                    >
                      <TableCell
                        className='max-w-[150px] cursor-pointer sm:max-w-none'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        <div className='break-words'>{getLeadName(lead)}</div>
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        {lead.email}
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        {lead.phone || 'N/A'}
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        <Chip size='sm' variant='flat'>
                          {lead.formType === 'CONTACT' ? 'Contact' : 'Quote'}
                        </Chip>
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        <Chip
                          color={statusColors[lead.status]}
                          size='sm'
                          variant='flat'
                        >
                          {statusLabels[lead.status]}
                        </Chip>
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        {lead.make && lead.model
                          ? `${lead.year} ${lead.make} ${lead.model}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell
                        className='cursor-pointer'
                        onClick={() => router.push(`/leads/${lead.id}`)}
                      >
                        {formatDate(lead.createdAt)}
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
