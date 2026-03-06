import { apiClient } from "@/lib/api/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface SidebarBadges {
  appointments: number;
  overdue: number;
  defaulters: number;
  recalls: number;
  messages: number;
}

export function useSidebarBadges() {
  return useQuery({
    queryKey: ["sidebar-badges"],
    queryFn: async () => {
      const data = await apiClient.get<{ badges: SidebarBadges }>(
        "/analytics/sidebar-badges",
      );
      return data.badges;
    },
    refetchInterval: 1000 * 60 * 2, // Atualiza a cada 2 minutos
    staleTime: 1000 * 60, // 1 minuto
  });
}
