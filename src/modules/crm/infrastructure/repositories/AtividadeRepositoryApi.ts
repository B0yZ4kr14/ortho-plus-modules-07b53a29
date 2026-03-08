import { apiClient } from "@/lib/api/apiClient";
import { Atividade } from "../../domain/entities/Atividade";
import { IAtividadeRepository } from "../../domain/repositories/IAtividadeRepository";
import { AtividadeMapper } from "../mappers/AtividadeMapper";

export class AtividadeRepositoryApi implements IAtividadeRepository {
  async save(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);

    try {
      const response = await apiClient.post<any>(
        "/crm/atividades",
        data,
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
      const data = await apiClient.get<any>(`/crm/atividades/${id}`);
      if (!data) return null;
      return AtividadeMapper.toDomain(data);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar atividade: ${error.message}`);
    }
  }

  async findByLeadId(leadId: string): Promise<Atividade[]> {
    try {
      const data = await apiClient.get<any[]>(
        "/crm/atividades",
        { params: { lead_id: leadId } },
      );
      return data?.map(AtividadeMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar atividades do lead: ${error.message}`);
    }
  }

  async findByResponsavel(responsavelId: string): Promise<Atividade[]> {
    try {
      const data = await apiClient.get<any[]>(
        "/crm/atividades",
        { params: { assigned_to: responsavelId } },
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
        "/crm/atividades",
        {
          params: {
            status: "AGENDADA",
            start_date: startOfDay.toISOString(),
            end_date: endOfDay.toISOString(),
          },
        },
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
        `/crm/atividades/${atividade.id}`,
        data,
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
      await apiClient.delete(`/crm/atividades/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar atividade: ${error.message}`);
    }
  }
}
