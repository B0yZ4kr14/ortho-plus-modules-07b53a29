import { ContaReceber } from "@/domain/entities/ContaReceber";
import { IContaReceberRepository } from "@/domain/repositories/IContaReceberRepository";
import { apiClient } from "@/lib/api/apiClient";
import { ContaReceberMapper } from "./mappers/ContaReceberMapper";
import type { Tables } from '@/types/database';

export class DbContaReceberRepository implements IContaReceberRepository {
  async findById(id: string): Promise<ContaReceber | null> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">>(
        `/financeiro/contas-receber/${id}`,
      );
      if (!data) return null;
      return ContaReceberMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<ContaReceber[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-receber",
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<ContaReceber[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-receber",
        { params: { patient_id: patientId } },
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findPendentes(clinicId: string): Promise<ContaReceber[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-receber",
        { params: { status: "PENDENTE" } },
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findVencidas(clinicId: string): Promise<ContaReceber[]> {
    const hoje = new Date().toISOString().split("T")[0];
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-receber",
        { params: { status: "PENDENTE", vencidas_antes: hoje } },
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByPeriodo(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ContaReceber[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-receber",
        {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        },
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(conta: ContaReceber): Promise<void> {
    const insert = ContaReceberMapper.toDbInsert(conta);
    try {
      await apiClient.post("/financeiro/contas-receber", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar conta a receber: ${error.message}`);
    }
  }

  async update(conta: ContaReceber): Promise<void> {
    const insert = ContaReceberMapper.toDbInsert(conta);
    try {
      await apiClient.patch(
        `/financeiro/contas-receber/${conta.id}`,
        insert,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/financeiro/contas-receber/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar conta a receber: ${error.message}`);
    }
  }
}
