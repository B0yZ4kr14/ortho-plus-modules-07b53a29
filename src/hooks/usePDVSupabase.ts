import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface CaixaMovimento {
  id: string
  clinic_id: string
  tipo: 'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'SUPRIMENTO'
  valor_informado: number
  valor_sistema: number
  diferenca: number
  observacoes?: string
  aberto_por?: string
  fechado_por?: string
  created_at: string
  created_by: string
}

export interface PDVVenda {
  id: string
  clinic_id: string
  caixa_id: string
  numero_venda: string
  patient_id?: string
  subtotal: number
  desconto: number
  valor_total: number
  status: 'ABERTA' | 'FINALIZADA' | 'CANCELADA'
  motivo_cancelamento?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface PDVVendaItem {
  id: string
  venda_id: string
  tipo_item: 'PRODUTO' | 'SERVICO' | 'PROCEDIMENTO'
  produto_id?: string
  procedimento_id?: string
  descricao: string
  quantidade: number
  valor_unitario: number
  desconto: number
  valor_total: number
  created_at: string
}

export interface PDVPagamento {
  id: string
  venda_id: string
  forma_pagamento: 'DINHEIRO' | 'CREDITO' | 'DEBITO' | 'PIX' | 'TRANSFERENCIA' | 'CRYPTO'
  valor: number
  parcelas?: number
  transacao_id?: string
  created_at: string
}

export const usePDVSupabase = (clinicId: string | undefined) => {
  const [caixaAberto, setCaixaAberto] = useState<CaixaMovimento | null>(null);
  const [vendas, setVendas] = useState<PDVVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCaixaAberto = async () => {
    if (!clinicId) return;

    try {
      const { data, error } = await supabase
        .from('caixa_movimentos')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'ABERTO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCaixaAberto(data);
    } catch (error: any) {
      console.error('Error loading caixa:', error);
    }
  };

  const loadVendas = async () => {
    if (!clinicId || !caixaAberto) return;

    try {
      const { data, error } = await supabase
        .from('pdv_vendas')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('caixa_movimento_id', caixaAberto.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (error: any) {
      console.error('Error loading vendas:', error);
    }
  };

  useEffect(() => {
    if (clinicId) {
      setLoading(true);
      Promise.all([loadCaixaAberto(), loadVendas()]).finally(() => setLoading(false));
    }
  }, [clinicId, caixaAberto?.id]);

  const abrirCaixa = async (valorInicial: number, observacoes?: string) => {
    if (!clinicId) throw new Error('Clinic ID required');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('caixa_movimentos')
        .insert({
          clinic_id: clinicId,
          user_id: user.id,
          tipo: 'ABERTURA',
          valor_inicial: valorInicial,
          observacoes,
          status: 'ABERTO',
        })
        .select()
        .single();

      if (error) throw error;

      setCaixaAberto(data);
      sonnerToast.success('Caixa aberto com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Error opening caixa:', error);
      toast({
        title: 'Erro ao abrir caixa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const fecharCaixa = async (valorFinal: number, observacoes?: string) => {
    if (!caixaAberto) throw new Error('No caixa open');

    try {
      // Calcular valor esperado baseado nas vendas
      const { data: pagamentos, error: pagError } = await supabase
        .from('pdv_pagamentos')
        .select('valor_liquido')
        .eq('caixa_movimento_id', caixaAberto.id);

      if (pagError) throw pagError;

      const valorEsperado = caixaAberto.valor_inicial + 
        (pagamentos?.reduce((sum, p) => sum + p.valor_liquido, 0) || 0);

      const diferenca = valorFinal - valorEsperado;

      const { error } = await supabase
        .from('caixa_movimentos')
        .update({
          valor_final: valorFinal,
          valor_esperado: valorEsperado,
          diferenca,
          observacoes,
          fechado_em: new Date().toISOString(),
          status: 'FECHADO',
        })
        .eq('id', caixaAberto.id);

      if (error) throw error;

      setCaixaAberto(null);
      sonnerToast.success('Caixa fechado com sucesso!');
    } catch (error: any) {
      console.error('Error closing caixa:', error);
      toast({
        title: 'Erro ao fechar caixa',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const criarVenda = async (venda: Partial<PDVVenda>, itens: any[], pagamentos: Partial<PDVPagamento>[]) => {
    if (!clinicId || !caixaAberto) throw new Error('Caixa must be open');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Gerar número da venda
      const { count } = await supabase
        .from('pdv_vendas')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);

      const numeroVenda = `PDV-${String((count || 0) + 1).padStart(6, '0')}`;

      // Criar venda
      const { data: vendaData, error: vendaError } = await supabase
        .from('pdv_vendas')
        .insert({
          clinic_id: clinicId,
          caixa_movimento_id: caixaAberto.id,
          vendedor_id: user.id,
          numero_venda: numeroVenda,
          ...venda,
        })
        .select()
        .single();

      if (vendaError) throw vendaError;

      // Criar itens
      if (itens.length > 0) {
        const { error: itensError } = await supabase
          .from('pdv_venda_itens')
          .insert(itens.map(item => ({
            venda_id: vendaData.id,
            ...item,
          })));

        if (itensError) throw itensError;
      }

      // Criar pagamentos
      if (pagamentos.length > 0) {
        const { error: pagError } = await supabase
          .from('pdv_pagamentos')
          .insert(pagamentos.map(pag => ({
            clinic_id: clinicId,
            venda_id: vendaData.id,
            caixa_movimento_id: caixaAberto.id,
            ...pag,
          })));

        if (pagError) throw pagError;
      }

      await loadVendas();
      sonnerToast.success(`Venda ${numeroVenda} realizada com sucesso!`);
      return vendaData;
    } catch (error: any) {
      console.error('Error creating venda:', error);
      toast({
        title: 'Erro ao criar venda',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelarVenda = async (vendaId: string, motivo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pdv_vendas')
        .update({
          status: 'CANCELADO',
          cancelado_em: new Date().toISOString(),
          cancelado_por: user.id,
          motivo_cancelamento: motivo,
        })
        .eq('id', vendaId);

      if (error) throw error;

      await loadVendas();
      sonnerToast.success('Venda cancelada');
    } catch (error: any) {
      console.error('Error canceling venda:', error);
      toast({
        title: 'Erro ao cancelar venda',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    caixaAberto,
    vendas,
    loading,
    abrirCaixa,
    fecharCaixa,
    criarVenda,
    cancelarVenda,
    reload: () => Promise.all([loadCaixaAberto(), loadVendas()]),
  };
};