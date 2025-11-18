import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    queryKey: ['marketing-roi'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('marketing-roi');

      if (error) throw error;
      return data.metrics as MarketingMetrics;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
