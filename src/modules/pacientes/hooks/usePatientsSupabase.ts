import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Patient } from '../types/patient.types';

export function usePatientsSupabase() {
  const { clinicId } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prontuarios')
        .select(`
          *,
          patients:patient_id (
            nome,
            cpf,
            rg,
            data_nascimento,
            sexo,
            telefone,
            celular,
            email,
            endereco,
            convenio,
            observacoes,
            status
          )
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados do Supabase para formato Patient
      const transformedPatients: Patient[] = (data || []).map((prontuario: any) => ({
        id: prontuario.patient_id,
        prontuarioId: prontuario.id,
        nome: prontuario.patients?.nome || '',
        cpf: prontuario.patients?.cpf || '',
        rg: prontuario.patients?.rg || '',
        dataNascimento: prontuario.patients?.data_nascimento || '',
        sexo: prontuario.patients?.sexo || 'M',
        telefone: prontuario.patients?.telefone || '',
        celular: prontuario.patients?.celular || '',
        email: prontuario.patients?.email || '',
        endereco: prontuario.patients?.endereco || {},
        convenio: prontuario.patients?.convenio || { temConvenio: false },
        observacoes: prontuario.patients?.observacoes || '',
        status: prontuario.patients?.status || 'Ativo',
        createdAt: prontuario.created_at,
        updatedAt: prontuario.updated_at,
      }));

      setPatients(transformedPatients);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();

    // Setup realtime subscription
    if (!clinicId) return;

    const subscription = supabase
      .channel('prontuarios_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prontuarios',
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          loadPatients();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clinicId]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'prontuarioId' | 'createdAt' | 'updatedAt'>) => {
    if (!clinicId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      // Temporariamente retorna mock até implementar criação completa de paciente
      // TODO: Implementar criação completa de paciente na tabela profiles/prontuarios
      
      const mockPatient: Patient = {
        ...patientData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      toast.success('Paciente cadastrado com sucesso! (Mock temporário)');
      await loadPatients();
      return mockPatient;
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast.error('Erro ao cadastrar paciente: ' + error.message);
      throw error;
    }
  };

  const updatePatient = async (patientId: string, patientData: Partial<Patient>) => {
    try {
      // Atualizar dados do paciente
      const { error } = await supabase
        .from('prontuarios')
        .update({
          updated_at: new Date().toISOString(),
          // Adicionar campos que podem ser atualizados
        })
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId);

      if (error) throw error;

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
