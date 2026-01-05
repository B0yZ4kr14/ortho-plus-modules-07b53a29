import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Patient } from '@/types/patient';
import type { UsePatientsReturn } from './usePatientsUnified';

/**
 * Hook para gerenciar pacientes via Supabase (Legacy)
 * Busca direto da tabela `patients` que está no formato global snake_case
 * @param enabled - Whether to enable data fetching (default: true)
 */
export function usePatientsSupabase(enabled: boolean = true): UsePatientsReturn {
  const { clinicId } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(enabled);

  const loadPatients = useCallback(async () => {
    if (!clinicId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients' as any)
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPatients((data || []) as unknown as Patient[]);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId, enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    loadPatients();

    // Setup realtime subscription
    if (!clinicId) return;

    const subscription = supabase
      .channel('patients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
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
  }, [clinicId, enabled, loadPatients]);

  const addPatient = async (patientData: Partial<Patient>) => {
    if (!clinicId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const { error } = await supabase
        .from('patients' as any)
        .insert([{
          ...patientData,
          clinic_id: clinicId,
        }]);

      if (error) throw error;

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
      const { error } = await supabase
        .from('patients' as any)
        .update(patientData)
        .eq('id', patientId);

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
        .from('patients' as any)
        .delete()
        .eq('id', patientId);

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
