import { DentistSchedule, DentistScheduleProps } from '../../domain/entities/DentistSchedule';

// Tipo temporário até a tabela ser criada
interface DentistScheduleRow {
  id: string;
  clinic_id: string;
  dentist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DentistScheduleInsert {
  clinic_id: string;
  dentist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start?: string | null;
  break_end?: string | null;
  is_active?: boolean;
}

export class DentistScheduleMapper {
  static toDomain(row: DentistScheduleRow): DentistSchedule {
    const props: DentistScheduleProps = {
      id: row.id,
      clinicId: row.clinic_id,
      dentistId: row.dentist_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      breakStart: row.break_start || undefined,
      breakEnd: row.break_end || undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new DentistSchedule(props);
  }

  static toPersistence(schedule: DentistSchedule): DentistScheduleInsert {
    return {
      clinic_id: schedule.clinicId,
      dentist_id: schedule.dentistId,
      day_of_week: schedule.dayOfWeek,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      break_start: schedule.breakStart || null,
      break_end: schedule.breakEnd || null,
      is_active: schedule.isActive,
    };
  }

  static toUpdate(schedule: DentistSchedule): Partial<DentistScheduleRow> {
    return {
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      break_start: schedule.breakStart || null,
      break_end: schedule.breakEnd || null,
      is_active: schedule.isActive,
      updated_at: new Date().toISOString(),
    };
  }
}
