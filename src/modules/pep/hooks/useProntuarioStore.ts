import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Prontuario, HistoricoClinico, Tratamento } from '../types/pep.types';
import { toast } from 'sonner';

export function useProntuarioStore() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [selectedProntuario, setSelectedProntuario] = useState<Prontuario | null>(null);
  const [historico, setHistorico] = useState<HistoricoClinico[]>([]);
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProntuarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProntuarios(data || []);
    } catch (error: any) {
      console.error('Error fetching prontuarios:', error);
      toast.error('Erro ao carregar prontuários');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProntuarioDetails = useCallback(async (prontuarioId: string) => {
    setLoading(true);
    try {
      // Fetch prontuario
      const { data: prontuarioData, error: prontuarioError } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('id', prontuarioId)
        .single();

      if (prontuarioError) throw prontuarioError;
      setSelectedProntuario(prontuarioData);

      // Fetch historico
      const { data: historicoData, error: historicoError } = await supabase
        .from('historico_clinico')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .order('created_at', { ascending: false });

      if (historicoError) throw historicoError;
      setHistorico(historicoData as HistoricoClinico[] || []);

      // Fetch tratamentos
      const { data: tratamentosData, error: tratamentosError } = await supabase
        .from('pep_tratamentos')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .order('data_inicio', { ascending: false });

      if (tratamentosError) throw tratamentosError;
      setTratamentos(tratamentosData as Tratamento[] || []);
    } catch (error: any) {
      console.error('Error fetching prontuario details:', error);
      toast.error('Erro ao carregar detalhes do prontuário');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProntuario = useCallback(async (patientId: string, patientName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (!profile?.clinic_id) throw new Error('Clinic not found');

      const { data, error } = await supabase
        .from('prontuarios')
        .insert({
          patient_id: patientId,
          patient_name: patientName,
          clinic_id: profile.clinic_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Prontuário criado com sucesso!');
      await fetchProntuarios();
      return data;
    } catch (error: any) {
      console.error('Error creating prontuario:', error);
      toast.error('Erro ao criar prontuário');
      throw error;
    }
  }, [fetchProntuarios]);

  const addHistorico = useCallback(async (
    prontuarioId: string,
    tipo: string,
    titulo: string,
    descricao: string,
    dadosEstruturados?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('historico_clinico')
        .insert({
          prontuario_id: prontuarioId,
          tipo,
          titulo,
          descricao,
          dados_estruturados: dadosEstruturados,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Registro adicionado ao histórico!');
      await fetchProntuarioDetails(prontuarioId);
      return data;
    } catch (error: any) {
      console.error('Error adding historico:', error);
      toast.error('Erro ao adicionar registro');
      throw error;
    }
  }, [fetchProntuarioDetails]);

  const addTratamento = useCallback(async (tratamento: Omit<Tratamento, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pep_tratamentos')
        .insert([{
          prontuario_id: tratamento.prontuario_id,
          titulo: tratamento.titulo,
          descricao: tratamento.descricao,
          dente_codigo: tratamento.dente_codigo,
          procedimento_id: tratamento.procedimento_id,
          status: tratamento.status,
          data_inicio: tratamento.data_inicio,
          data_conclusao: tratamento.data_conclusao,
          valor_estimado: tratamento.valor_estimado,
          observacoes: tratamento.observacoes,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Tratamento adicionado com sucesso!');
      await fetchProntuarioDetails(tratamento.prontuario_id);
      return data;
    } catch (error: any) {
      console.error('Error adding tratamento:', error);
      toast.error('Erro ao adicionar tratamento');
      throw error;
    }
  }, [fetchProntuarioDetails]);

  useEffect(() => {
    fetchProntuarios();
  }, [fetchProntuarios]);

  return {
    prontuarios,
    selectedProntuario,
    historico,
    tratamentos,
    loading,
    fetchProntuarios,
    fetchProntuarioDetails,
    createProntuario,
    addHistorico,
    addTratamento,
    setSelectedProntuario,
  };
}
