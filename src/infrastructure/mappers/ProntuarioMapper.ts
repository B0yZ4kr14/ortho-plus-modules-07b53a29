import { Prontuario, ProntuarioProps } from '@/domain/entities/Prontuario';
import { Database } from '@/integrations/supabase/types';

type ProntuarioRow = Database['public']['Tables']['prontuarios']['Row'];

/**
 * Mapper para conversão entre Prontuario (domínio) e dados do Supabase
 */
export class ProntuarioMapper {
  static toDomain(raw: ProntuarioRow): Prontuario {
    const props: ProntuarioProps = {
      id: raw.id,
      clinicId: raw.clinic_id,
      patientId: raw.patient_id,
      numero: `PRN-${raw.id.substring(0, 8)}`, // Gerar número a partir do ID
      dataAbertura: new Date(raw.created_at),
      status: 'ATIVO', // Assumindo que todos estão ativos por padrão
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };

    return Prontuario.restore(props);
  }

  static toPersistence(prontuario: Prontuario): Partial<ProntuarioRow> {
    return {
      id: prontuario.id,
      clinic_id: prontuario.clinicId,
      patient_id: prontuario.patientId,
      patient_name: '', // Será preenchido via query
      updated_at: prontuario.updatedAt.toISOString(),
    };
  }

  static toInsert(prontuario: Prontuario): Database['public']['Tables']['prontuarios']['Insert'] {
    return {
      clinic_id: prontuario.clinicId,
      patient_id: prontuario.patientId,
      patient_name: '', // Será preenchido via query
      created_by: prontuario.patientId, // Usar o patient_id como created_by
    };
  }
}
