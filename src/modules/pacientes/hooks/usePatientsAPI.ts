/**
 * usePatientsAPI Hook
 * Hook compatível com tipos existentes do sistema que usa REST API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/apiClient';
import { PatientAdapter } from '@/lib/adapters/patientAdapter';
import { toast } from 'sonner';
import type { Patient as ModulePatient } from '../types/patient.types';
import type { Patient as GlobalPatient } from '@/types/patient';

export function usePatientsAPI() {
  const { clinicId } = useAuth();
  const [patients, setPatients] = useState<GlobalPatient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<{ patients: any[] }>('/pacientes');
      
      // Converter dados da API para formato global do sistema
      const transformedPatients: GlobalPatient[] = response.patients.map((apiPatient: any) => {
        const frontendPatient = PatientAdapter.toFrontend(apiPatient);
        
        // Mapear para o tipo GlobalPatient esperado pelo sistema
        return {
          ...frontendPatient,
          // Garantir todos os campos do tipo GlobalPatient
          patient_code: frontendPatient.patient_code || `PAC-${frontendPatient.id.slice(0, 8)}`,
          full_name: frontendPatient.full_name,
          phone_primary: frontendPatient.phone_primary,
          birth_date: frontendPatient.birth_date,
          status: frontendPatient.status,
          created_at: frontendPatient.created_at,
        } as GlobalPatient;
      });

      setPatients(transformedPatients);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const addPatient = async (patientData: Omit<ModulePatient, 'id' | 'prontuarioId' | 'createdAt' | 'updatedAt'>) => {
    if (!clinicId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      await apiClient.post('/pacientes', {
        nome: patientData.nome,
        cpf: patientData.cpf,
        dataNascimento: patientData.dataNascimento,
        telefone: patientData.telefone,
        email: patientData.email,
        endereco: patientData.endereco,
      });

      toast.success('Paciente cadastrado com sucesso!');
      await loadPatients();
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast.error('Erro ao cadastrar paciente: ' + error.message);
      throw error;
    }
  };

  const updatePatient = async (patientId: string, patientData: Partial<ModulePatient>) => {
    try {
      await apiClient.patch(`/pacientes/${patientId}/status`, {
        newStatus: patientData.status,
      });

      toast.success('Paciente atualizado com sucesso!');
      await loadPatients();
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar paciente: ' + error.message);
      throw error;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await apiClient.delete(`/pacientes/${patientId}`);
      toast.success('Paciente removido com sucesso!');
      await loadPatients();
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast.error('Erro ao remover paciente: ' + error.message);
      throw error;
    }
  };

  const getPatient = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    reloadPatients: loadPatients,
  };
}
