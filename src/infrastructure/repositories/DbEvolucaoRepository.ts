import { Evolucao } from "@/domain/entities/Evolucao";
import { IEvolucaoRepository } from "@/domain/repositories/IEvolucaoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { EvolucaoMapper } from "../mappers/EvolucaoMapper";
import type { Tables } from '@/types/database';

export class DbEvolucaoRepository implements IEvolucaoRepository {
  async findById(id: string): Promise<Evolucao | null> {
    try {
      const data = await apiClient.get<Tables<"pep_evolucoes">>(`/pep/evolucoes/${id}`);
      if (!data) return null;
      return EvolucaoMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError("Erro ao buscar evolução", error);
    }
  }

  async findByTratamentoId(tratamentoId: string): Promise<Evolucao[]> {
    try {
      const data = await apiClient.get<Tables<"pep_evolucoes">[]>(
        "/pep/evolucoes",
        { params: { tratamento_id: tratamentoId } },
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
      const data = await apiClient.get<Tables<"pep_evolucoes">[]>(
        "/pep/evolucoes",
        { params: { prontuario_id: prontuarioId } },
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
      const data = await apiClient.get<Tables<"pep_evolucoes">[]>("/pep/evolucoes");
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
      const data = await apiClient.get<Tables<"pep_evolucoes">[]>(
        "/pep/evolucoes",
        {
          params: {
            prontuario_id: prontuarioId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        },
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
    return [];
  }

  async save(evolucao: Evolucao): Promise<void> {
    try {
      const data = EvolucaoMapper.toInsert(evolucao);
      await apiClient.post("/pep/evolucoes", data);
    } catch (error) {
      throw new InfrastructureError("Erro ao salvar evolução", error);
    }
  }

  async update(evolucao: Evolucao): Promise<void> {
    try {
      const data = EvolucaoMapper.toPersistence(evolucao);
      await apiClient.patch(`/pep/evolucoes/${evolucao.id}`, data);
    } catch (error) {
      throw new InfrastructureError("Erro ao atualizar evolução", error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/pep/evolucoes/${id}`);
    } catch (error) {
      throw new InfrastructureError("Erro ao deletar evolução", error);
    }
  }
}
