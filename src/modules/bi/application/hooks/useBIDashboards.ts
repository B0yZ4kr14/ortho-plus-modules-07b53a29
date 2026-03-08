import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBIDashboards = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ["bi-dashboards", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<any[]>("/bi/dashboards");
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["bi-metrics", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      const data = await apiClient.get<any[]>("/bi/metricas");
      return data || [];
    },
    enabled: !!clinicId,
  });

  const createDashboard = useMutation({
    mutationFn: async (dashboardData: any) => {
      const data = await apiClient.post<any>("/bi/dashboards", {
        ...dashboardData,
        created_by: user?.id,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bi-dashboards", clinicId] });
      toast.success("Dashboard criado!");
    },
    onError: () => {
      toast.error("Erro ao criar dashboard");
    },
  });

  return {
    dashboards,
    metrics,
    isLoading: isLoading || isLoadingMetrics,
    createDashboard: createDashboard.mutate,
  };
};
