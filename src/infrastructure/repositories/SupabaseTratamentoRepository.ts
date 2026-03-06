import { Tratamento } from "@/domain/entities/Tratamento";
import { ITratamentoRepository } from "@/domain/repositories/ITratamentoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { TratamentoMapper } from "../mappers/TratamentoMapper";

export class SupabaseTratamentoRepository implements ITratamentoRepository {
  async findById(id: string): Promise<Tratamento | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_tratamentos?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return TratamentoMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar tratamento", error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Tratamento[]> {
    try {
      // JOIN para evitar N+1 queries
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_tratamentos?select=*,prontuarios!inner(id,clinic_id,patient_id)&prontuario_id=eq.${prontuarioId}&order=data_inicio.desc`,
      );
      return (data || []).map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar tratamentos do prontuário",
        error,
      );
    }
  }

  async findByStatus(
    prontuarioId: string,
    status: "PLANEJADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO",
  ): Promise<Tratamento[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_tratamentos?prontuario_id=eq.${prontuarioId}&status=eq.${status}&order=data_inicio.desc`,
      );
      return (data || []).map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar tratamentos por status",
        error,
      );
    }
  }

  async findAtivos(prontuarioId: string): Promise<Tratamento[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_tratamentos?prontuario_id=eq.${prontuarioId}&status=in.(PLANEJADO,EM_ANDAMENTO)&order=data_inicio.desc`,
      );
      return (data || []).map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar tratamentos ativos", error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Tratamento[]> {
    try {
      // Precisamos fazer join com prontuarios para filtrar por clinic_id
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_tratamentos?select=*,prontuarios!inner(clinic_id)&prontuarios.clinic_id=eq.${clinicId}&order=data_inicio.desc`,
      );
      return (data || []).map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar tratamentos da clínica",
        error,
      );
    }
  }

  async save(tratamento: Tratamento): Promise<void> {
    try {
      const data = TratamentoMapper.toInsert(tratamento);
      await apiClient.post("/rest/v1/pep_tratamentos", data);
    } catch (error) {
      throw new InfrastructureError("Erro ao salvar tratamento", error);
    }
  }

  async update(tratamento: Tratamento): Promise<void> {
    try {
      const data = TratamentoMapper.toPersistence(tratamento);
      await apiClient.patch(
        `/rest/v1/pep_tratamentos?id=eq.${tratamento.id}`,
        data,
      );
    } catch (error) {
      throw new InfrastructureError("Erro ao atualizar tratamento", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/pep_tratamentos?id=eq.${id}`);
    } catch (error) {
      throw new InfrastructureError("Erro ao deletar tratamento", error);
    }
  }
}
