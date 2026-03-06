import { apiClient } from "@/lib/api/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface SearchResult {
  id: string;
  type: "patient" | "budget" | "appointment";
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
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (query.length < 2) {
        return { patients: [], budgets: [], appointments: [] } as SearchResults;
      }

      const data = await apiClient.post<{ results: SearchResults }>(
        "/search/global",
        { query },
      );
      return data.results;
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30, // 30 segundos
  });
}
