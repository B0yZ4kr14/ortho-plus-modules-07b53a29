// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TeleconsultaComplete, PrescricaoRemota, Triagem } from '../../domain/types/teleodontologia.types';

export const useTeleodontologiaSupabase = (clinicId: string) => {
  const [teleconsultas, setTeleconsultas] = useState<TeleconsultaComplete[]>([]);
  const [prescricoes, setPrescricoes] = useState<PrescricaoRemota[]>([]);
  const [triagens, setTriagens] = useState<Triagem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      
    // Buscar teleconsultas
    const { data: teleconsultasData, error: teleconsultasError } = await supabase
      .from('teleconsultas')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('data_agendada', { ascending: false });

    if (teleconsultasError) {
      console.error('Error loading teleconsultas:', teleconsultasError);
      throw teleconsultasError;
    }

    // Buscar informações de pacientes e dentistas separadamente
    if (teleconsultasData && teleconsultasData.length > 0) {
      const patientIds = [...new Set(teleconsultasData.map(t => t.patient_id))];
      const dentistIds = [...new Set(teleconsultasData.map(t => t.dentist_id))];

      const { data: patientsData } = await supabase
        .from('prontuarios')
        .select('patient_id, patient_name')
        .in('patient_id', patientIds);

      const { data: dentistsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', dentistIds);

      // Mapear dados para as teleconsultas
      const teleconsultasWithDetails = teleconsultasData.map(t => ({
        ...t,
        patient_name: patientsData?.find(p => p.patient_id === t.patient_id)?.patient_name,
        dentist_name: dentistsData?.find(d => d.id === t.dentist_id)?.full_name,
      }));

      setTeleconsultas(teleconsultasWithDetails);
    } else {
      setTeleconsultas([]);
    }

      // Load prescricoes
      const { data: prescricoesData, error: prescricoesError } = await supabase
        .from('prescricoes_remotas')
        .select('*')
        .order('created_at', { ascending: false });

      if (prescricoesError) throw prescricoesError;

      // Load triagens (nome correto da tabela é singular)
      const { data: triagensData, error: triagensError } = await supabase
        .from('triagem_teleconsulta')
        .select('*')
        .order('created_at', { ascending: false });

      if (triagensError) {
        console.error('[Teleodontologia] Error loading triagens:', triagensError);
        throw triagensError;
      }

      setPrescricoes(prescricoesData || []);
      setTriagens(triagensData || []);
    } catch (error: any) {
      console.error('Error loading teleodontologia data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      loadData();

      // Setup realtime subscriptions
      const teleconsultasChannel = supabase
        .channel('teleconsultas-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'teleconsultas',
            filter: `clinic_id=eq.${clinicId}`,
          },
          () => {
            console.log('Teleconsultas changed, reloading...');
            loadData();
          }
        )
        .subscribe();

      const prescricoesChannel = supabase
        .channel('prescricoes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'prescricoes_remotas',
          },
          () => {
            console.log('Prescricoes changed, reloading...');
            loadData();
          }
        )
        .subscribe();

      const triagensChannel = supabase
        .channel('triagens-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'triagem_teleconsulta',
          },
          () => {
            console.log('Triagens changed, reloading...');
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(teleconsultasChannel);
        supabase.removeChannel(prescricoesChannel);
        supabase.removeChannel(triagensChannel);
      };
    }
  }, [clinicId]);

  const createTeleconsulta = async (teleconsulta: any) => {
    try {
      const { data, error } = await supabase
        .from('teleconsultas')
        .insert([{ ...teleconsulta, clinic_id: clinicId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Teleconsulta criada com sucesso!',
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error creating teleconsulta:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar teleconsulta: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTeleconsulta = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('teleconsultas')
        .update(updates)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Teleconsulta atualizada com sucesso!',
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error updating teleconsulta:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar teleconsulta: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTeleconsulta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teleconsultas')
        .delete()
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Teleconsulta excluída com sucesso!',
      });

      await loadData();
    } catch (error: any) {
      console.error('Error deleting teleconsulta:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir teleconsulta: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createPrescricao = async (prescricao: any) => {
    try {
      const { data, error } = await supabase
        .from('prescricoes_remotas')
        .insert([prescricao])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Prescrição criada com sucesso!',
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error creating prescricao:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar prescrição: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createTriagem = async (triagem: any) => {
    try {
      const { data, error } = await supabase
        .from('triagem_teleconsulta')
        .insert([triagem])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Triagem criada com sucesso!',
      });

      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error creating triagem:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar triagem: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const iniciarConsulta = async (teleconsultaId: string) => {
    try {
      // Mock video room data for now
      return {
        token: 'mock-token',
        appId: 'mock-app-id',
        channelName: `teleconsulta-${teleconsultaId}`,
        uid: user?.id || 'anonymous',
        teleconsultaId,
      };
    } catch (error: any) {
      console.error('Error starting consultation:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao iniciar consulta: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    teleconsultas,
    prescricoes,
    triagens,
    loading,
    createTeleconsulta,
    updateTeleconsulta,
    deleteTeleconsulta,
    createPrescricao,
    createTriagem,
    iniciarConsulta,
    refresh: loadData
  };
};
