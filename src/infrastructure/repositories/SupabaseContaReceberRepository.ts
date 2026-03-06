import { ContaReceber } from "@/domain/entities/ContaReceber";
import { IContaReceberRepository } from "@/domain/repositories/IContaReceberRepository";
import { apiClient } from "@/lib/api/apiClient";
import { ContaReceberMapper } from "./mappers/ContaReceberMapper";

export class SupabaseContaReceberRepository implements IContaReceberRepository {
  async findById(id: string): Promise<ContaReceber | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_receber?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return ContaReceberMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<ContaReceber[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_receber?clinic_id=eq.${clinicId}&order=data_vencimento.asc`,
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_receber?clinic_id=eq.${clinicId}&patient_id=eq.${patientId}&order=data_vencimento.asc`,
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findPendentes(clinicId: string): Promise<ContaReceber[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_receber?clinic_id=eq.${clinicId}&status=eq.PENDENTE&order=data_vencimento.asc`,
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async findVencidas(clinicId: string): Promise<ContaReceber[]> {
    const hoje = new Date().toISOString().split("T")[0];
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_receber?clinic_id=eq.${clinicId}&status=eq.PENDENTE&data_vencimento=lt.${hoje}&order=data_vencimento.asc`,
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/contas_receber?clinic_id=eq.${clinicId}&data_vencimento=gte.${startDate.toISOString()}&data_vencimento=lte.${endDate.toISOString()}&order=data_vencimento.asc`,
      );
      return (data || []).map((row) => ContaReceberMapper.toDomain(row));
    } catch {
      return [];
    }
  }

  async save(conta: ContaReceber): Promise<void> {
    const insert = ContaReceberMapper.toSupabaseInsert(conta);
    try {
      await apiClient.post("/rest/v1/contas_receber", insert);
    } catch (error: any) {
      throw new Error(`Erro ao salvar conta a receber: ${error.message}`);
    }
  }

  async update(conta: ContaReceber): Promise<void> {
    const insert = ContaReceberMapper.toSupabaseInsert(conta);
    try {
      await apiClient.patch(
        `/rest/v1/contas_receber?id=eq.${conta.id}`,
        insert,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/contas_receber?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar conta a receber: ${error.message}`);
    }
  }
}
