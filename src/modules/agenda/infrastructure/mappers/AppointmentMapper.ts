import { Appointment, AppointmentProps, AppointmentStatus, AppointmentType } from '../../domain/entities/Appointment';
import { Database } from '@/integrations/supabase/types';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export class AppointmentMapper {
  static toDomain(row: AppointmentRow): Appointment {
    const props: AppointmentProps = {
      id: row.id,
      clinicId: row.clinic_id,
      patientId: row.patient_id,
      dentistId: row.dentist_id,
      scheduledDatetime: new Date(row.start_time),
      durationMinutes: Math.floor((new Date(row.end_time).getTime() - new Date(row.start_time).getTime()) / 60000),
      status: row.status as AppointmentStatus,
      appointmentType: (row.title || 'CONSULTA') as AppointmentType,
      notes: row.description || undefined,
      confirmedAt: undefined, // Não existe no schema atual
      completedAt: undefined, // Não existe no schema atual
      cancelledAt: undefined, // Não existe no schema atual
      cancellationReason: undefined, // Não existe no schema atual
      noShow: false,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Appointment(props);
  }

  static toPersistence(appointment: Appointment): AppointmentInsert {
    const endTime = new Date(appointment.scheduledDatetime.getTime() + appointment.durationMinutes * 60000);
    
    return {
      clinic_id: appointment.clinicId,
      patient_id: appointment.patientId,
      dentist_id: appointment.dentistId,
      start_time: appointment.scheduledDatetime.toISOString(),
      end_time: endTime.toISOString(),
      status: appointment.status,
      title: appointment.appointmentType,
      description: appointment.notes || null,
      created_by: appointment.createdBy,
      treatment_id: null,
    };
  }

  static toUpdate(appointment: Appointment): Partial<AppointmentRow> {
    const endTime = new Date(appointment.scheduledDatetime.getTime() + appointment.durationMinutes * 60000);
    
    return {
      patient_id: appointment.patientId,
      dentist_id: appointment.dentistId,
      start_time: appointment.scheduledDatetime.toISOString(),
      end_time: endTime.toISOString(),
      status: appointment.status,
      title: appointment.appointmentType,
      description: appointment.notes || null,
      updated_at: new Date().toISOString(),
    };
  }
}
