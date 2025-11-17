/**
 * Patient Data Adapter
 * Converte entre formato API (snake_case) e Frontend (camelCase)
 */

// API Format (from REST API - camelCase)
interface PatientAPI {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  celular?: string;
  email?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
}

// Frontend Global Format (snake_case - used by components)
import type { Patient as GlobalPatient } from '@/types/patient';

export class PatientAdapter {
  /**
   * Converte Patient da API (camelCase) para formato Global Frontend (snake_case)
   */
  static toFrontend(apiPatient: PatientAPI): GlobalPatient {
    return {
      id: apiPatient.id,
      clinic_id: '', // Will be set by context
      patient_code: `PAC-${apiPatient.id.slice(0, 8).toUpperCase()}`,
      full_name: apiPatient.nome,
      social_name: null,
      cpf: apiPatient.cpf || null,
      rg: null,
      birth_date: apiPatient.dataNascimento,
      gender: null,
      marital_status: null,
      nationality: null,
      occupation: null,
      education_level: null,
      email: apiPatient.email || null,
      phone_primary: apiPatient.telefone || apiPatient.celular || '',
      phone_secondary: apiPatient.celular || null,
      phone_emergency: null,
      emergency_contact_name: null,
      emergency_contact_relationship: null,
      address_street: apiPatient.endereco?.logradouro || null,
      address_number: apiPatient.endereco?.numero || null,
      address_complement: apiPatient.endereco?.complemento || null,
      address_neighborhood: apiPatient.endereco?.bairro || null,
      address_city: apiPatient.endereco?.cidade || null,
      address_state: apiPatient.endereco?.estado || null,
      address_zipcode: apiPatient.endereco?.cep || null,
      address_country: 'Brasil',
      has_systemic_disease: null,
      systemic_diseases: null,
      has_cardiovascular_disease: null,
      cardiovascular_details: null,
      has_diabetes: null,
      diabetes_type: null,
      diabetes_controlled: null,
      has_hypertension: null,
      hypertension_controlled: null,
      has_allergies: null,
      allergies_list: null,
      has_medication_allergy: null,
      medication_allergies: null,
      current_medications: null,
      has_bleeding_disorder: null,
      bleeding_disorder_details: null,
      is_pregnant: null,
      pregnancy_trimester: null,
      is_breastfeeding: null,
      has_hepatitis: null,
      hepatitis_type: null,
      has_hiv: null,
      has_smoking_habit: null,
      smoking_frequency: null,
      has_alcohol_habit: null,
      alcohol_frequency: null,
      blood_pressure_systolic: null,
      blood_pressure_diastolic: null,
      heart_rate: null,
      blood_type: null,
      weight_kg: null,
      height_cm: null,
      bmi: null,
      main_complaint: null,
      pain_level: null,
      clinical_observations: null,
      oral_hygiene_quality: null,
      gum_condition: null,
      risk_score_medical: null,
      risk_score_surgical: null,
      risk_score_anesthetic: null,
      risk_score_overall: 0,
      risk_level: 'baixo',
      total_debt: null,
      total_paid: null,
      payment_status: null,
      preferred_payment_method: null,
      lgpd_consent: null,
      lgpd_consent_date: null,
      image_usage_consent: null,
      treatment_consent: null,
      data_sharing_consent: null,
      status: apiPatient.status || 'ativo',
      first_appointment_date: null,
      last_appointment_date: null,
      total_appointments: 0,
      created_at: apiPatient.createdAt,
      updated_at: apiPatient.updatedAt || apiPatient.createdAt,
      created_by: null,
      updated_by: null,
    };
  }

  /**
   * Converte Patient do Frontend Global para formato API
   */
  static toAPI(frontendPatient: Partial<GlobalPatient>): Partial<PatientAPI> {
    return {
      nome: frontendPatient.full_name,
      cpf: frontendPatient.cpf || undefined,
      dataNascimento: frontendPatient.birth_date,
      telefone: frontendPatient.phone_primary,
      celular: frontendPatient.phone_secondary || undefined,
      email: frontendPatient.email || undefined,
      status: frontendPatient.status || 'ativo',
      endereco: {
        cep: frontendPatient.address_zipcode || undefined,
        logradouro: frontendPatient.address_street || undefined,
        numero: frontendPatient.address_number || undefined,
        complemento: frontendPatient.address_complement || undefined,
        bairro: frontendPatient.address_neighborhood || undefined,
        cidade: frontendPatient.address_city || undefined,
        estado: frontendPatient.address_state || undefined,
      },
    };
  }

  /**
   * Converte lista de patients
   */
  static toFrontendList(apiPatients: PatientAPI[]): GlobalPatient[] {
    return apiPatients.map(patient => this.toFrontend(patient));
  }
}
