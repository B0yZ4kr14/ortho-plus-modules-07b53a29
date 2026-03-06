import { apiClient } from "@/lib/api/apiClient";
import { useQuery } from "@tanstack/react-query";

export interface CampaignROI {
  campaign: string;
  budget: number;
  patients: number;
  converted: number;
  conversionRate: number;
  cac: number;
}

export interface SourcePerformance {
  source: string;
  total: number;
  converted: number;
  conversionRate: number;
}

export interface MarketingMetrics {
  totalBudget: number;
  cac: number;
  totalPatients: number;
  convertedPatients: number;
  conversionRate: number;
  roi: number;
  campaignROI: CampaignROI[];
  sourcePerformance: SourcePerformance[];
}

export function useMarketingROI() {
  return useQuery({
    queryKey: ["marketing-roi"],
    queryFn: async () => {
      const data = await apiClient.get<{ metrics: MarketingMetrics }>(
        "/analytics/marketing-roi",
      );
      return data.metrics;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
