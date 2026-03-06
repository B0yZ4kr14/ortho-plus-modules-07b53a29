import { Agendamento } from "@/domain/entities/Agendamento";
import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { AgendamentoMapper } from "./mappers/AgendamentoMapper";

export class SupabaseAgendamentoRepository implements IAgendamentoRepository {
  async findById(id: string): Promise<Agendamento | null> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointments?id=eq.${id}`,
      );
      if (!data || data.length === 0) return null;
      return AgendamentoMapper.toDomain(data[0]);
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointments?dentist_id=eq.${dentistId}&start_time=gte.${startDate.toISOString()}&end_time=lte.${endDate.toISOString()}&order=start_time.asc`,
      );
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointments?patient_id=eq.${patientId}&clinic_id=eq.${clinicId}&order=start_time.desc`,
      );
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointments?clinic_id=eq.${clinicId}&start_time=gte.${startDate.toISOString()}&end_time=lte.${endDate.toISOString()}&order=start_time.asc`,
      );
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
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointments?clinic_id=eq.${clinicId}&status=eq.${dbStatus}&order=start_time.asc`,
      );
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch {
      return [];
    }
  }

  async findAtivos(clinicId: string): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<any[]>(
        `/rest/v1/appointments?clinic_id=eq.${clinicId}&status=not.in.(cancelado,concluido,faltou)&order=start_time.asc`,
      );
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
      let url = `/rest/v1/appointments?dentist_id=eq.${dentistId}&status=not.in.(cancelado,faltou)&or=(start_time.lte.${startTime.toISOString()},end_time.gte.${endTime.toISOString()})&select=id`;
      if (excludeId) {
        url += `&id=neq.${excludeId}`;
      }
      const data = await apiClient.get<any[]>(url);
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      console.error("Erro ao verificar conflito:", error);
      return false;
    }
  }

  async save(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);
    try {
      await apiClient.post("/rest/v1/appointments", dbData);
    } catch (error: any) {
      throw new Error(`Erro ao salvar agendamento: ${error.message}`);
    }
  }

  async update(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);
    try {
      await apiClient.patch(
        `/rest/v1/appointments?id=eq.${agendamento.id}`,
        dbData,
      );
    } catch (error: any) {
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/rest/v1/appointments?id=eq.${id}`);
    } catch (error: any) {
      throw new Error(`Erro ao deletar agendamento: ${error.message}`);
    }
  }
}
