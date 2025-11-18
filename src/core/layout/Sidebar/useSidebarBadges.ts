import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/apiClient';

export function useSidebarBadges() {
  const { clinicId } = useAuth();
  
  const { data: badges } = useQuery({
    queryKey: ['sidebar-badges', clinicId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{
          appointmentsToday: number;
          overdueInvoices: number;
          defaulters: number;
          pendingRecalls: number;
          unreadMessages: number;
        }>(`/dashboard/sidebar-badges`);
        return response;
      } catch (error) {
        console.error('Error fetching sidebar badges:', error);
        return {
          appointmentsToday: 0,
          overdueInvoices: 0,
          defaulters: 0,
          pendingRecalls: 0,
          unreadMessages: 0
        };
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30s
    enabled: !!clinicId
  });
  
  return badges || {
    appointmentsToday: 0,
    overdueInvoices: 0,
    defaulters: 0,
    pendingRecalls: 0,
    unreadMessages: 0
  };
}
