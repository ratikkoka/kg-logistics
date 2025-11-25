import { useQuery, useQueryClient } from '@tanstack/react-query';

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

interface ContactsResponse {
  leads: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ContactsQueryParams {
  page?: number;
  limit?: number;
  status?: ContactStatus | 'all';
  search?: string;
}

export function useContacts(params: ContactsQueryParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        formType: 'CONTACT',
      });

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status && params.status !== 'all')
        queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`/api/leads?${queryParams.toString()}`);

      if (!response.ok) throw new Error('Failed to fetch contacts');

      return response.json() as Promise<ContactsResponse>;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for contacts data
    refetchOnMount: true, // Always refetch if data is stale when component mounts
  });
}

// Hook to invalidate contacts cache and refetch
export function useInvalidateContacts() {
  const queryClient = useQueryClient();

  return async () => {
    // Invalidate queries - this marks them as stale
    // Use 'all' to refetch when queries are next used (when dashboard mounts)
    await queryClient.invalidateQueries({
      queryKey: ['contacts'],
      refetchType: 'all', // Refetch all matching queries when next used
    });
  };
}
