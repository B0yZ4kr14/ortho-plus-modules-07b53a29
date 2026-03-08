import { ContaPagar, CategoriaContaPagar } from "@/domain/entities/ContaPagar";
import { IContaPagarRepository } from "@/domain/repositories/IContaPagarRepository";
import { apiClient } from "@/lib/api/apiClient";
import { ContaPagarMapper } from "./mappers/ContaPagarMapper";
import type { Tables } from '@/types/database';

export class DbContaPagarRepository implements IContaPagarRepository {
  async findById(id: string): Promise<ContaPagar | null> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">>(
        `/financeiro/contas-pagar/${id}`,
      );
      if (!data) return null;
      return ContaPagarMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-pagar",
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findPendentes(clinicId: string): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-pagar",
        { params: { status: "PENDENTE" } },
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findVencidas(clinicId: string): Promise<ContaPagar[]> {
    const hoje = new Date().toISOString().split("T")[0];
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-pagar",
        { params: { status: "PENDENTE", vencidas_antes: hoje } },
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByFornecedor(
    clinicId: string,
    fornecedor: string,
  ): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-pagar",
        { params: { fornecedor } },
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByCategoria(
    clinicId: string,
    categoria: CategoriaContaPagar,
  ): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-pagar",
        { params: { categoria } },
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findByPeriodo(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<Tables<"financial_transactions">[]>(
        "/financeiro/contas-pagar",
        {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        },
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(conta: ContaPagar): Promise<void> {
    const insert = ContaPagarMapper.toDbInsert(conta);
    try {
      await apiClient.post("/financeiro/contas-pagar", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar conta a pagar: ${error.message}`);
    }
  }

  async update(conta: ContaPagar): Promise<void> {
    const insert = ContaPagarMapper.toDbInsert(conta);
    try {
      await apiClient.patch(`/financeiro/contas-pagar/${conta.id}`, insert);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/financeiro/contas-pagar/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar conta a pagar: ${error.message}`);
    }
  }
}
