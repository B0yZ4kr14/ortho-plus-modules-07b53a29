import { Agendamento, AgendamentoProps } from '@/domain/entities/Agendamento';
import { Database } from '@/integrations/supabase/types';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

/**
 * Mapper para converter entre Agendamento (Domain) e appointments (Database)
 */
export class AgendamentoMapper {
  /**
   * Converte do banco de dados para entidade de domínio
   */
  static toDomain(row: AppointmentRow): Agendamento {
    const props: AgendamentoProps = {
      id: row.id,
      clinicId: row.clinic_id,
      patientId: row.patient_id,
      dentistId: row.dentist_id,
      title: row.title,
      description: row.description || undefined,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      status: this.mapStatusToDomain(row.status),
      treatmentId: row.treatment_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
    };

    return Agendamento.restore(props);
  }

  /**
   * Converte da entidade de domínio para insert no banco
   */
  static toDatabase(agendamento: Agendamento): AppointmentInsert {
    return {
      id: agendamento.id,
      clinic_id: agendamento.clinicId,
      patient_id: agendamento.patientId,
      dentist_id: agendamento.dentistId,
      title: agendamento.title,
      description: agendamento.description || null,
      start_time: agendamento.startTime.toISOString(),
      end_time: agendamento.endTime.toISOString(),
      status: this.mapStatusToDatabase(agendamento.status),
      treatment_id: agendamento.treatmentId || null,
      created_by: agendamento.createdBy,
      created_at: agendamento.createdAt.toISOString(),
      updated_at: agendamento.updatedAt.toISOString(),
    };
  }

  /**
   * Mapeia status do banco para domínio
   */
  private static mapStatusToDomain(dbStatus: string): AgendamentoProps['status'] {
    const statusMap: Record<string, AgendamentoProps['status']> = {
      'agendado': 'AGENDADO',
      'confirmado': 'CONFIRMADO',
      'em_atendimento': 'EM_ATENDIMENTO',
      'concluido': 'CONCLUIDO',
      'cancelado': 'CANCELADO',
      'faltou': 'FALTOU',
    };

    return statusMap[dbStatus.toLowerCase()] || 'AGENDADO';
  }

  /**
   * Mapeia status do domínio para banco
   */
  private static mapStatusToDatabase(domainStatus: AgendamentoProps['status']): string {
    const statusMap: Record<AgendamentoProps['status'], string> = {
      'AGENDADO': 'agendado',
      'CONFIRMADO': 'confirmado',
      'EM_ATENDIMENTO': 'em_atendimento',
      'CONCLUIDO': 'concluido',
      'CANCELADO': 'cancelado',
      'FALTOU': 'faltou',
    };

    return statusMap[domainStatus];
  }
}
