/**
 * usePatientsAPI Hook
 * Hook compatível com tipos existentes do sistema que usa REST API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/apiClient';
import { PatientAdapter } from '@/lib/adapters/patientAdapter';
import { toast } from 'sonner';
import type { Patient } from '../types/patient.types';

export function usePatientsAPI() {
  const { clinicId } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<{ patients: any[] }>('/pacientes');
      
      // Converter dados da API para formato do sistema
      const transformedPatients: Patient[] = response.patients.map((apiPatient: any) => {
        const frontendPatient = PatientAdapter.toFrontend(apiPatient);
        
        // Mapear para o tipo Patient do sistema
        return {
          id: frontendPatient.id,
          prontuarioId: frontendPatient.id, // Usar o mesmo ID por enquanto
          nome: frontendPatient.full_name,
          cpf: frontendPatient.cpf,
          rg: '',
          dataNascimento: frontendPatient.birth_date,
          sexo: 'M' as const,
          telefone: frontendPatient.phone_primary,
          celular: frontendPatient.phone_primary,
          email: frontendPatient.email || '',
          endereco: {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
          },
          convenio: {
            temConvenio: false,
          },
          observacoes: '',
          status: frontendPatient.status as 'Ativo' | 'Inativo' | 'Pendente',
          createdAt: frontendPatient.created_at,
          updatedAt: frontendPatient.created_at,
        } as Patient;
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

  const addPatient = async (patientData: Omit<Patient, 'id' | 'prontuarioId' | 'createdAt' | 'updatedAt'>) => {
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

  const updatePatient = async (patientId: string, patientData: Partial<Patient>) => {
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
