/**
 * usePatients Hooks
 * Gerencia operações de pacientes através da REST API
 */

import type { Patient } from "@/types/patient";
import { usePatientsAPI } from "./usePatientsAPI";

export interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  addPatient: (patientData: Partial<Patient>) => Promise<void>;
  updatePatient: (
    patientId: string,
    patientData: Partial<Patient>,
  ) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  getPatient: (patientId: string) => Patient | undefined;
  reloadPatients: () => Promise<void>;
}

export function usePatientsUnified(): UsePatientsReturn {
  return usePatientsAPI();
}

export { usePatientsUnified as usePatients };
