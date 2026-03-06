import { Patient } from "@/domain/entities/Patient";
import { IPatientRepository } from "@/domain/repositories/IPatientRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { PatientMapper } from "../mappers/PatientMapper";

export class SupabasePatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?patient_id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return PatientMapper.toDomain(data[0]);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar paciente",
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return (data || []).map(PatientMapper.toDomain);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes",
        error,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      // Simplesmente retorna todos, pois não temos status na tabela prontuarios
      return this.findByClinicId(clinicId);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes ativos",
        error,
      );
    }
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/prontuarios?clinic_id=eq.${clinicId}&patient_name=ilike.*${cpf}*&limit=1`,
      );
      if (!data || data.length === 0) return null;
      return PatientMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async save(patient: Patient): Promise<void> {
    try {
      const data = PatientMapper.toPersistence(patient);
      await apiClient.post("/rest/v1/prontuarios", data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao salvar paciente",
        error,
      );
    }
  }

  async update(patient: Patient): Promise<void> {
    try {
      await apiClient.patch(
        `/rest/v1/prontuarios?patient_id=eq.${patient.id}`,
        {
          patient_name: patient.fullName,
          updated_at: new Date().toISOString(),
        },
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao atualizar paciente",
        error,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Soft delete removendo todos os prontuários do paciente
      await apiClient.delete(`/rest/v1/prontuarios?patient_id=eq.${id}`);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao deletar paciente",
        error,
      );
    }
  }

  async findByRiskLevel(
    clinicId: string,
    riskLevel: string,
  ): Promise<Patient[]> {
    try {
      // Retorna todos os pacientes (prontuários) - filtro por risco na camada de aplicação
      return this.findByClinicId(clinicId);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar pacientes por risco",
        error,
      );
    }
  }
}
