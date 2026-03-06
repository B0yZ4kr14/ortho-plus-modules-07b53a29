import { Confirmacao } from "@/domain/entities/Confirmacao";
import { IConfirmacaoRepository } from "@/domain/repositories/IConfirmacaoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { ConfirmacaoMapper } from "./mappers/ConfirmacaoMapper";

export class SupabaseConfirmacaoRepository implements IConfirmacaoRepository {
  async findById(id: string): Promise<Confirmacao | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointment_confirmations?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return ConfirmacaoMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByAgendamentoId(
    agendamentoId: string,
  ): Promise<Confirmacao | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointment_confirmations?appointment_id=eq.${agendamentoId}&order=created_at.desc&limit=1`,
      );
      if (!data || data.length === 0) return null;
      return ConfirmacaoMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByStatus(
    status: "PENDENTE" | "ENVIADA" | "CONFIRMADA" | "ERRO",
  ): Promise<Confirmacao[]> {
    // Mapear status para o formato do banco
    const dbStatus =
      status === "PENDENTE"
        ? "PENDING"
        : status === "ENVIADA"
          ? "SENT"
          : status === "CONFIRMADA"
            ? "CONFIRMED"
            : "ERROR";

    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointment_confirmations?status=eq.${dbStatus}&order=created_at.asc`,
      );
      return (data || []).map(ConfirmacaoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findPendentes(): Promise<Confirmacao[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointment_confirmations?status=eq.PENDING&order=created_at.asc`,
      );
      return (data || []).map(ConfirmacaoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findEnviadasNaoConfirmadas(): Promise<Confirmacao[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointment_confirmations?status=eq.SENT&order=sent_at.asc`,
      );
      return (data || []).map(ConfirmacaoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async save(confirmacao: Confirmacao): Promise<void> {
    const dbData = ConfirmacaoMapper.toDatabase(confirmacao);
    try {
      await apiClient.post("/rest/v1/appointment_confirmations", dbData);
    } catch (error: any) {
      throw new Error(`Erro ao salvar confirmação: ${error.message}`);
    }
  }

  async update(confirmacao: Confirmacao): Promise<void> {
    const dbData = ConfirmacaoMapper.toDatabase(confirmacao);
    try {
      await apiClient.patch(
        `/rest/v1/appointment_confirmations?id=eq.${confirmacao.id}`,
        dbData,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar confirmação: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/appointment_confirmations?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar confirmação: ${error.message}`);
    }
  }
}
