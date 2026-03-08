import { apiClient } from "@/lib/api/apiClient";
import { DentistSchedule } from "../../domain/entities/DentistSchedule";
import { IDentistScheduleRepository } from "../../domain/repositories/IDentistScheduleRepository";
import { DentistScheduleMapper } from "../mappers/DentistScheduleMapper";

export class DentistScheduleRepositoryApi
  implements IDentistScheduleRepository
{
  private readonly basePath = "/agenda/schedules";

  async save(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toPersistence(schedule);
    const result = await apiClient.post<any>(this.basePath, data);
    return DentistScheduleMapper.toDomain(result);
  }

  async findById(id: string): Promise<DentistSchedule | null> {
    try {
      const data = await apiClient.get<any>(`${this.basePath}/${id}`);
      return data ? DentistScheduleMapper.toDomain(data) : null;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar horário: ${error.message}`);
    }
  }

  async findByDentist(dentistId: string): Promise<DentistSchedule[]> {
    const data = await apiClient.get<any[]>(this.basePath, {
      params: { dentist_id: dentistId, is_active: true },
    });
    return data.map(DentistScheduleMapper.toDomain);
  }

  async findByDentistAndDayOfWeek(
    dentistId: string,
    dayOfWeek: number,
  ): Promise<DentistSchedule | null> {
    try {
      const data = await apiClient.get<any[]>(this.basePath, {
        params: {
          dentist_id: dentistId,
          day_of_week: dayOfWeek,
          is_active: true,
        },
      });
      if (data.length > 0) return DentistScheduleMapper.toDomain(data[0]);
      return null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar horário: ${error.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<DentistSchedule[]> {
    const data = await apiClient.get<any[]>(this.basePath, {
      params: { clinic_id: clinicId, is_active: true },
    });
    return data.map(DentistScheduleMapper.toDomain);
  }

  async update(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toUpdate(schedule);
    const result = await apiClient.patch<any>(
      `${this.basePath}/${schedule.id}`,
      data,
    );
    return DentistScheduleMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
