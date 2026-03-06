import { useCallback, useEffect, useState } from "react";
import {
  CampaignMetricsResult,
  GetCampaignMetricsUseCase,
} from "../../application/use-cases/GetCampaignMetricsUseCase";
import { CampaignRepositoryApi } from "../../infrastructure/repositories/CampaignRepositoryApi";

const repository = new CampaignRepositoryApi();
const getMetricsUseCase = new GetCampaignMetricsUseCase(repository);

export function useCampaignMetrics(campaignId: string) {
  const [metrics, setMetrics] = useState<CampaignMetricsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMetrics = useCallback(async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getMetricsUseCase.execute({ campaignId });
      setMetrics(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao carregar métricas"),
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
  };
}
