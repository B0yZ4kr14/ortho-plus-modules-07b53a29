import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface BIMetric {
  id: string;
  clinic_id: string;
  metric_key: string;
  name: string;
  value: number;
  trend?: number;
  calculation_type: string;
  aggregation_period: string;
  last_calculated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BIWidget {
  id: string;
  dashboard_id: string;
  clinic_id: string;
  name: string;
  widget_type: string;
  chart_type?: string;
  data_source: string;
  query_config: any;
  display_config?: any;
  created_at: string;
}

export function useBIMetrics() {
  const { user, clinicId } = useAuth();

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ["bi-metrics", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<BIMetric[]>("/bi/metricas");
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: dashboards = [], isLoading: loadingDashboards } = useQuery({
    queryKey: ["bi-dashboards", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<any[]>("/bi/dashboards");
      return data || [];
    },
    enabled: !!clinicId,
  });

  const { data: widgets = [], isLoading: loadingWidgets } = useQuery({
    queryKey: ["bi-widgets", clinicId],
    queryFn: async () => {
      if (dashboards.length === 0) return [];
      const data = await apiClient.get<BIWidget[]>("/bi/widgets");
      return data || [];
    },
    enabled: !!clinicId && dashboards.length > 0,
  });

  // Calculated metrics from existing data
  const calculatedMetrics = {
    totalRevenue:
      metrics.find((m) => m.metric_key === "total_revenue")?.value || 0,
    newPatients:
      metrics.find((m) => m.metric_key === "new_patients")?.value || 0,
    occupancyRate:
      metrics.find((m) => m.metric_key === "occupancy_rate")?.value || 0,
    avgTicket: metrics.find((m) => m.metric_key === "avg_ticket")?.value || 0,
  };

  return {
    metrics,
    dashboards,
    widgets,
    calculatedMetrics,
    isLoading: loadingMetrics || loadingDashboards || loadingWidgets,
  };
}
