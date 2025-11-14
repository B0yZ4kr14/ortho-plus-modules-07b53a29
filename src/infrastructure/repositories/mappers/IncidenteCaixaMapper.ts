import { IncidenteCaixa, TipoIncidenteCaixa } from '@/domain/entities/IncidenteCaixa';
import type { Database } from '@/integrations/supabase/types';

type IncidenteCaixaRow = Database['public']['Tables']['caixa_incidentes']['Row'];
type IncidenteCaixaInsert = Database['public']['Tables']['caixa_incidentes']['Insert'];

/**
 * Mapper para converter entre IncidenteCaixa (domínio) e tabela Supabase
 */
export class IncidenteCaixaMapper {
  /**
   * Converte registro do Supabase para entidade de domínio
   */
  static toDomain(row: IncidenteCaixaRow): IncidenteCaixa {
    return IncidenteCaixa.restore({
      id: row.id,
      clinicId: row.clinic_id,
      tipoIncidente: row.tipo_incidente as TipoIncidenteCaixa,
      dataIncidente: new Date(row.data_incidente),
      horarioIncidente: row.horario_incidente,
      diaSemana: row.dia_semana,
      valorPerdido: row.valor_perdido ? Number(row.valor_perdido) : undefined,
      valorCaixaMomento: row.valor_caixa_momento ? Number(row.valor_caixa_momento) : undefined,
      descricao: row.descricao || undefined,
      boletimOcorrencia: row.boletim_ocorrencia || undefined,
      metadata: (row.metadata as Record<string, any>) || undefined,
      createdAt: new Date(row.created_at!),
      updatedAt: new Date(row.created_at!), // Usar created_at como fallback
    });
  }

  /**
   * Converte entidade de domínio para formato de insert/update do Supabase
   */
  static toSupabaseInsert(incidente: IncidenteCaixa): IncidenteCaixaInsert {
    return {
      id: incidente.id,
      clinic_id: incidente.clinicId,
      tipo_incidente: incidente.tipoIncidente,
      data_incidente: incidente.dataIncidente.toISOString(),
      horario_incidente: incidente.horarioIncidente,
      dia_semana: incidente.diaSemana,
      valor_perdido: incidente.valorPerdido,
      valor_caixa_momento: incidente.valorCaixaMomento,
      descricao: incidente.descricao,
      boletim_ocorrencia: incidente.boletimOcorrencia,
      metadata: incidente.metadata as any,
      created_at: incidente.createdAt.toISOString(),
    };
  }
}
