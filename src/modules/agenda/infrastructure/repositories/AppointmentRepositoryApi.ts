import { apiClient } from "@/lib/api/apiClient";
import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { AppointmentMapper } from "../mappers/AppointmentMapper";

export class AppointmentRepositoryApi implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    const result = await apiClient.post<any>("/agenda/appointments", data);
    return AppointmentMapper.toDomain(result);
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const data = await apiClient.get<any>(`/agenda/appointments/${id}`);
      return data ? AppointmentMapper.toDomain(data) : null;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<Appointment[]> {
    const data = await apiClient.get<any[]>(`/agenda/appointments`, {
      params: { clinic_id: clinicId },
    });
    return data.map(AppointmentMapper.toDomain);
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    const data = await apiClient.get<any[]>(`/agenda/appointments`, {
      params: { patient_id: patientId },
    });
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDentist(dentistId: string): Promise<Appointment[]> {
    const data = await apiClient.get<any[]>(`/agenda/appointments`, {
      params: { dentist_id: dentistId },
    });
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const data = await apiClient.get<any[]>(`/agenda/appointments`, {
      params: {
        clinic_id: clinicId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const data = await apiClient.get<any[]>(`/agenda/appointments`, {
      params: {
        dentist_id: dentistId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    return data.map(AppointmentMapper.toDomain);
  }

  async findConflicts(
    dentistId: string,
    startDatetime: Date,
    endDatetime: Date,
    excludeId?: string,
  ): Promise<Appointment[]> {
    const params: any = {
      dentist_id: dentistId,
      start_time: startDatetime.toISOString(),
      end_time: endDatetime.toISOString(),
    };
    if (excludeId) params.exclude_id = excludeId;

    // Use the conflict endpoint which returns { hasConflict, count }
    // For backward compat, we return empty array if no conflicts
    const result = await apiClient.get<{ hasConflict: boolean }>(
      `/agenda/appointments/conflict`,
      { params },
    );

    // If there are conflicts, fetch the conflicting appointments
    if (result?.hasConflict) {
      const data = await apiClient.get<any[]>(`/agenda/appointments`, {
        params: {
          dentist_id: dentistId,
          start_date: startDatetime.toISOString(),
          end_date: endDatetime.toISOString(),
        },
      });
      return data
        .filter((a) => a.id !== excludeId)
        .map(AppointmentMapper.toDomain);
    }
    return [];
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toUpdate(appointment);
    const result = await apiClient.patch<any>(
      `/agenda/appointments/${appointment.id}`,
      data,
    );
    return AppointmentMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/agenda/appointments/${id}`);
  }
}
