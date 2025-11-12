import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Contrato, ContratoComplete, ContratoTemplate } from '../types/contrato.types';
import { toast } from 'sonner';

export function useContratosSupabase() {
  const { selectedClinic } = useAuth();
  const [contratos, setContratos] = useState<ContratoComplete[]>([]);
  const [templates, setTemplates] = useState<ContratoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar contratos
  const loadContratos = async () => {
    if (!selectedClinic) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('clinic_id', selectedClinic.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContratos(data as ContratoComplete[]);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar templates
  const loadTemplates = async () => {
    if (!selectedClinic) return;
    
    try {
      const { data, error } = await supabase
        .from('contrato_templates')
        .select('*')
        .eq('clinic_id', selectedClinic.id)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setTemplates(data as ContratoTemplate[]);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    }
  };

  // Criar contrato
  const createContrato = async (contrato: Partial<Contrato>) => {
    if (!selectedClinic) return null;

    try {
      // Gerar número do contrato
      const numero = `CTR-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('contratos')
        .insert({
          ...contrato,
          clinic_id: selectedClinic.id,
          numero_contrato: numero,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      await loadContratos();
      toast.success('Contrato criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast.error('Erro ao criar contrato');
      return null;
    }
  };

  // Criar contrato a partir de template
  const createFromTemplate = async (templateId: string, patientId: string, orcamentoId?: string) => {
    try {
      // Buscar template
      const { data: template, error: templateError } = await supabase
        .from('contrato_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // TODO: Substituir variáveis do template com dados reais
      const conteudoProcessado = template.conteudo_html;

      return await createContrato({
        patient_id: patientId,
        template_id: templateId,
        orcamento_id: orcamentoId,
        titulo: template.nome,
        conteudo_html: conteudoProcessado,
        valor_contrato: 0, // TODO: Buscar valor do orçamento
        data_inicio: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Erro ao criar contrato do template:', error);
      toast.error('Erro ao criar contrato do template');
      return null;
    }
  };

  // Atualizar contrato
  const updateContrato = async (id: string, updates: Partial<Contrato>) => {
    try {
      const { error } = await supabase
        .from('contratos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadContratos();
      toast.success('Contrato atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      toast.error('Erro ao atualizar contrato');
      return false;
    }
  };

  // Assinar contrato
  const signContrato = async (id: string, assinaturaPaciente: string, assinaturaDentista: string) => {
    try {
      const { error } = await supabase
        .from('contratos')
        .update({
          status: 'ASSINADO',
          assinado_em: new Date().toISOString(),
          assinatura_paciente_base64: assinaturaPaciente,
          assinatura_dentista_base64: assinaturaDentista,
        })
        .eq('id', id);

      if (error) throw error;

      await loadContratos();
      toast.success('Contrato assinado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao assinar contrato:', error);
      toast.error('Erro ao assinar contrato');
      return false;
    }
  };

  // Cancelar contrato
  const cancelContrato = async (id: string, motivo: string) => {
    try {
      const { error } = await supabase
        .from('contratos')
        .update({
          status: 'CANCELADO',
          cancelado_em: new Date().toISOString(),
          motivo_cancelamento: motivo,
        })
        .eq('id', id);

      if (error) throw error;

      await loadContratos();
      toast.success('Contrato cancelado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao cancelar contrato:', error);
      toast.error('Erro ao cancelar contrato');
      return false;
    }
  };

  // Criar template
  const createTemplate = async (template: Partial<ContratoTemplate>) => {
    if (!selectedClinic) return null;

    try {
      const { data, error } = await supabase
        .from('contrato_templates')
        .insert({
          ...template,
          clinic_id: selectedClinic.id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      await loadTemplates();
      toast.success('Template criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      toast.error('Erro ao criar template');
      return null;
    }
  };

  // Atualizar template
  const updateTemplate = async (id: string, updates: Partial<ContratoTemplate>) => {
    try {
      const { error } = await supabase
        .from('contrato_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadTemplates();
      toast.success('Template atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      toast.error('Erro ao atualizar template');
      return false;
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    loadContratos();
    loadTemplates();

    // Subscrever a mudanças em tempo real
    const channel = supabase
      .channel('contratos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contratos', filter: `clinic_id=eq.${selectedClinic}` }, () => {
        loadContratos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedClinic]);

  return {
    contratos,
    templates,
    loading,
    createContrato,
    createFromTemplate,
    updateContrato,
    signContrato,
    cancelContrato,
    createTemplate,
    updateTemplate,
    refreshContratos: loadContratos,
    refreshTemplates: loadTemplates,
  };
}
