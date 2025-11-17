/**
 * Patient Data Adapter
 * Converte entre formato API (snake_case) e Frontend (camelCase)
 */

interface PatientAPI {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email?: string;
  status: string;
  createdAt: string;
}

interface PatientFrontend {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone_primary: string;
  email?: string;
  status: string;
  created_at: string;
  patient_code?: string;
  risk_level?: string;
  risk_score_overall?: number;
  last_appointment_date?: string;
  main_complaint?: string;
  total_appointments?: number;
}

export class PatientAdapter {
  /**
   * Converte Patient da API para formato Frontend
   */
  static toFrontend(apiPatient: PatientAPI): PatientFrontend {
    return {
      id: apiPatient.id,
      full_name: apiPatient.nome,
      cpf: apiPatient.cpf,
      birth_date: apiPatient.dataNascimento,
      phone_primary: apiPatient.telefone,
      email: apiPatient.email,
      status: apiPatient.status,
      created_at: apiPatient.createdAt,
      patient_code: `PAC-${apiPatient.id.slice(0, 8).toUpperCase()}`,
      risk_level: 'baixo',
      risk_score_overall: 0,
      last_appointment_date: null,
      main_complaint: null,
      total_appointments: 0,
    };
  }

  /**
   * Converte Patient do Frontend para formato API
   */
  static toAPI(frontendPatient: Partial<PatientFrontend>): Partial<PatientAPI> {
    return {
      nome: frontendPatient.full_name,
      cpf: frontendPatient.cpf,
      dataNascimento: frontendPatient.birth_date,
      telefone: frontendPatient.phone_primary,
      email: frontendPatient.email,
      status: frontendPatient.status,
    };
  }

  /**
   * Converte lista de patients
   */
  static toFrontendList(apiPatients: PatientAPI[]): PatientFrontend[] {
    return apiPatients.map(patient => this.toFrontend(patient));
  }
}
