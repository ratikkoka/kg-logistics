import { useQuery, useQueryClient } from '@tanstack/react-query';

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

interface LoadStats {
  total: number;
  unlistedCount: number;
  listedCount: number;
  carrierAssignedCount: number;
  pickedUpCount: number;
  completedCount: number;
  totalIncome: number;
  totalProfit: number;
  profitMargin: number;
  completionRate: number;
  avgProfit: number;
  avgDaysToComplete: string;
}

interface LoadsQueryParams {
  page?: number;
  limit?: number;
  status?: LoadStatus | 'all';
  loadType?: LoadType | 'all';
  search?: string;
}

export function useLoads(params: LoadsQueryParams = {}) {
  return useQuery({
    queryKey: ['loads', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status && params.status !== 'all')
        queryParams.append('status', params.status);
      if (params.loadType && params.loadType !== 'all')
        queryParams.append('loadType', params.loadType);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`/api/loads?${queryParams.toString()}`);

      if (!response.ok) throw new Error('Failed to fetch loads');

      return response.json() as Promise<LoadsResponse>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for loads data
    refetchOnMount: true, // Always refetch if data is stale when component mounts
  });
}

export function useLoadsStats(
  params: Omit<LoadsQueryParams, 'page' | 'limit'> = {}
) {
  return useQuery({
    queryKey: ['loads-stats', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params.status && params.status !== 'all')
        queryParams.append('status', params.status);
      if (params.loadType && params.loadType !== 'all')
        queryParams.append('loadType', params.loadType);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(
        `/api/loads/stats?${queryParams.toString()}`
      );

      if (!response.ok) throw new Error('Failed to fetch load stats');

      return response.json() as Promise<LoadStats>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for stats
    refetchOnMount: true, // Always refetch if data is stale when component mounts
  });
}

// Hook to invalidate loads cache and refetch
export function useInvalidateLoads() {
  const queryClient = useQueryClient();

  return async () => {
    // Invalidate queries - this marks them as stale
    // Use 'all' to refetch when queries are next used (when dashboard mounts)
    await queryClient.invalidateQueries({
      queryKey: ['loads'],
      refetchType: 'all', // Refetch all matching queries when next used
    });
    await queryClient.invalidateQueries({
      queryKey: ['loads-stats'],
      refetchType: 'all',
    });
  };
}
