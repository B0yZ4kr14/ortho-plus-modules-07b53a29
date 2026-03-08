import { MovimentoCaixa } from "@/domain/entities/MovimentoCaixa";
import { IMovimentoCaixaRepository } from "@/domain/repositories/IMovimentoCaixaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { MovimentoCaixaMapper } from "./mappers/MovimentoCaixaMapper";
import type { Tables } from '@/types/database';

export class DbMovimentoCaixaRepository implements IMovimentoCaixaRepository {
  async findById(id: string): Promise<MovimentoCaixa | null> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">>(`/financeiro/movimentos/${id}`);
      if (!data) return null;
      return MovimentoCaixaMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>("/financeiro/movimentos", {
        params: { clinic_id: clinicId },
      });
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findAbertos(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>("/financeiro/movimentos", {
        params: { clinic_id: clinicId, status: "ABERTO" },
      });
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findUltimoAberto(clinicId: string): Promise<MovimentoCaixa | null> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>("/financeiro/movimentos", {
        params: { clinic_id: clinicId, status: "ABERTO" },
      });
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
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>("/financeiro/movimentos", {
        params: {
          clinic_id: clinicId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findSangrias(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>("/financeiro/movimentos", {
        params: { clinic_id: clinicId, tipo: "SANGRIA" },
      });
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toDbInsert(movimento);
    try {
      await apiClient.post("/financeiro/movimentos", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar movimento de caixa: ${error.message}`);
    }
  }

  async update(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toDbInsert(movimento);
    try {
      await apiClient.patch(`/financeiro/movimentos/${movimento.id}`, insert);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar movimento de caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/financeiro/movimentos/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar movimento de caixa: ${error.message}`);
    }
  }
}
