import { Patient } from '@/domain/entities/Patient';
import { Email } from '@/domain/value-objects/Email';
import { CPF } from '@/domain/value-objects/CPF';
import { Phone } from '@/domain/value-objects/Phone';
import { Database } from '@/integrations/supabase/types';

type PatientRow = Database['public']['Tables']['patients']['Row'];

/**
 * Mapper: Supabase Row ↔ Patient Entity
 */
export class PatientMapper {
  static toDomain(row: PatientRow): Patient {
    return Patient.restore({
      id: row.id,
      clinicId: row.clinic_id,
      fullName: row.full_name,
      email: row.email ? Email.create(row.email) : undefined,
      cpf: row.cpf ? CPF.create(row.cpf) : undefined,
      phone: row.phone ? Phone.create(row.phone) : undefined,
      birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
      gender: row.gender as 'masculino' | 'feminino' | 'outro' | undefined,
      address: row.address ?? undefined,
      riskLevel: row.risk_level as 'baixo' | 'moderado' | 'alto' | 'critico',
      riskScoreMedical: row.risk_score_medical,
      riskScoreSurgical: row.risk_score_surgical,
      riskScoreAnesthetic: row.risk_score_anesthetic,
      riskScoreOverall: row.risk_score_overall,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toPersistence(patient: Patient): Omit<PatientRow, 'created_at' | 'updated_at'> {
    return {
      id: patient.id,
      clinic_id: patient.clinicId,
      full_name: patient.fullName,
      email: patient.email?.getValue() ?? null,
      cpf: patient.cpf?.getValue() ?? null,
      phone: patient.phone?.getValue() ?? null,
      birth_date: patient.birthDate?.toISOString() ?? null,
      gender: patient.gender ?? null,
      address: patient.address ?? null,
      risk_level: patient.riskLevel,
      risk_score_medical: patient.riskScoreMedical,
      risk_score_surgical: patient.riskScoreSurgical,
      risk_score_anesthetic: patient.riskScoreAnesthetic,
      risk_score_overall: patient.riskScoreOverall,
      is_active: patient.isActive,
      // Campos opcionais de saúde
      weight_kg: null,
      height_cm: null,
      bmi: null,
      blood_type: null,
      allergies: null,
      current_medications: null,
      has_cardiovascular_disease: false,
      has_diabetes: false,
      diabetes_controlled: null,
      has_hypertension: false,
      hypertension_controlled: null,
      has_bleeding_disorder: false,
      has_medication_allergy: false,
      has_hepatitis: false,
      has_hiv: false,
      is_smoker: false,
      is_pregnant: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      notes: null,
    };
  }
}
