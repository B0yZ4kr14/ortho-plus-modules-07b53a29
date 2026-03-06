import { apiClient } from "@/lib/api/apiClient";
import { Lead } from "../../domain/entities/Lead";
import { ILeadRepository } from "../../domain/repositories/ILeadRepository";
import { LeadMapper } from "../mappers/LeadMapper";

export class LeadRepositoryApi implements ILeadRepository {
  async save(lead: Lead): Promise<Lead> {
    const persistence = LeadMapper.toPersistence(lead);

    // We omit 'created_by' as it should be handled by the backend / auth context natively if properly structured,
    // or we can pass it if required, but ideally the API does this based on the JWT.
    const response = await apiClient.post<any>(
      "/rest/v1/crm_leads",
      persistence,
      { headers: { Prefer: "return=representation" } },
    );

    const savedData = Array.isArray(response) ? response[0] : response;
    if (!savedData) throw new Error("Nenhum dado retornado ao salvar lead");

    return LeadMapper.toDomain(savedData);
  }

  async findById(id: string): Promise<Lead | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_leads?id=eq.${id}&select=*`,
      );

      if (!data || data.length === 0) return null;
      return LeadMapper.toDomain(data[0]);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar lead: ${error.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_leads?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );

      return data?.map(LeadMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar leads: ${error.message}`);
    }
  }

  async findByResponsavel(responsavelId: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_leads?assigned_to=eq.${responsavelId}&order=created_at.desc`,
      );

      return data?.map(LeadMapper.toDomain) ?? [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar leads do responsável: ${error.message}`);
    }
  }

  async findByStatus(clinicId: string, status: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/crm_leads?clinic_id=eq.${clinicId}&status=eq.${status}&order=created_at.desc`,
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
        `/rest/v1/crm_leads?id=eq.${lead.id}`,
        data,
        { headers: { Prefer: "return=representation" } },
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
      await apiClient.delete(`/rest/v1/crm_leads?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar lead: ${error.message}`);
    }
  }
}
