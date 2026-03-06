import { apiClient } from "@/lib/api/apiClient";
import {
  CampaignSend,
  CampaignSendProps,
  CampaignSendStatus,
} from "../../domain/entities/CampaignSend";
import {
  CampaignSendFilters,
  ICampaignSendRepository,
} from "../../domain/repositories/ICampaignSendRepository";

export class CampaignSendRepositoryApi implements ICampaignSendRepository {
  async findById(id: string): Promise<CampaignSend | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/campaign_sends?id=eq.${id}&select=*`,
      );
      if (!data || data.length === 0) return null;
      return this.toDomain(data[0]);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar envio de campanha: ${error.message}`);
    }
  }

  async findByCampaign(
    campaignId: string,
    filters?: CampaignSendFilters,
  ): Promise<CampaignSend[]> {
    try {
      let url = `/rest/v1/campaign_sends?campaign_id=eq.${campaignId}`;

      if (filters?.patientId) {
        url += `&patient_id=eq.${filters.patientId}`;
      }

      if (filters?.status) {
        url += `&status=eq.${filters.status}`;
      }

      if (filters?.hasError !== undefined) {
        if (filters.hasError) {
          url += `&status=eq.ERRO`;
        } else {
          url += `&status=neq.ERRO`;
        }
      }

      url += "&order=scheduled_for.asc";

      const data = await apiClient.get<any[]>(url);
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar envios da campanha: ${error.message}`);
    }
  }

  async findByPatient(patientId: string): Promise<CampaignSend[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/campaign_sends?patient_id=eq.${patientId}&order=created_at.desc`,
      );
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(
        `Erro ao buscar envios para o paciente: ${error.message}`,
      );
    }
  }

  async save(send: CampaignSend): Promise<void> {
    const data = this.toDatabase(send);
    try {
      await apiClient.post("/rest/v1/campaign_sends", data);
    } catch (error: any) {
      throw new Error(`Erro ao salvar envio: ${error.message}`);
    }
  }

  async update(send: CampaignSend): Promise<void> {
    const data = this.toDatabase(send);
    try {
      await apiClient.patch(`/rest/v1/campaign_sends?id=eq.${send.id}`, data);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar envio: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/campaign_sends?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar envio: ${error.message}`);
    }
  }

  async getScheduledSends(campaignId: string): Promise<CampaignSend[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/campaign_sends?campaign_id=eq.${campaignId}&status=eq.AGENDADO&scheduled_for=lte.${new Date().toISOString()}&order=scheduled_for.asc`,
      );
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar envios agendados: ${error.message}`);
    }
  }

  async getErrorSends(campaignId: string): Promise<CampaignSend[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/campaign_sends?campaign_id=eq.${campaignId}&status=eq.ERRO&order=created_at.desc`,
      );
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar envios com erro: ${error.message}`);
    }
  }

  private toDomain(row: any): CampaignSend {
    const statusMap: Record<string, CampaignSendStatus> = {
      PENDENTE: "AGENDADO",
      AGENDADO: "AGENDADO",
      ENVIADO: "ENVIADO",
      ENTREGUE: "ENTREGUE",
      ABERTO: "ABERTO",
      CLICADO: "CLICADO",
      CONVERTIDO: "CONVERTIDO",
      ERRO: "ERRO",
    };

    const props: CampaignSendProps = {
      id: row.id,
      campaignId: row.campaign_id,
      patientId: row.patient_id,
      recipientName: row.recipient_name,
      recipientContact: row.recipient_contact,
      messageContent: row.message_content,
      status: statusMap[row.status] || "AGENDADO",
      scheduledFor: new Date(row.scheduled_for),
      sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
      deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
      openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
      clickedAt: row.clicked_at ? new Date(row.clicked_at) : undefined,
      convertedAt: row.converted_at ? new Date(row.converted_at) : undefined,
      errorMessage: row.error_message,
      errorCode: row.error_code,
      retryCount: row.retry_count || 0,
      metadata: row.metadata
        ? typeof row.metadata === "string"
          ? JSON.parse(row.metadata)
          : row.metadata
        : undefined,
      createdAt: new Date(row.created_at),
    };

    return new CampaignSend(props);
  }

  private toDatabase(send: CampaignSend): any {
    const statusMap: Record<CampaignSendStatus, string> = {
      AGENDADO: "PENDENTE",
      ENVIADO: "ENVIADO",
      ENTREGUE: "ENTREGUE",
      ABERTO: "ABERTO",
      CLICADO: "CLICADO",
      CONVERTIDO: "CONVERTIDO",
      ERRO: "ERRO",
    };

    return {
      id: send.id,
      campaign_id: send.campaignId,
      patient_id: send.patientId,
      recipient_name: send.recipientName,
      recipient_contact: send.recipientContact,
      message_content: send.messageContent,
      status: statusMap[send.status],
      scheduled_for: send.scheduledFor.toISOString(),
      sent_at: send.sentAt?.toISOString(),
      delivered_at: send.deliveredAt?.toISOString(),
      opened_at: send.openedAt?.toISOString(),
      clicked_at: send.clickedAt?.toISOString(),
      converted_at: send.convertedAt?.toISOString(),
      error_message: send.errorMessage,
      error_code: send.errorCode,
      retry_count: send.retryCount,
      metadata: send.metadata ? JSON.stringify(send.metadata) : null,
      created_at: send.createdAt.toISOString(),
    };
  }
}
