import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'patient' | 'budget' | 'appointment';
  title: string;
  subtitle: string;
  url: string;
}

export interface SearchResults {
  patients: SearchResult[];
  budgets: SearchResult[];
  appointments: SearchResult[];
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      if (query.length < 2) {
        return { patients: [], budgets: [], appointments: [] } as SearchResults;
      }

      const { data, error } = await supabase.functions.invoke('global-search', {
        body: { query }
      });

      if (error) throw error;
      return data.results as SearchResults;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 segundos
  });
}
