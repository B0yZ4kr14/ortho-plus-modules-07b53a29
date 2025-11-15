import { Appointment } from '../entities/Appointment';

export interface IAppointmentRepository {
  save(appointment: Appointment): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByClinicId(clinicId: string): Promise<Appointment[]>;
  findByPatient(patientId: string): Promise<Appointment[]>;
  findByDentist(dentistId: string): Promise<Appointment[]>;
  findByDateRange(clinicId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
  findByDentistAndDateRange(dentistId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
  findConflicts(dentistId: string, startDatetime: Date, endDatetime: Date, excludeId?: string): Promise<Appointment[]>;
  update(appointment: Appointment): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
