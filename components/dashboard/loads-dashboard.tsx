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
  Spinner,
  Pagination,
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
  make: string | null;
  model: string | null;
  year: string | null;
  carrierName: string | null;
  quotedCost: string | null;
  carrierCost: string | null;
  pickupContactName: string | null;
  dropoffContactName: string | null;
  createdAt: Date;
  lead: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

type LoadStatus =
  | 'UNLISTED'
  | 'LISTED'
  | 'CARRIER_ASSIGNED'
  | 'PICKED_UP'
  | 'COMPLETED';
type LoadType = 'OPEN' | 'ENCLOSED';

interface LoadsResponse {
  loads: Load[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusColors: Record<
  LoadStatus,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  UNLISTED: 'danger',
  LISTED: 'primary',
  CARRIER_ASSIGNED: 'secondary',
  PICKED_UP: 'warning',
  COMPLETED: 'success',
};

const statusLabels: Record<LoadStatus, string> = {
  UNLISTED: 'Unlisted',
  LISTED: 'Listed',
  CARRIER_ASSIGNED: 'Carrier Assigned',
  PICKED_UP: 'Picked Up',
  COMPLETED: 'Completed',
};

interface LoadStats {
  total: number;
  statusCounts: {
    UNLISTED: number;
    LISTED: number;
    CARRIER_ASSIGNED: number;
    PICKED_UP: number;
    COMPLETED: number;
  };
  loadTypeCounts: {
    OPEN: number;
    ENCLOSED: number;
  };
  totalIncome: number;
  totalProfit: number;
  avgProfit: number;
  totalRevenue: number;
  totalCarrierCosts: number;
  profitMargin: string;
  completionRate: string;
  recentLoads: number;
  weeklyLoads: number;
  avgDaysToComplete: string;
  completedCount: number;
}

export default function LoadsDashboard() {
  const router = useRouter();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LoadStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoadStatus | 'all'>('all');
  const [loadTypeFilter, setLoadTypeFilter] = useState<LoadType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (loadTypeFilter !== 'all') {
        params.append('loadType', loadTypeFilter);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/loads?${params.toString()}`);
      const data: LoadsResponse = await response.json();

      setLoads(data.loads);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching loads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      // Build query params with current filters
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (loadTypeFilter !== 'all') {
        params.append('loadType', loadTypeFilter);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/loads/stats?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();

        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, [page, statusFilter, loadTypeFilter]);

  // Fetch stats when filters change (to reflect filtered data)
  useEffect(() => {
    fetchStats();
  }, [statusFilter, loadTypeFilter]);

  // Debounce stats fetch for search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchLoads();
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
    });
  };

  const getCustomerName = (load: Load) => {
    if (load.lead.firstName || load.lead.lastName) {
      return `${load.lead.firstName || ''} ${load.lead.lastName || ''}`.trim();
    }

    return load.lead.email;
  };

  const calculateProfit = (quoted: string | null, carrier: string | null) => {
    if (!quoted || !carrier) return null;
    const quotedNum = parseFloat(quoted);
    const carrierNum = parseFloat(carrier);

    if (isNaN(quotedNum) || isNaN(carrierNum)) return null;

    return (quotedNum - carrierNum).toFixed(2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className='space-y-6'>
      {/* KPI Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Total Income */}
        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Total Income
                </p>
                <p className='text-3xl font-bold'>
                  {statsLoading
                    ? '...'
                    : formatCurrency(stats?.totalIncome || 0)}
                </p>
                <div className='text-default-400 flex items-center gap-1 text-xs'>
                  <Icon icon='solar:check-circle-outline' width={12} />
                  <span>{stats?.completedCount || 0} completed loads</span>
                </div>
              </div>
              <div className='rounded-lg bg-green-100 p-3 dark:bg-green-900/20'>
                <Icon
                  className='text-green-600 dark:text-green-400'
                  icon='solar:dollar-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Total Profit */}
        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Total Profit
                </p>
                <p className='text-3xl font-bold'>
                  {statsLoading
                    ? '...'
                    : formatCurrency(stats?.totalProfit || 0)}
                </p>
                <div className='text-default-400 flex items-center gap-1 text-xs'>
                  <Icon icon='solar:chart-outline' width={12} />
                  <span>
                    {(stats?.completedCount || 0) > 0
                      ? formatCurrency(stats?.avgProfit || 0)
                      : '$0'}{' '}
                    avg per load
                  </span>
                </div>
              </div>
              <div className='rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/20'>
                <Icon
                  className='text-emerald-600 dark:text-emerald-400'
                  icon='solar:wallet-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Profit Margin */}
        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Profit Margin
                </p>
                <p className='text-3xl font-bold'>
                  {statsLoading ? '...' : `${stats?.profitMargin || '0'}%`}
                </p>
                <div className='text-default-400 flex items-center gap-1 text-xs'>
                  <Icon icon='solar:chart-2-outline' width={12} />
                  <span>Average margin across all loads</span>
                </div>
              </div>
              <div className='rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20'>
                <Icon
                  className='text-blue-600 dark:text-blue-400'
                  icon='solar:graph-up-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Completion Rate
                </p>
                <p className='text-3xl font-bold'>
                  {statsLoading ? '...' : `${stats?.completionRate || '0'}%`}
                </p>
                <div className='text-default-400 flex items-center gap-1 text-xs'>
                  <Icon icon='solar:calendar-outline' width={12} />
                  <span>{stats?.weeklyLoads || 0} this week</span>
                </div>
              </div>
              <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20'>
                <Icon
                  className='text-purple-600 dark:text-purple-400'
                  icon='solar:check-circle-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Status Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Total Loads
                </p>
                <p className='text-3xl font-bold'>{total}</p>
              </div>
              <div className='rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20'>
                <Icon
                  className='text-blue-600 dark:text-blue-400'
                  icon='solar:truck-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>Listed</p>
                <p className='text-3xl font-bold'>
                  {stats?.statusCounts.LISTED || 0}
                </p>
              </div>
              <div className='rounded-lg bg-green-100 p-3 dark:bg-green-900/20'>
                <Icon
                  className='text-green-600 dark:text-green-400'
                  icon='solar:list-check-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>Unlisted</p>
                <p className='text-3xl font-bold'>
                  {stats?.statusCounts.UNLISTED || 0}
                </p>
              </div>
              <div className='rounded-lg bg-red-100 p-3 dark:bg-red-900/20'>
                <Icon
                  className='text-red-600 dark:text-red-400'
                  icon='solar:close-circle-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  In Progress
                </p>
                <p className='text-3xl font-bold'>
                  {(stats?.statusCounts.CARRIER_ASSIGNED || 0) +
                    (stats?.statusCounts.PICKED_UP || 0)}
                </p>
              </div>
              <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20'>
                <Icon
                  className='text-purple-600 dark:text-purple-400'
                  icon='solar:route-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className='gap-3'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='text-default-500 text-sm font-medium'>
                  Completed
                </p>
                <p className='text-3xl font-bold'>
                  {stats?.statusCounts.COMPLETED || 0}
                </p>
              </div>
              <div className='rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20'>
                <Icon
                  className='text-orange-600 dark:text-orange-400'
                  icon='solar:check-circle-outline'
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <Input
              classNames={{
                inputWrapper: 'h-14',
              }}
              placeholder='Search by name, vehicle, or carrier...'
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
                const value = Array.from(keys)[0] as LoadStatus | 'all';

                setStatusFilter(value);
              }}
            >
              <SelectItem key='all'>All Statuses</SelectItem>
              <SelectItem key='UNLISTED'>Unlisted</SelectItem>
              <SelectItem key='LISTED'>Listed</SelectItem>
              <SelectItem key='CARRIER_ASSIGNED'>Carrier Assigned</SelectItem>
              <SelectItem key='PICKED_UP'>Picked Up</SelectItem>
              <SelectItem key='COMPLETED'>Completed</SelectItem>
            </Select>
            <Select
              classNames={{
                trigger: 'h-14',
              }}
              label='Load Type'
              selectedKeys={[loadTypeFilter]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as LoadType | 'all';

                setLoadTypeFilter(value);
              }}
            >
              <SelectItem key='all'>All Types</SelectItem>
              <SelectItem key='OPEN'>Open</SelectItem>
              <SelectItem key='ENCLOSED'>Enclosed</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Loads Table */}
      <Card>
        <CardBody>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spinner size='lg' />
            </div>
          ) : loads.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              No loads found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <Table aria-label='Loads table'>
                <TableHeader>
                  <TableColumn>CUSTOMER</TableColumn>
                  <TableColumn>VEHICLE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>CARRIER</TableColumn>
                  <TableColumn>PROFIT</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                </TableHeader>
                <TableBody>
                  {loads.map((load) => {
                    const profit = calculateProfit(
                      load.quotedCost,
                      load.carrierCost
                    );

                    return (
                      <TableRow
                        key={load.id}
                        className='hover:bg-default-100 cursor-pointer'
                        onClick={() => router.push(`/loads/${load.id}`)}
                      >
                        <TableCell className='font-medium'>
                          {getCustomerName(load)}
                        </TableCell>
                        <TableCell>
                          {load.year && load.make && load.model
                            ? `${load.year} ${load.make} ${load.model}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={
                              load.loadType === 'OPEN' ? 'warning' : 'primary'
                            }
                            size='sm'
                            variant='flat'
                          >
                            {load.loadType}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={statusColors[load.status]}
                            size='sm'
                            variant='flat'
                          >
                            {statusLabels[load.status]}
                          </Chip>
                        </TableCell>
                        <TableCell>{load.carrierName || 'N/A'}</TableCell>
                        <TableCell>
                          {profit ? (
                            <span
                              className={
                                parseFloat(profit) >= 0
                                  ? 'text-success'
                                  : 'text-danger'
                              }
                            >
                              ${profit}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{formatDate(load.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
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
