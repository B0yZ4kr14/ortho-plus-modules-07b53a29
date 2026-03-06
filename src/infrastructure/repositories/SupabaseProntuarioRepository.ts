import { Prontuario } from "@/domain/entities/Prontuario";
import { IProntuarioRepository } from "@/domain/repositories/IProntuarioRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { ProntuarioMapper } from "../mappers/ProntuarioMapper";

export class SupabaseProntuarioRepository implements IProntuarioRepository {
  async findById(id: string): Promise<Prontuario | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return ProntuarioMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar prontuário", error);
    }
  }

  async findByPatientId(
    patientId: string,
    clinicId: string,
  ): Promise<Prontuario | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?patient_id=eq.${patientId}&clinic_id=eq.${clinicId}`,
      );
      if (!data || data.length === 0) return null;
      return ProntuarioMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar prontuário do paciente",
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Prontuario[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return (data || []).map(ProntuarioMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar prontuários da clínica",
        error,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Prontuario[]> {
    // Como não temos campo de status, retornamos todos
    return this.findByClinicId(clinicId);
  }

  async findByNumero(
    numero: string,
    clinicId: string,
  ): Promise<Prontuario | null> {
    // Como não temos campo numero, usamos o ID como fallback
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?clinic_id=eq.${clinicId}&id=ilike.*${numero}*`,
      );
      if (!data || data.length === 0) return null;
      return ProntuarioMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar prontuário por número",
        error,
      );
    }
  }

  async save(prontuario: Prontuario): Promise<void> {
    try {
      const data = ProntuarioMapper.toInsert(prontuario);
      await apiClient.post("/rest/v1/prontuarios", data);
    } catch (error) {
      throw new InfrastructureError("Erro ao salvar prontuário", error);
    }
  }

  async update(prontuario: Prontuario): Promise<void> {
    try {
      const data = ProntuarioMapper.toPersistence(prontuario);
      await apiClient.patch(
        `/rest/v1/prontuarios?id=eq.${prontuario.id}`,
        data,
      );
    } catch (error) {
      throw new InfrastructureError("Erro ao atualizar prontuário", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/prontuarios?id=eq.${id}`);
    } catch (error) {
      throw new InfrastructureError("Erro ao deletar prontuário", error);
    }
  }
}
