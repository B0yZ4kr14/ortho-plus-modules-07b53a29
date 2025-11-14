import { Odontograma, OdontogramaProps } from '@/domain/entities/Odontograma';
import { Database } from '@/integrations/supabase/types';

type OdontogramaRow = Database['public']['Tables']['odontogramas']['Row'];
type OdontogramaInsert = Database['public']['Tables']['odontogramas']['Insert'];

/**
 * Mapper: Odontograma Entity <-> Supabase odontogramas table
 */
export class OdontogramaMapper {
  /**
   * Converte row do Supabase para Entidade de Domínio
   */
  static toDomain(row: OdontogramaRow): Odontograma {
    const props: OdontogramaProps = {
      id: row.id,
      prontuarioId: row.prontuario_id,
      teeth: row.teeth as any, // JSONB será parseado automaticamente
      lastUpdated: new Date(row.last_updated),
      history: (row.history as any) || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return Odontograma.restore(props);
  }

  /**
   * Converte Entidade de Domínio para Insert do Supabase
   */
  static toSupabaseInsert(entity: Odontograma, clinicId: string): OdontogramaInsert {
    return {
      id: entity.id,
      prontuario_id: entity.prontuarioId,
      clinic_id: clinicId,
      teeth: entity.teeth as any,
      last_updated: entity.lastUpdated.toISOString(),
      history: entity.history as any,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }
}
