import { Atividade, AtividadeProps, AtividadeTipo, AtividadeStatus } from '../../domain/entities/Atividade';
import { Database } from '@/integrations/supabase/types';

type AtividadeRow = Database['public']['Tables']['crm_activities']['Row'];
type AtividadeInsert = Database['public']['Tables']['crm_activities']['Insert'];

export class AtividadeMapper {
  static toDomain(raw: AtividadeRow): Atividade {
    const props: AtividadeProps = {
      id: raw.id,
      leadId: raw.lead_id,
      clinicId: raw.clinic_id,
      tipo: raw.activity_type as AtividadeTipo,
      titulo: raw.title,
      descricao: raw.description || undefined,
      dataAgendada: raw.scheduled_date ? new Date(raw.scheduled_date) : undefined,
      dataConclusao: raw.completed_date ? new Date(raw.completed_date) : undefined,
      status: raw.status as AtividadeStatus,
      responsavelId: raw.assigned_to,
      resultado: raw.outcome || undefined,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };

    return new Atividade(props);
  }

  static toPersistence(atividade: Atividade): Omit<AtividadeInsert, 'created_at'> {
    const json = atividade.toJSON();
    
    return {
      id: json.id,
      lead_id: json.leadId,
      clinic_id: json.clinicId,
      activity_type: json.tipo,
      title: json.titulo,
      description: json.descricao || null,
      scheduled_date: json.dataAgendada?.toISOString() || null,
      completed_date: json.dataConclusao?.toISOString() || null,
      status: json.status,
      assigned_to: json.responsavelId,
      outcome: json.resultado || null,
      updated_at: json.updatedAt.toISOString(),
    };
  }
}
