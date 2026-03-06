/**
 * Patient Data Adapter
 * Converte entre formato API (snake_case) e Frontend (camelCase)
 */

// API Format (from REST API - camelCase, matching PatientProps in domain)
interface PatientAPI {
  id: string;
  clinicId: string;
  fullName: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  totalDebt?: number;
  totalPaid?: number;
  paymentStatus?: string;

  // Status and other complex types we might receive as simplified objects
  status: any; // Keep as any or define PatientStatus here if needed from backend
  dadosComerciais?: any;
  notes?: string;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Frontend Global Format (snake_case - used by components)
import type { Patient as GlobalPatient } from "@/types/patient";

export class PatientAdapter {
  /**
   * Converte Patient da API (camelCase) para formato Global Frontend (snake_case)
   */
  static toFrontend(apiPatient: PatientAPI): GlobalPatient {
    return {
      id: apiPatient.id,
      clinic_id: apiPatient.clinicId || "",
      patient_code: `PAC-${apiPatient.id.slice(0, 8).toUpperCase()}`,
      full_name: apiPatient.fullName,
      social_name: null,
      cpf: apiPatient.cpf || null,
      rg: apiPatient.rg || null,
      birth_date: apiPatient.birthDate || null,
      gender: apiPatient.gender || null,
      marital_status: null,
      nationality: null,
      occupation: null,
      education_level: null,
      email: apiPatient.email || null,
      phone_primary: apiPatient.phone || apiPatient.mobile || "",
      phone_secondary: apiPatient.mobile || null,
      phone_emergency: null,
      emergency_contact_name: null,
      emergency_contact_relationship: null,
      address_street: apiPatient.addressStreet || null,
      address_number: apiPatient.addressNumber || null,
      address_complement: apiPatient.addressComplement || null,
      address_neighborhood: apiPatient.addressNeighborhood || null,
      address_city: apiPatient.addressCity || null,
      address_state: apiPatient.addressState || null,
      address_zipcode: apiPatient.addressZipcode || null,
      address_country: "Brasil",
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
      clinical_observations: apiPatient.notes || null,
      oral_hygiene_quality: null,
      gum_condition: null,
      risk_score_medical: null,
      risk_score_surgical: null,
      risk_score_anesthetic: null,
      risk_score_overall: 0,
      risk_level: "baixo",
      total_debt: apiPatient.totalDebt || 0,
      total_paid: apiPatient.totalPaid || 0,
      payment_status: apiPatient.paymentStatus || "pendente",
      preferred_payment_method: null,
      lgpd_consent: null,
      lgpd_consent_date: null,
      image_usage_consent: null,
      treatment_consent: null,
      data_sharing_consent: null,
      status: apiPatient.status?.code || apiPatient.status || "ativo",
      first_appointment_date: null,
      last_appointment_date: null,
      total_appointments: 0,
      created_at: apiPatient.createdAt,
      updated_at: apiPatient.updatedAt || apiPatient.createdAt,
      created_by: apiPatient.createdBy || null,
      updated_by: apiPatient.updatedBy || null,
    };
  }

  /**
   * Converte Patient do Frontend Global para formato API
   */
  static toAPI(frontendPatient: Partial<GlobalPatient>): Partial<PatientAPI> {
    return {
      fullName: frontendPatient.full_name,
      cpf: frontendPatient.cpf || undefined,
      rg: frontendPatient.rg || undefined,
      birthDate: frontendPatient.birth_date || undefined,
      gender: frontendPatient.gender || undefined,
      phone: frontendPatient.phone_primary,
      mobile: frontendPatient.phone_secondary || undefined,
      email: frontendPatient.email || undefined,
      status: frontendPatient.status || "ativo",
      addressZipcode: frontendPatient.address_zipcode || undefined,
      addressStreet: frontendPatient.address_street || undefined,
      addressNumber: frontendPatient.address_number || undefined,
      addressComplement: frontendPatient.address_complement || undefined,
      addressNeighborhood: frontendPatient.address_neighborhood || undefined,
      addressCity: frontendPatient.address_city || undefined,
      addressState: frontendPatient.address_state || undefined,
      notes: frontendPatient.clinical_observations || undefined,
      clinicId: frontendPatient.clinic_id || undefined,
    };
  }

  /**
   * Converte lista de patients
   */
  static toFrontendList(apiPatients: PatientAPI[]): GlobalPatient[] {
    return apiPatients.map((patient) => this.toFrontend(patient));
  }
}
