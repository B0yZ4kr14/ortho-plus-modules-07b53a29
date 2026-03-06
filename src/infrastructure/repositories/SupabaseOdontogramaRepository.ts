import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { OdontogramaMapper } from "./mappers/OdontogramaMapper";

/**
 * Implementação do repositório de Odontograma usando apiClient
 */
export class SupabaseOdontogramaRepository implements IOdontogramaRepository {
  async findById(id: string): Promise<Odontograma | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/odontogramas?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return OdontogramaMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Odontograma | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/odontogramas?prontuario_id=eq.${prontuarioId}`,
      );
      if (!data || data.length === 0) return null;
      return OdontogramaMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<Odontograma[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/odontogramas?clinic_id=eq.${clinicId}&order=updated_at.desc`,
      );
      return (data || []).map((row) => OdontogramaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(odontograma: Odontograma): Promise<void> {
    // Buscar clinic_id do prontuário
    const prontuarioData = await apiClient.get<any[]>(
      `/rest/v1/prontuarios?id=eq.${odontograma.prontuarioId}&select=clinic_id`,
    );

    if (!prontuarioData || prontuarioData.length === 0) {
      throw new Error("Prontuário não encontrado");
    }

    const insert = OdontogramaMapper.toSupabaseInsert(
      odontograma,
      prontuarioData[0].clinic_id,
    );

    try {
      await apiClient.post("/rest/v1/odontogramas", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar odontograma: ${error.message}`);
    }
  }

  async update(odontograma: Odontograma): Promise<void> {
    // Buscar clinic_id do prontuário
    const prontuarioData = await apiClient.get<any[]>(
      `/rest/v1/prontuarios?id=eq.${odontograma.prontuarioId}&select=clinic_id`,
    );

    if (!prontuarioData || prontuarioData.length === 0) {
      throw new Error("Prontuário não encontrado");
    }

    const insert = OdontogramaMapper.toSupabaseInsert(
      odontograma,
      prontuarioData[0].clinic_id,
    );

    try {
      await apiClient.patch(
        `/rest/v1/odontogramas?id=eq.${odontograma.id}`,
        insert,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar odontograma: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/odontogramas?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar odontograma: ${error.message}`);
    }
  }
}
