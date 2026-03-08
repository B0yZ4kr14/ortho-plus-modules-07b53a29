import { Confirmacao } from "@/domain/entities/Confirmacao";
import { IConfirmacaoRepository } from "@/domain/repositories/IConfirmacaoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { ConfirmacaoMapper } from "./mappers/ConfirmacaoMapper";
import type { Tables } from '@/types/database';

export class DbConfirmacaoRepository implements IConfirmacaoRepository {
  async findById(id: string): Promise<Confirmacao | null> {
    try {
      const data = await apiClient.get<Tables<"appointment_confirmations">>(`/agenda/confirmations/${id}`);
      if (!data) return null;
      return ConfirmacaoMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByAgendamentoId(
    agendamentoId: string,
  ): Promise<Confirmacao | null> {
    try {
      const data = await apiClient.get<any[]>(`/agenda/confirmations`, {
        params: { appointment_id: agendamentoId },
      });
      if (!data || data.length === 0) return null;
      return ConfirmacaoMapper.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByStatus(
    status: "PENDENTE" | "ENVIADA" | "CONFIRMADA" | "ERRO",
  ): Promise<Confirmacao[]> {
    const dbStatus =
      status === "PENDENTE"
        ? "PENDING"
        : status === "ENVIADA"
          ? "SENT"
          : status === "CONFIRMADA"
            ? "CONFIRMED"
            : "ERROR";

    try {
      const data = await apiClient.get<any[]>(`/agenda/confirmations`, {
        params: { status: dbStatus },
      });
      return (data || []).map(ConfirmacaoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findPendentes(): Promise<Confirmacao[]> {
    try {
      const data = await apiClient.get<any[]>(`/agenda/confirmations`, {
        params: { status: "PENDING" },
      });
      return (data || []).map(ConfirmacaoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findEnviadasNaoConfirmadas(): Promise<Confirmacao[]> {
    try {
      const data = await apiClient.get<any[]>(`/agenda/confirmations`, {
        params: { status: "SENT" },
      });
      return (data || []).map(ConfirmacaoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async save(confirmacao: Confirmacao): Promise<void> {
    const dbData = ConfirmacaoMapper.toDatabase(confirmacao);
    try {
      await apiClient.post("/agenda/confirmations", dbData);
    } catch (error: any) {
      throw new Error(`Erro ao salvar confirmação: ${error.message}`);
    }
  }

  async update(confirmacao: Confirmacao): Promise<void> {
    const dbData = ConfirmacaoMapper.toDatabase(confirmacao);
    try {
      await apiClient.patch(
        `/agenda/confirmations/${confirmacao.id}`,
        dbData,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar confirmação: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/agenda/confirmations/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar confirmação: ${error.message}`);
    }
  }
}
