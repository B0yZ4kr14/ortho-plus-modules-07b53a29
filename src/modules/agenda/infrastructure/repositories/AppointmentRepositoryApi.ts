import { Database } from "@/integrations/supabase/types";
import { apiClient } from "@/lib/api/apiClient";
import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { AppointmentMapper } from "../mappers/AppointmentMapper";

type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

export class AppointmentRepositoryApi implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);

    const result = await apiClient.post<AppointmentRow>(
      "/rest/v1/appointments",
      data,
    );

    return AppointmentMapper.toDomain(result);
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const data = await apiClient.get<AppointmentRow>(
        `/rest/v1/appointments/${id}`,
      );
      return data ? AppointmentMapper.toDomain(data) : null;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<Appointment[]> {
    const data = await apiClient.get<AppointmentRow[]>(
      `/rest/v1/appointments?clinic_id=eq.${clinicId}&order=start_time.asc`,
    );
    return data.map(AppointmentMapper.toDomain);
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    const data = await apiClient.get<AppointmentRow[]>(
      `/rest/v1/appointments?patient_id=eq.${patientId}&order=start_time.desc`,
    );
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDentist(dentistId: string): Promise<Appointment[]> {
    const data = await apiClient.get<AppointmentRow[]>(
      `/rest/v1/appointments?dentist_id=eq.${dentistId}&order=start_time.asc`,
    );
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const data = await apiClient.get<AppointmentRow[]>(
      `/rest/v1/appointments?clinic_id=eq.${clinicId}&start_time=gte.${startDate.toISOString()}&start_time=lte.${endDate.toISOString()}&order=start_time.asc`,
    );
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const data = await apiClient.get<AppointmentRow[]>(
      `/rest/v1/appointments?dentist_id=eq.${dentistId}&start_time=gte.${startDate.toISOString()}&end_time=lte.${endDate.toISOString()}&order=start_time.asc`,
    );
    return data.map(AppointmentMapper.toDomain);
  }

  async findConflicts(
    dentistId: string,
    startDatetime: Date,
    endDatetime: Date,
    excludeId?: string,
  ): Promise<Appointment[]> {
    let url = `/rest/v1/appointments?dentist_id=eq.${dentistId}&status=neq.CANCELADO&status=neq.FALTOU&start_time=lt.${endDatetime.toISOString()}&end_time=gt.${startDatetime.toISOString()}`;

    if (excludeId) {
      url += `&id=neq.${excludeId}`;
    }

    const data = await apiClient.get<AppointmentRow[]>(url);
    return data.map(AppointmentMapper.toDomain);
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toUpdate(appointment);

    const result = await apiClient.patch<AppointmentRow>(
      `/rest/v1/appointments/${appointment.id}`,
      data,
    );
    return AppointmentMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/rest/v1/appointments/${id}`);
  }
}
