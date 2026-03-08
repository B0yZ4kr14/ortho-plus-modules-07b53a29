import { apiClient } from "@/lib/api/apiClient";
import { Lead } from "../../domain/entities/Lead";
import { ILeadRepository } from "../../domain/repositories/ILeadRepository";
import { LeadMapper } from "../mappers/LeadMapper";

export class LeadRepositoryApi implements ILeadRepository {
  async save(lead: Lead): Promise<Lead> {
    const persistence = LeadMapper.toPersistence(lead);

    const response = await apiClient.post<any>(
      "/crm/leads",
      persistence,
    );

    const savedData = Array.isArray(response) ? response[0] : response;
    if (!savedData) throw new Error("Nenhum dado retornado ao salvar lead");

    return LeadMapper.toDomain(savedData);
  }

  async findById(id: string): Promise<Lead | null> {
    try {
      const data = await apiClient.get<any>(`/crm/leads/${id}`);
      if (!data) return null;
      return LeadMapper.toDomain(data);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar lead: ${error.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<any[]>("/crm/leads");
      return data?.map(LeadMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar leads: ${error.message}`);
    }
  }

  async findByResponsavel(responsavelId: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<any[]>(
        "/crm/leads",
        { params: { assigned_to: responsavelId } },
      );
      return data?.map(LeadMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar leads do responsável: ${error.message}`);
    }
  }

  async findByStatus(clinicId: string, status: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<any[]>(
        "/crm/leads",
        { params: { status } },
      );
      return data?.map(LeadMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar leads por status: ${error.message}`);
    }
  }

  async update(lead: Lead): Promise<Lead> {
    const data = LeadMapper.toPersistence(lead);

    try {
      const response = await apiClient.patch<any>(
        `/crm/leads/${lead.id}`,
        data,
      );

      const updatedData = Array.isArray(response) ? response[0] : response;
      if (!updatedData)
        throw new Error("Nenhum dado retornado ao atualizar lead");

      return LeadMapper.toDomain(updatedData);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar lead: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/leads/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar lead: ${error.message}`);
    }
  }
}
