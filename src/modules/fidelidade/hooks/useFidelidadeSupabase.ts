import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useFidelidadeSupabase() {
  const { user, selectedClinic } = useAuth();
  const [config, setConfig] = useState<any>({});
  const [pontos, setPontos] = useState<any[]>([]);
  const [recompensas, setRecompensas] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [indicacoes, setIndicacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!selectedClinic) return;
    
    try {
      setLoading(true);
      
      // Load config
      const { data: configData } = await supabase
        .from('fidelidade_config')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .single();
      
      if (configData) setConfig(configData);

      // Load pontos
      const { data: pontosData } = await supabase
        .from('fidelidade_pontos')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('created_at', { ascending: false });
      
      if (pontosData) setPontos(pontosData);

      // Load recompensas
      const { data: recompensasData } = await supabase
        .from('fidelidade_recompensas')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('pontos_necessarios', { ascending: true });
      
      if (recompensasData) setRecompensas(recompensasData);

      // Load badges
      const { data: badgesData } = await supabase
        .from('fidelidade_badges')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('created_at', { ascending: false });
      
      if (badgesData) setBadges(badgesData);

      // Load indicacoes
      const { data: indicacoesData } = await supabase
        .from('fidelidade_indicacoes')
        .select('*')
        .eq('clinic_id', selectedClinic)
        .order('created_at', { ascending: false });
      
      if (indicacoesData) setIndicacoes(indicacoesData);

    } catch (error: any) {
      console.error('Erro ao carregar dados de fidelidade:', error);
      toast.error('Erro ao carregar dados de fidelidade');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup realtime subscriptions
    const channel = supabase
      .channel('fidelidade_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_config' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_pontos' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_recompensas' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_badges' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fidelidade_indicacoes' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic]);

  const createOrUpdateConfig = async (configData: any) => {
    if (!user || !selectedClinic) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Try to get existing config
      const { data: existing } = await supabase
        .from('fidelidade_config')
        .select('id')
        .eq('clinic_id', selectedClinic)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('fidelidade_config')
          .update(configData)
          .eq('clinic_id', selectedClinic);

        if (error) throw error;
        toast.success('Configuração atualizada com sucesso!');
      } else {
        // Create
        const { error } = await supabase
          .from('fidelidade_config')
          .insert([{ ...configData, clinic_id: selectedClinic }]);

        if (error) throw error;
        toast.success('Configuração criada com sucesso!');
      }

      await loadData();
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const createRecompensa = async (recompensaData: any) => {
    if (!user || !selectedClinic) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('fidelidade_recompensas')
        .insert([{ ...recompensaData, clinic_id: selectedClinic }]);

      if (error) throw error;
      toast.success('Recompensa criada com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao criar recompensa:', error);
      toast.error('Erro ao criar recompensa');
    }
  };

  const updateRecompensa = async (id: string, recompensaData: any) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('fidelidade_recompensas')
        .update(recompensaData)
        .eq('id', id)
        .eq('clinic_id', selectedClinic);

      if (error) throw error;
      toast.success('Recompensa atualizada com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar recompensa:', error);
      toast.error('Erro ao atualizar recompensa');
    }
  };

  const deleteRecompensa = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('fidelidade_recompensas')
        .delete()
        .eq('id', id)
        .eq('clinic_id', selectedClinic);

      if (error) throw error;
      toast.success('Recompensa excluída com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao excluir recompensa:', error);
      toast.error('Erro ao excluir recompensa');
    }
  };

  const createBadge = async (badgeData: any) => {
    if (!user || !selectedClinic) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('fidelidade_badges')
        .insert([{ ...badgeData, clinic_id: selectedClinic }]);

      if (error) throw error;
      toast.success('Badge criada com sucesso!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao criar badge:', error);
      toast.error('Erro ao criar badge');
    }
  };

  return {
    config,
    pontos,
    recompensas,
    badges,
    indicacoes,
    loading,
    createOrUpdateConfig,
    createRecompensa,
    updateRecompensa,
    deleteRecompensa,
    createBadge,
    loadData
  };
}
