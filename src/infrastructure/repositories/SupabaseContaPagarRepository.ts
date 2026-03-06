import { CategoriaContaPagar, ContaPagar } from "@/domain/entities/ContaPagar";
import { IContaPagarRepository } from "@/domain/repositories/IContaPagarRepository";
import { apiClient } from "@/lib/api/apiClient";
import { ContaPagarMapper } from "./mappers/ContaPagarMapper";

export class SupabaseContaPagarRepository implements IContaPagarRepository {
  async findById(id: string): Promise<ContaPagar | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return ContaPagarMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?clinic_id=eq.${clinicId}&order=data_vencimento.asc`,
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findPendentes(clinicId: string): Promise<ContaPagar[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?clinic_id=eq.${clinicId}&status=eq.PENDENTE&order=data_vencimento.asc`,
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findVencidas(clinicId: string): Promise<ContaPagar[]> {
    const hoje = new Date().toISOString().split("T")[0];
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?clinic_id=eq.${clinicId}&status=eq.PENDENTE&data_vencimento=lt.${hoje}&order=data_vencimento.asc`,
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?clinic_id=eq.${clinicId}&fornecedor=ilike.*${fornecedor}*&order=data_vencimento.asc`,
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?clinic_id=eq.${clinicId}&categoria=eq.${categoria}&order=data_vencimento.asc`,
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_pagar?clinic_id=eq.${clinicId}&data_vencimento=gte.${startDate.toISOString()}&data_vencimento=lte.${endDate.toISOString()}&order=data_vencimento.asc`,
      );
      return (data || []).map((row) => ContaPagarMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(conta: ContaPagar): Promise<void> {
    const insert = ContaPagarMapper.toSupabaseInsert(conta);
    try {
      await apiClient.post("/rest/v1/contas_pagar", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar conta a pagar: ${error.message}`);
    }
  }

  async update(conta: ContaPagar): Promise<void> {
    const insert = ContaPagarMapper.toSupabaseInsert(conta);
    try {
      await apiClient.patch(`/rest/v1/contas_pagar?id=eq.${conta.id}`, insert);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/contas_pagar?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar conta a pagar: ${error.message}`);
    }
  }
}
