import { apiClient } from "@/lib/api/apiClient";
import {
  Campaign,
  CampaignMetrics,
  CampaignProps,
  CampaignStatus,
  CampaignType,
  TargetSegment,
} from "../../domain/entities/Campaign";
import {
  CampaignFilters,
  ICampaignRepository,
} from "../../domain/repositories/ICampaignRepository";
import { MessageTemplate } from "../../domain/valueObjects/MessageTemplate";

export class CampaignRepositoryApi implements ICampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/marketing_campaigns?id=eq.${id}&select=*`,
      );
      if (!data || data.length === 0) return null;
      return this.toDomain(data[0]);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar campanha: ${error.message}`);
    }
  }

  async findByClinic(
    clinicId: string,
    filters?: CampaignFilters,
  ): Promise<Campaign[]> {
    try {
      let url = `/rest/v1/marketing_campaigns?clinic_id=eq.${clinicId}`;

      if (filters?.type) {
        url += `&type=eq.${filters.type}`;
      }

      if (filters?.status) {
        url += `&status=eq.${filters.status}`;
      }

      if (filters?.createdBy) {
        url += `&created_by=eq.${filters.createdBy}`;
      }

      if (filters?.period) {
        url += `&created_at=gte.${filters.period.startDate.toISOString()}&created_at=lte.${filters.period.endDate.toISOString()}`;
      }

      url += "&order=created_at.desc";

      const data = await apiClient.get<any[]>(url);
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar campanhas da clínica: ${error.message}`);
    }
  }

  async save(campaign: Campaign): Promise<void> {
    const data = this.toDatabase(campaign);
    try {
      await apiClient.post("/rest/v1/marketing_campaigns", data);
    } catch (error: any) {
      throw new Error(`Erro ao salvar campanha: ${error.message}`);
    }
  }

  async update(campaign: Campaign): Promise<void> {
    const data = this.toDatabase(campaign);
    try {
      await apiClient.patch(
        `/rest/v1/marketing_campaigns?id=eq.${campaign.id}`,
        data,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar campanha: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/marketing_campaigns?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar campanha: ${error.message}`);
    }
  }

  async getActiveCampaigns(clinicId: string): Promise<Campaign[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/marketing_campaigns?clinic_id=eq.${clinicId}&status=eq.ATIVA&order=created_at.desc`,
      );
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar campanhas ativas: ${error.message}`);
    }
  }

  async getScheduledCampaigns(clinicId: string): Promise<Campaign[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/marketing_campaigns?clinic_id=eq.${clinicId}&status=eq.ATIVA&scheduled_date=not.is.null&scheduled_date=gte.${new Date().toISOString()}&order=scheduled_date.asc`,
      );
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar campanhas agendadas: ${error.message}`);
    }
  }

  private toDomain(row: any): Campaign {
    const messageTemplate = new MessageTemplate(row.message_template || "");

    const metrics: CampaignMetrics | undefined =
      row.total_sent !== null
        ? {
            totalSent: row.total_sent || 0,
            totalDelivered: row.total_delivered || 0,
            totalOpened: row.total_opened || 0,
            totalClicked: row.total_clicked || 0,
            totalConverted: row.total_converted || 0,
            totalErrors: row.total_errors || 0,
          }
        : undefined;

    const targetSegment: TargetSegment | undefined = row.target_segment
      ? typeof row.target_segment === "string"
        ? JSON.parse(row.target_segment)
        : row.target_segment
      : undefined;

    const props: CampaignProps = {
      id: row.id,
      clinicId: row.clinic_id,
      name: row.name,
      description: row.description,
      type: row.type as CampaignType,
      status: row.status as CampaignStatus,
      messageTemplate,
      targetSegment,
      scheduledDate: row.scheduled_date
        ? new Date(row.scheduled_date)
        : undefined,
      startDate: row.start_date ? new Date(row.start_date) : undefined,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      metrics,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Campaign(props);
  }

  private toDatabase(campaign: Campaign): any {
    return {
      id: campaign.id,
      clinic_id: campaign.clinicId,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      message_template: campaign.messageTemplate.getTemplate(),
      target_segment: campaign.targetSegment
        ? JSON.stringify(campaign.targetSegment)
        : null,
      scheduled_date: campaign.scheduledDate?.toISOString(),
      start_date: campaign.startDate?.toISOString(),
      end_date: campaign.endDate?.toISOString(),
      total_sent: campaign.metrics?.totalSent,
      total_delivered: campaign.metrics?.totalDelivered,
      total_opened: campaign.metrics?.totalOpened,
      total_clicked: campaign.metrics?.totalClicked,
      total_converted: campaign.metrics?.totalConverted,
      total_errors: campaign.metrics?.totalErrors,
      created_by: campaign.createdBy,
      created_at: campaign.createdAt.toISOString(),
      updated_at: campaign.updatedAt.toISOString(),
    };
  }
}
