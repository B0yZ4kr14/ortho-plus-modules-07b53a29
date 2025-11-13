// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TeleconsultaComplete, PrescricaoRemota, Triagem } from '../types/teleodontologia.types';

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

  const createTeleconsulta = async (data: Partial<Teleconsulta>) => {
    try {
      const { data: newTeleconsulta, error } = await supabase
        .from('teleconsultas')
        .insert([{ ...data, clinic_id: clinicId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Teleconsulta agendada',
        description: 'A teleconsulta foi agendada com sucesso.',
      });

      return newTeleconsulta;
    } catch (error: any) {
      console.error('Error creating teleconsulta:', error);
      toast({
        title: 'Erro ao agendar teleconsulta',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTeleconsulta = async (id: string, data: Partial<Teleconsulta>) => {
    try {
      const { error } = await supabase
        .from('teleconsultas')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Teleconsulta atualizada',
        description: 'Os dados foram atualizados com sucesso.',
      });
    } catch (error: any) {
      console.error('Error updating teleconsulta:', error);
      toast({
        title: 'Erro ao atualizar teleconsulta',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createPrescricao = async (data: Partial<PrescricaoRemota>) => {
    try {
      const { error } = await supabase
        .from('prescricoes_remotas')
        .insert([data]);

      if (error) throw error;

      toast({
        title: 'Prescrição criada',
        description: 'A prescrição foi criada com sucesso.',
      });
    } catch (error: any) {
      console.error('Error creating prescricao:', error);
      toast({
        title: 'Erro ao criar prescrição',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createTriagem = async (data: Partial<Triagem>) => {
    try {
      const { error } = await supabase
        .from('triagem_teleconsulta')
        .insert([data]);

      if (error) throw error;

      toast({
        title: 'Triagem registrada',
        description: 'A triagem foi registrada com sucesso.',
      });
    } catch (error: any) {
      console.error('Error creating triagem:', error);
      toast({
        title: 'Erro ao registrar triagem',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const iniciarConsulta = async (teleconsultaId: string) => {
    try {
      // Generate video token via Edge Function
      const { data, error } = await supabase.functions.invoke('generate-video-token', {
        body: { teleconsultaId },
      });

      if (error) throw error;

      // Update status to EM_ANDAMENTO
      await updateTeleconsulta(teleconsultaId, { status: 'EM_ANDAMENTO' });

      return {
        ...data,
        teleconsultaId, // Pass teleconsultaId for recording
      };
    } catch (error: any) {
      console.error('Error starting consultation:', error);
      toast({
        title: 'Erro ao iniciar consulta',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const finalizarConsulta = async (
    teleconsultaId: string,
    diagnostico: string,
    conduta: string,
    observacoes?: string
  ) => {
    try {
      await updateTeleconsulta(teleconsultaId, {
        status: 'CONCLUIDA',
        diagnostico,
        conduta,
        observacoes,
      });
    } catch (error: any) {
      console.error('Error finalizing consultation:', error);
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
    createPrescricao,
    createTriagem,
    iniciarConsulta,
    finalizarConsulta,
    reload: loadData,
  };
};
