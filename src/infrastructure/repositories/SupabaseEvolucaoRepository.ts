import { Evolucao } from "@/domain/entities/Evolucao";
import { IEvolucaoRepository } from "@/domain/repositories/IEvolucaoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { EvolucaoMapper } from "../mappers/EvolucaoMapper";

export class SupabaseEvolucaoRepository implements IEvolucaoRepository {
  async findById(id: string): Promise<Evolucao | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_evolucoes?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return EvolucaoMapper.toDomain(data[0]);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar evolução", error);
    }
  }

  async findByTratamentoId(tratamentoId: string): Promise<Evolucao[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_evolucoes?tratamento_id=eq.${tratamentoId}&order=data_evolucao.desc`,
      );
      return (data || []).map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar evoluções do tratamento",
        error,
      );
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Evolucao[]> {
    try {
      // Fazer join com pep_tratamentos para filtrar por prontuario_id
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_evolucoes?select=*,pep_tratamentos!inner(prontuario_id)&pep_tratamentos.prontuario_id=eq.${prontuarioId}&order=data_evolucao.desc`,
      );
      return (data || []).map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar evoluções do prontuário",
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<Evolucao[]> {
    try {
      // Fazer join duplo: evolucoes -> tratamentos -> prontuarios
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_evolucoes?select=*,pep_tratamentos!inner(prontuario_id,prontuarios!inner(clinic_id))&pep_tratamentos.prontuarios.clinic_id=eq.${clinicId}&order=data_evolucao.desc`,
      );
      return (data || []).map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar evoluções da clínica",
        error,
      );
    }
  }

  async findByDateRange(
    prontuarioId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Evolucao[]> {
    try {
      const gte = startDate.toISOString().split("T")[0];
      const lte = endDate.toISOString().split("T")[0];
      const data = await apiClient.get<any[]>(
        `/rest/v1/pep_evolucoes?select=*,pep_tratamentos!inner(prontuario_id)&pep_tratamentos.prontuario_id=eq.${prontuarioId}&data_evolucao=gte.${gte}&data_evolucao=lte.${lte}&order=data_evolucao.desc`,
      );
      return (data || []).map(EvolucaoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar evoluções por período",
        error,
      );
    }
  }

  async findPendingSignature(prontuarioId: string): Promise<Evolucao[]> {
    // Como a tabela atual considera criação = assinatura, retornamos array vazio
    // Em uma implementação real, filtraremos por assinado_em IS NULL
    return [];
  }

  async save(evolucao: Evolucao): Promise<void> {
    try {
      const data = EvolucaoMapper.toInsert(evolucao);
      await apiClient.post("/rest/v1/pep_evolucoes", data);
    } catch (error) {
      throw new InfrastructureError("Erro ao salvar evolução", error);
    }
  }

  async update(evolucao: Evolucao): Promise<void> {
    try {
      const data = EvolucaoMapper.toPersistence(evolucao);
      await apiClient.patch(
        `/rest/v1/pep_evolucoes?id=eq.${evolucao.id}`,
        data,
      );
    } catch (error) {
      throw new InfrastructureError("Erro ao atualizar evolução", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/pep_evolucoes?id=eq.${id}`);
    } catch (error) {
      throw new InfrastructureError("Erro ao deletar evolução", error);
    }
  }
}
