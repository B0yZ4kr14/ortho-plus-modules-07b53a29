/**
 * usePatientsUnified Hook
 * Hook unificado que alterna entre Supabase e REST API automaticamente
 * Mantém compatibilidade total com código existente
 */

import { useDataSource } from '@/lib/providers/DataSourceProvider';
import { usePatientsSupabase } from './usePatientsSupabase';
import { usePatientsAPI } from './usePatientsAPI';
import type { Patient } from '@/types/patient';

// Interface de retorno explícita para garantir type safety
export interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  addPatient: (patientData: Partial<Patient>) => Promise<void>;
  updatePatient: (patientId: string, patientData: Partial<Patient>) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  getPatient: (patientId: string) => Patient | undefined;
  reloadPatients: () => Promise<void>;
}

export function usePatientsUnified(): UsePatientsReturn {
  const { useRESTAPI } = useDataSource();
  
  // Alternar entre implementações de forma transparente
  const supabaseHook = usePatientsSupabase();
  const apiHook = usePatientsAPI();
  
  // Retornar implementação baseada na configuração
  return useRESTAPI ? apiHook : supabaseHook;
}

// Export como default para facilitar migração
export { usePatientsUnified as usePatients };
