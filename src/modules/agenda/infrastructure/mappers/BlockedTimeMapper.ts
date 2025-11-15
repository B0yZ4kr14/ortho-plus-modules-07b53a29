import { BlockedTime, BlockedTimeProps } from '../../domain/entities/BlockedTime';

// Tipo temporário até a tabela ser criada
interface BlockedTimeRow {
  id: string;
  clinic_id: string;
  dentist_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  created_by: string;
  created_at: string;
}

interface BlockedTimeInsert {
  clinic_id: string;
  dentist_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  created_by: string;
}

export class BlockedTimeMapper {
  static toDomain(row: BlockedTimeRow): BlockedTime {
    const props: BlockedTimeProps = {
      id: row.id,
      clinicId: row.clinic_id,
      dentistId: row.dentist_id,
      startDatetime: new Date(row.start_datetime),
      endDatetime: new Date(row.end_datetime),
      reason: row.reason,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
    };

    return new BlockedTime(props);
  }

  static toPersistence(blockedTime: BlockedTime): BlockedTimeInsert {
    return {
      clinic_id: blockedTime.clinicId,
      dentist_id: blockedTime.dentistId,
      start_datetime: blockedTime.startDatetime.toISOString(),
      end_datetime: blockedTime.endDatetime.toISOString(),
      reason: blockedTime.reason,
      created_by: blockedTime.createdBy,
    };
  }
}
