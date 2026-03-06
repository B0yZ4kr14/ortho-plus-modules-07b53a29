import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { CreateCampaignUseCase } from "../../application/use-cases/CreateCampaignUseCase";
import { ListCampaignsUseCase } from "../../application/use-cases/ListCampaignsUseCase";
import { UpdateCampaignStatusUseCase } from "../../application/use-cases/UpdateCampaignStatusUseCase";
import {
  Campaign,
  CampaignType,
  TargetSegment,
} from "../../domain/entities/Campaign";
import { CampaignFilters } from "../../domain/repositories/ICampaignRepository";
import { CampaignRepositoryApi } from "../../infrastructure/repositories/CampaignRepositoryApi";

const repository = new CampaignRepositoryApi();
const createUseCase = new CreateCampaignUseCase(repository);
const updateStatusUseCase = new UpdateCampaignStatusUseCase(repository);
const listUseCase = new ListCampaignsUseCase(repository);

export function useCampaigns(filters?: CampaignFilters) {
  const { clinicId, user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCampaigns = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await listUseCase.execute({ clinicId, filters });
      setCampaigns(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao carregar campanhas"),
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId, filters]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const createCampaign = useCallback(
    async (data: {
      name: string;
      description?: string;
      type: CampaignType;
      messageTemplate: string;
      targetSegment?: TargetSegment;
      scheduledDate?: Date;
    }) => {
      if (!clinicId || !user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const campaign = await createUseCase.execute({
        ...data,
        clinicId,
        createdBy: user.id,
      });

      await loadCampaigns();
      return campaign;
    },
    [clinicId, user, loadCampaigns],
  );

  const activateCampaign = useCallback(
    async (campaignId: string) => {
      await updateStatusUseCase.execute({
        campaignId,
        action: "activate",
      });

      await loadCampaigns();
    },
    [loadCampaigns],
  );

  const pauseCampaign = useCallback(
    async (campaignId: string) => {
      await updateStatusUseCase.execute({
        campaignId,
        action: "pause",
      });

      await loadCampaigns();
    },
    [loadCampaigns],
  );

  const completeCampaign = useCallback(
    async (campaignId: string) => {
      await updateStatusUseCase.execute({
        campaignId,
        action: "complete",
      });

      await loadCampaigns();
    },
    [loadCampaigns],
  );

  // Analytics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.isActive()).length;
  const draftCampaigns = campaigns.filter((c) => c.isDraft()).length;
  const completedCampaigns = campaigns.filter((c) => c.isCompleted()).length;

  return {
    campaigns,
    loading,
    error,
    createCampaign,
    activateCampaign,
    pauseCampaign,
    completeCampaign,
    loadCampaigns,
    // Analytics
    totalCampaigns,
    activeCampaigns,
    draftCampaigns,
    completedCampaigns,
  };
}
