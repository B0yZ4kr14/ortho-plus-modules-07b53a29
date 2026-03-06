import { apiClient } from "@/lib/api/apiClient";
import { Atividade } from "../../domain/entities/Atividade";
import { IAtividadeRepository } from "../../domain/repositories/IAtividadeRepository";
import { AtividadeMapper } from "../mappers/AtividadeMapper";

export class AtividadeRepositoryApi implements IAtividadeRepository {
  async save(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);

    try {
      const response = await apiClient.post<any>(
        "/rest/v1/crm_activities",
        data,
        { headers: { Prefer: "return=representation" } },
      );

      const savedData = Array.isArray(response) ? response[0] : response;
      if (!savedData)
        throw new Error("Nenhum dado retornado ao salvar atividade");

      return AtividadeMapper.toDomain(savedData);
    } catch (error: any) {
      throw new Error(`Erro ao salvar atividade: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Atividade | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_activities?id=eq.${id}&select=*`,
      );

      if (!data || data.length === 0) return null;
      return AtividadeMapper.toDomain(data[0]);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar atividade: ${error.message}`);
    }
  }

  async findByLeadId(leadId: string): Promise<Atividade[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_activities?lead_id=eq.${leadId}&order=created_at.desc`,
      );

      return data?.map(AtividadeMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar atividades do lead: ${error.message}`);
    }
  }

  async findByResponsavel(responsavelId: string): Promise<Atividade[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_activities?assigned_to=eq.${responsavelId}&order=scheduled_date.asc`,
      );

      return data?.map(AtividadeMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(
        `Erro ao buscar atividades do responsável: ${error.message}`,
      );
    }
  }

  async findAgendadasPorData(
    clinicId: string,
    data: Date,
  ): Promise<Atividade[]> {
    const startOfDay = new Date(data);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const activities = await apiClient.get<any[]>(
        `/rest/v1/crm_activities?clinic_id=eq.${clinicId}&status=eq.AGENDADA&scheduled_date=gte.${startOfDay.toISOString()}&scheduled_date=lte.${endOfDay.toISOString()}&order=scheduled_date.asc`,
      );

      return activities?.map(AtividadeMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar atividades agendadas: ${error.message}`);
    }
  }

  async update(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);

    try {
      const response = await apiClient.patch<any>(
        `/rest/v1/crm_activities?id=eq.${atividade.id}`,
        data,
        { headers: { Prefer: "return=representation" } },
      );

      const updatedData = Array.isArray(response) ? response[0] : response;
      if (!updatedData)
        throw new Error("Nenhum dado retornado ao atualizar atividade");

      return AtividadeMapper.toDomain(updatedData);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar atividade: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/crm_activities?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar atividade: ${error.message}`);
    }
  }
}
