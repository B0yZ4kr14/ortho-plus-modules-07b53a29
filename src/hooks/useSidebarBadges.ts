import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SidebarBadges {
  appointments: number;
  overdue: number;
  defaulters: number;
  recalls: number;
  messages: number;
}

export function useSidebarBadges() {
  return useQuery({
    queryKey: ['sidebar-badges'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('sidebar-badges');

      if (error) throw error;
      return data.badges as SidebarBadges;
    },
    refetchInterval: 1000 * 60 * 2, // Atualiza a cada 2 minutos
    staleTime: 1000 * 60, // 1 minuto
  });
}
