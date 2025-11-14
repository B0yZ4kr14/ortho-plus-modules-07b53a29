import { Patient } from '@/domain/entities/Patient';
import { Email } from '@/domain/value-objects/Email';
import { CPF } from '@/domain/value-objects/CPF';
import { Phone } from '@/domain/value-objects/Phone';
import { Database } from '@/integrations/supabase/types';

type ProntuarioRow = Database['public']['Tables']['prontuarios']['Row'];

/**
 * Mapper: Supabase Row ↔ Patient Entity
 * Usa a tabela 'prontuarios' existente como fonte de dados de pacientes
 */
export class PatientMapper {
  static toDomain(row: ProntuarioRow): Patient {
    return Patient.restore({
      id: row.patient_id,
      clinicId: row.clinic_id,
      fullName: row.patient_name,
      riskLevel: 'baixo', // Default - será calculado pelos use cases
      riskScoreMedical: 0,
      riskScoreSurgical: 0,
      riskScoreAnesthetic: 0,
      riskScoreOverall: 0,
      status: 'ATIVO',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toPersistence(patient: Patient): Omit<ProntuarioRow, 'created_at' | 'updated_at'> {
    return {
      id: crypto.randomUUID(), // Prontuário ID
      clinic_id: patient.clinicId,
      patient_id: patient.id,
      patient_name: patient.fullName,
      created_by: '', // Será preenchido no repository
    };
  }
}
