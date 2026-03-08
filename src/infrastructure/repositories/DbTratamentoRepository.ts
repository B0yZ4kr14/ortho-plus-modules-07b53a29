import { Tratamento } from "@/domain/entities/Tratamento";
import { ITratamentoRepository } from "@/domain/repositories/ITratamentoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { TratamentoMapper } from "../mappers/TratamentoMapper";

export class DbTratamentoRepository implements ITratamentoRepository {
  async findById(id: string): Promise<Tratamento | null> {
    try {
      const data = await apiClient.get<Tables<"patient_treatments">>(`/pep/tratamentos/${id}`);
      if (!data) return null;
      return TratamentoMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar tratamento", error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Tratamento[]> {
    try {
      const data = await apiClient.get<Tables<"patient_treatments">[]>(
        `/pep/tratamentos`,
        { params: { prontuario_id: prontuarioId } },
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
      const data = await apiClient.get<Tables<"patient_treatments">[]>(
        `/pep/tratamentos`,
        { params: { prontuario_id: prontuarioId, status } },
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
      const data = await apiClient.get<Tables<"patient_treatments">[]>(
        `/pep/tratamentos`,
        { params: { prontuario_id: prontuarioId, ativos: true } },
      );
      return (data || []).map(TratamentoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar tratamentos ativos", error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Tratamento[]> {
    try {
      const data = await apiClient.get<Tables<"patient_treatments">[]>("/pep/tratamentos");
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
      await apiClient.post("/pep/tratamentos", data);
    } catch (error) {
      throw new InfrastructureError("Erro ao salvar tratamento", error);
    }
  }

  async update(tratamento: Tratamento): Promise<void> {
    try {
      const data = TratamentoMapper.toPersistence(tratamento);
      await apiClient.patch(`/pep/tratamentos/${tratamento.id}`, data);
    } catch (error) {
      throw new InfrastructureError("Erro ao atualizar tratamento", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pep/tratamentos/${id}`);
    } catch (error) {
      throw new InfrastructureError("Erro ao deletar tratamento", error);
    }
  }
}
