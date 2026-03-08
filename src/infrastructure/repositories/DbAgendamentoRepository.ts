import { Agendamento } from "@/domain/entities/Agendamento";
import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { AgendamentoMapper } from "./mappers/AgendamentoMapper";
import type { Tables } from '@/types/database';

export class DbAgendamentoRepository implements IAgendamentoRepository {
  async findById(id: string): Promise<Agendamento | null> {
    try {
      const data = await apiClient.get<Tables<"appointments">>(`/agenda/appointments/${id}`);
      if (!data) return null;
      return AgendamentoMapper.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<Tables<"appointments">[]>(`/agenda/appointments`, {
        params: {
          dentist_id: dentistId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findByPatientId(
    patientId: string,
    clinicId: string,
  ): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<any[]>(`/agenda/appointments`, {
        params: { patient_id: patientId, clinic_id: clinicId },
      });
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findByClinicAndDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<any[]>(`/agenda/appointments`, {
        params: {
          clinic_id: clinicId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
      });
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findByStatus(
    clinicId: string,
    status:
      | "AGENDADO"
      | "CONFIRMADO"
      | "EM_ATENDIMENTO"
      | "CONCLUIDO"
      | "CANCELADO"
      | "FALTOU",
  ): Promise<Agendamento[]> {
    const dbStatus = status.toLowerCase();
    try {
      const data = await apiClient.get<any[]>(`/agenda/appointments`, {
        params: { clinic_id: clinicId, status: dbStatus },
      });
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findAtivos(clinicId: string): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<any[]>(`/agenda/appointments`, {
        params: {
          clinic_id: clinicId,
          status: "not.in.(cancelado,concluido,faltou)",
        },
      });
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async hasConflict(
    dentistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      const params: Record<string, string> = {
        dentist_id: dentistId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      };
      if (excludeId) params.exclude_id = excludeId;

      const data = await apiClient.get<{ hasConflict: boolean }>(
        `/agenda/appointments/conflict`,
        { params },
      );
      return data?.hasConflict ?? false;
    } catch (error) {
      console.error("Erro ao verificar conflito:", error);
      return false;
    }
  }

  async save(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);
    try {
      await apiClient.post("/agenda/appointments", dbData);
    } catch (error: any) {
      throw new Error(`Erro ao salvar agendamento: ${error.message}`);
    }
  }

  async update(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);
    try {
      await apiClient.patch(`/agenda/appointments/${agendamento.id}`, dbData);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/agenda/appointments/${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar agendamento: ${error.message}`);
    }
  }
}
