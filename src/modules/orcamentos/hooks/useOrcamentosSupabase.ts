import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Orcamento, OrcamentoComplete, OrcamentoItem, OrcamentoPagamento } from '../types/orcamento.types';
import { toast } from 'sonner';

export function useOrcamentosSupabase() {
  const { selectedClinic } = useAuth();
  const [orcamentos, setOrcamentos] = useState<OrcamentoComplete[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar orçamentos
  const loadOrcamentos = async () => {
    if (!selectedClinic) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          orcamento_itens(*),
          orcamento_pagamento(*)
        `)
        .eq('clinic_id', selectedClinic.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map(orc => ({
        ...orc,
        itens: orc.orcamento_itens || [],
        pagamento: orc.orcamento_pagamento?.[0],
      }));
      
      setOrcamentos(formatted as any);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  // Criar orçamento
  const createOrcamento = async (orcamento: Partial<Orcamento>, itens: OrcamentoItem[], pagamento?: OrcamentoPagamento) => {
    if (!selectedClinic) return null;

    try {
      // Gerar número do orçamento
      const numero = `ORC-${Date.now()}`;
      
      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from('orcamentos')
        .insert({
          ...orcamento,
          clinic_id: selectedClinic.id,
          numero_orcamento: numero,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .select()
        .single();

      if (orcamentoError) throw orcamentoError;

      // Inserir itens
      if (itens.length > 0) {
        const { error: itensError } = await supabase
          .from('orcamento_itens')
          .insert(itens.map(item => ({
            ...item,
            orcamento_id: orcamentoData.id,
          })) as any);

        if (itensError) throw itensError;
      }

      // Inserir condições de pagamento
      if (pagamento) {
        const { error: pagamentoError } = await supabase
          .from('orcamento_pagamento')
          .insert({
            ...pagamento,
            orcamento_id: orcamentoData.id,
          } as any);

        if (pagamentoError) throw pagamentoError;
      }

      await loadOrcamentos();
      toast.success('Orçamento criado com sucesso!');
      return orcamentoData;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast.error('Erro ao criar orçamento');
      return null;
    }
  };

  // Atualizar orçamento
  const updateOrcamento = async (id: string, updates: Partial<Orcamento>) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadOrcamentos();
      toast.success('Orçamento atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento');
      return false;
    }
  };

  // Enviar orçamento para paciente
  const sendOrcamento = async (id: string, email: string) => {
    try {
      // Atualizar status
      await updateOrcamento(id, { status: 'ENVIADO' });

      // TODO: Chamar Edge Function para enviar email
      // await supabase.functions.invoke('send-orcamento-email', {
      //   body: { orcamento_id: id, email }
      // });

      toast.success('Orçamento enviado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error);
      toast.error('Erro ao enviar orçamento');
      return false;
    }
  };

  // Aprovar orçamento
  const approveOrcamento = async (id: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('orcamentos')
        .update({
          status: 'APROVADO',
          aprovado_em: new Date().toISOString(),
          aprovado_por: user.user?.id,
        })
        .eq('id', id);

      if (error) throw error;

      await loadOrcamentos();
      toast.success('Orçamento aprovado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error);
      toast.error('Erro ao aprovar orçamento');
      return false;
    }
  };

  // Converter orçamento em plano de tratamento
  const convertToTreatmentPlan = async (id: string) => {
    try {
      // Buscar orçamento completo
      const { data: orcamento, error: orcError } = await supabase
        .from('orcamentos')
        .select('*, orcamento_itens(*)')
        .eq('id', id)
        .single();

      if (orcError) throw orcError;

      // Criar tratamentos no PEP
      // TODO: Implementar criação de tratamentos baseado nos itens

      // Atualizar status do orçamento
      const { error: updateError } = await supabase
        .from('orcamentos')
        .update({
          status: 'CONVERTIDO',
          convertido_em: new Date().toISOString(),
        } as any)
        .eq('id', id);

      if (updateError) throw updateError;

      await loadOrcamentos();

      toast.success('Orçamento convertido em plano de tratamento!');
      return true;
    } catch (error) {
      console.error('Erro ao converter orçamento:', error);
      toast.error('Erro ao converter orçamento');
      return false;
    }
  };

  // Deletar orçamento
  const deleteOrcamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadOrcamentos();
      toast.success('Orçamento excluído com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      toast.error('Erro ao deletar orçamento');
      return false;
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    loadOrcamentos();

    // Subscrever a mudanças em tempo real
    const channel = supabase
      .channel('orcamentos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orcamentos', filter: `clinic_id=eq.${selectedClinic}` }, () => {
        loadOrcamentos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic]);

  return {
    orcamentos,
    loading,
    createOrcamento,
    updateOrcamento,
    sendOrcamento,
    approveOrcamento,
    convertToTreatmentPlan,
    deleteOrcamento,
    refreshOrcamentos: loadOrcamentos,
  };
}
