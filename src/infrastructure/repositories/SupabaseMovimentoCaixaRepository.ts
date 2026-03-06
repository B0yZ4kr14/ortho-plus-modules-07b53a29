import { MovimentoCaixa } from "@/domain/entities/MovimentoCaixa";
import { IMovimentoCaixaRepository } from "@/domain/repositories/IMovimentoCaixaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { MovimentoCaixaMapper } from "./mappers/MovimentoCaixaMapper";

export class SupabaseMovimentoCaixaRepository implements IMovimentoCaixaRepository {
  async findById(id: string): Promise<MovimentoCaixa | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_movimentos?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return MovimentoCaixaMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_movimentos?clinic_id=eq.${clinicId}&order=created_at.desc`,
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findAbertos(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_movimentos?clinic_id=eq.${clinicId}&status=eq.ABERTO&order=created_at.desc`,
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findUltimoAberto(clinicId: string): Promise<MovimentoCaixa | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_movimentos?clinic_id=eq.${clinicId}&status=eq.ABERTO&order=created_at.desc&limit=1`,
      );
      if (!data || data.length === 0) return null;
      return MovimentoCaixaMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByPeriodo(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_movimentos?clinic_id=eq.${clinicId}&created_at=gte.${startDate.toISOString()}&created_at=lte.${endDate.toISOString()}&order=created_at.desc`,
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findSangrias(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/caixa_movimentos?clinic_id=eq.${clinicId}&tipo=eq.SANGRIA&order=created_at.desc`,
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toSupabaseInsert(movimento);
    try {
      await apiClient.post("/rest/v1/caixa_movimentos", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar movimento de caixa: ${error.message}`);
    }
  }

  async update(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toSupabaseInsert(movimento);
    try {
      await apiClient.patch(
        `/rest/v1/caixa_movimentos?id=eq.${movimento.id}`,
        insert,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar movimento de caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/caixa_movimentos?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar movimento de caixa: ${error.message}`);
    }
  }
}
