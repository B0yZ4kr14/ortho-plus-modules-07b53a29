import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealTimeStatsOptions {
  table: string;
  where?: Record<string, any>;
  count?: boolean;
}

export function useRealTimeStats({ table, where, count = true }: UseRealTimeStatsOptions) {
  const { clinicId } = useAuth();

  const { data: value = 0, isLoading } = useQuery({
    queryKey: ['real-time-stats', table, where, clinicId],
    queryFn: async () => {
      let query = supabase
        .from(table as any)
        .select('*', { count: 'exact', head: count });

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      if (where) {
        Object.entries(where).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      }

      const { count: total, error } = await query;
      
      if (error) {
        console.error('Error fetching stats:', error);
        return 0;
      }

      return total || 0;
    },
    enabled: !!clinicId,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  return { value, isLoading };
}
