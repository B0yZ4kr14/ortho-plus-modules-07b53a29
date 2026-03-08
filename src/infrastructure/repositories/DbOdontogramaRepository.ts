import { Odontograma } from "@/domain/entities/Odontograma";
import { IOdontogramaRepository } from "@/domain/repositories/IOdontogramaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { OdontogramaMapper } from "./mappers/OdontogramaMapper";
import type { Tables } from '@/types/database';

/**
 * Implementação do repositório de Odontograma usando Express API
 */
export class DbOdontogramaRepository implements IOdontogramaRepository {
  async findById(id: string): Promise<Odontograma | null> {
    try {
      const data = await apiClient.get<Tables<"patient_odontograms">>(`/pep/odontogramas/${id}`);
      if (!data) return null;
      return OdontogramaMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Odontograma | null> {
    try {
      const data = await apiClient.get<Tables<"patient_odontograms">[]>(
        "/pep/odontogramas",
        { params: { prontuario_id: prontuarioId } },
      );
      if (!data || data.length === 0) return null;
      return OdontogramaMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<Odontograma[]> {
    try {
      const data = await apiClient.get<Tables<"patient_odontograms">[]>("/pep/odontogramas");
      return (data || []).map((row) => OdontogramaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(odontograma: Odontograma): Promise<void> {
    const insert = OdontogramaMapper.toDbInsert(
      odontograma,
      "", // clinic_id will be resolved by the backend
    );

    try {
      await apiClient.post("/pep/odontogramas", {
        ...insert,
        prontuario_id: odontograma.prontuarioId,
      });
    } catch (error: any) {
      throw new Error(`Erro ao salvar odontograma: ${error.message}`);
    }
  }

  async update(odontograma: Odontograma): Promise<void> {
    const insert = OdontogramaMapper.toDbInsert(
      odontograma,
      "", // clinic_id will be resolved by the backend
    );

    try {
      await apiClient.patch(
        `/pep/odontogramas/${odontograma.id}`,
        insert,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar odontograma: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pep/odontogramas/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar odontograma: ${error.message}`);
    }
  }
}
