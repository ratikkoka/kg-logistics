import { useQuery, useQueryClient } from '@tanstack/react-query';

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

interface LeadsQueryParams {
  page?: number;
  limit?: number;
  status?: LeadStatus | 'all';
  formType?: FormType | 'all';
  search?: string;
}

export function useLeads(params: LeadsQueryParams = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status && params.status !== 'all')
        queryParams.append('status', params.status);
      if (params.formType && params.formType !== 'all')
        queryParams.append('formType', params.formType);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`/api/leads?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Failed to fetch leads (${response.status})`;

        throw new Error(errorMessage);
      }

      return response.json() as Promise<LeadsResponse>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for leads data
    refetchOnMount: true, // Always refetch if data is stale when component mounts
  });
}

export function useLeadsStats() {
  return useQuery({
    queryKey: ['leads-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Failed to fetch stats (${response.status})`;

        throw new Error(errorMessage);
      }

      return response.json() as Promise<DashboardStats>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes for stats
    refetchOnMount: true, // Always refetch if data is stale when component mounts
  });
}

// Hook to invalidate leads cache and refetch
export function useInvalidateLeads() {
  const queryClient = useQueryClient();

  return async () => {
    // Invalidate queries - this marks them as stale
    // Use 'all' to refetch when queries are next used (when dashboard mounts)
    await queryClient.invalidateQueries({
      queryKey: ['leads'],
      refetchType: 'all', // Refetch all matching queries when next used
    });
    await queryClient.invalidateQueries({
      queryKey: ['leads-stats'],
      refetchType: 'all',
    });
  };
}
