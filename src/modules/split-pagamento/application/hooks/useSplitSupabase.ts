// @ts-nocheck - Aguardando regeneração automática de tipos do Supabase
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useSplitSupabase() {
  const { user, selectedClinic } = useAuth();
  const [configs, setConfigs] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [comissoes, setComissoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!selectedClinic) return;
    
    try {
      setLoading(true);
      
      // Load configs
      const { data: configsData } = await supabase
        .from('split_config')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('created_at', { ascending: false });
      
      if (configsData) setConfigs(configsData);

      // Load transacoes
      const { data: transacoesData } = await supabase
        .from('split_transacoes')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('created_at', { ascending: false });
      
      if (transacoesData) setTransacoes(transacoesData);

      // Load comissoes
      const { data: comissoesData } = await supabase
        .from('split_comissoes')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('mes_referencia', { ascending: false });
      
      if (comissoesData) setComissoes(comissoesData);

    } catch (error: any) {
      console.error('Erro ao carregar dados de split:', error);
      toast.error('Erro ao carregar dados de split');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup realtime subscriptions
    const channel = supabase
      .channel('split_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_config' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_transacoes' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'split_comissoes' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic]);

  const createConfig = async (configData: any) => {
    if (!user || !selectedClinic) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('split_config')
        .insert([{ 
          ...configData, 
          clinic_id: selectedClinic,
          created_by: user.id 
        }]);

      if (error) throw error;
      toast.success('Configuração de split criada com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao criar configuração:', error);
      toast.error('Erro ao criar configuração de split');
    }
  };

  const updateConfig = async (id: string, configData: any) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('split_config')
        .update(configData)
        .eq('id', id)
        .eq('clinic_id', selectedClinic);

      if (error) throw error;
      toast.success('Configuração de split atualizada com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração de split');
    }
  };

  const deleteConfig = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('split_config')
        .delete()
        .eq('id', id)
        .eq('clinic_id', selectedClinic);

      if (error) throw error;
      toast.success('Configuração de split excluída com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao excluir configuração:', error);
      toast.error('Erro ao excluir configuração de split');
    }
  };

  return {
    configs,
    transacoes,
    comissoes,
    loading,
    createConfig,
    updateConfig,
    deleteConfig,
    loadData
  };
}
