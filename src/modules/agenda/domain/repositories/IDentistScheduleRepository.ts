import { DentistSchedule } from '../entities/DentistSchedule';

export interface IDentistScheduleRepository {
  save(schedule: DentistSchedule): Promise<DentistSchedule>;
  findById(id: string): Promise<DentistSchedule | null>;
  findByDentist(dentistId: string): Promise<DentistSchedule[]>;
  findByDentistAndDayOfWeek(dentistId: string, dayOfWeek: number): Promise<DentistSchedule | null>;
  findByClinicId(clinicId: string): Promise<DentistSchedule[]>;
  update(schedule: DentistSchedule): Promise<DentistSchedule>;
  delete(id: string): Promise<void>;
}
