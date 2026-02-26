import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AnaliseComplete } from '../types/radiografia.types';

export const useRadiografiaSupabase = () => {
  const [analises, setAnalises] = useState<AnaliseComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (!profile?.clinic_id) {
        throw new Error('Clínica não encontrada');
      }

      const { data: analisesData, error } = await supabase
        .from('analises_radiograficas')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar dados dos pacientes separadamente
      const patientIds = [...new Set(analisesData?.map(a => a.patient_id).filter(Boolean))];
      
      let patientsMap: Record<string, any> = {};
      if (patientIds.length > 0) {
        const { data: patientsData } = await supabase
          .from('patients')
          .select('id, nome_completo')
          .in('id', patientIds);
        
        patientsMap = (patientsData || []).reduce((acc: any, patient: any) => {
          acc[patient.id] = patient;
          return acc;
        }, {});
      }

      const analisesFormatadas = analisesData?.map((analise: any) => ({
        ...analise,
        patient_name: patientsMap[analise.patient_id]?.nome_completo || 'Paciente não identificado',
        problemas: analise.resultado_ia?.problemas_detectados || []
      })) || [];

      setAnalises(analisesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast({
        title: 'Erro ao carregar análises',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadRadiografia = async (
    patientId: string,
    prontuarioId: string | undefined,
    tipoRadiografia: string,
    file: File
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (!profile?.clinic_id) throw new Error('Clínica não encontrada');

      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.clinic_id}/${patientId}/${Date.now()}.${fileExt}`;
      const filePath = `radiografias/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pep-anexos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pep-anexos')
        .getPublicUrl(filePath);

      // Criar registro de análise
      const { data: analise, error: insertError } = await supabase
        .from('analises_radiograficas')
        .insert({
          clinic_id: profile.clinic_id,
          patient_id: patientId,
          prontuario_id: prontuarioId,
          tipo_radiografia: tipoRadiografia,
          imagem_url: publicUrl,
          imagem_storage_path: filePath,
          status_analise: 'PENDENTE'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Radiografia enviada',
        description: 'Iniciando análise com IA...'
      });

      // Chamar Edge Function para análise
      const { error: functionError } = await supabase.functions.invoke('analisar-radiografia', {
        body: {
          analise_id: analise.id,
          imagem_url: publicUrl
        }
      });

      if (functionError) {
        console.error('Erro ao iniciar análise:', functionError);
        toast({
          title: 'Erro na análise',
          description: 'A análise não pôde ser iniciada. Tente novamente.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Análise iniciada',
          description: 'A IA está analisando a radiografia. Isso pode levar alguns segundos.'
        });
      }

      await loadData();
      return analise;

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro ao fazer upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const marcarComoRevisado = async (analiseId: string, observacoes: string) => {
    try {
      const { error } = await supabase
        .from('analises_radiograficas')
        .update({
          revisado_por_dentista: true,
          observacoes_dentista: observacoes
        })
        .eq('id', analiseId);

      if (error) throw error;

      toast({
        title: 'Análise revisada',
        description: 'Observações do dentista salvas com sucesso'
      });

      await loadData();
    } catch (error) {
      console.error('Erro ao marcar como revisado:', error);
      toast({
        title: 'Erro ao salvar revisão',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadData();

    // Realtime subscriptions
    const channel = supabase
      .channel('analises_radiograficas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analises_radiograficas'
        },
        () => {
          console.log('Mudança detectada em analises_radiograficas, recarregando...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    analises,
    loading,
    uploadRadiografia,
    marcarComoRevisado,
    reloadData: loadData
  };
};
