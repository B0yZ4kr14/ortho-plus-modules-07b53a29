import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useQuery } from "@tanstack/react-query";

interface UseRealTimeStatsOptions {
  table: string;
  where?: Record<string, any>;
  count?: boolean;
}

export function useRealTimeStats({
  table,
  where,
  count = true,
}: UseRealTimeStatsOptions) {
  const { clinicId } = useAuth();

  const { data: value = 0, isLoading } = useQuery({
    queryKey: ["real-time-stats", table, where, clinicId],
    queryFn: async () => {
      try {
        const data = await apiClient.get<{ total: number }>(
          "/analytics/real-time-stats",
          {
            params: { table, where: JSON.stringify(where), count },
          },
        );
        return data.total || 0;
      } catch (error) {
        console.error("Error fetching stats:", error);
        return 0;
      }
    },
    enabled: !!clinicId,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  return { value, isLoading };
}
