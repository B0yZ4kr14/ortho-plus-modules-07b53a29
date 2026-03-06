import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api/apiClient'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { toast as sonnerToast } from "sonner"

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
  valor_inicial: number
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

export const usePDV = (clinicId: string | undefined) => {
  const [caixaAberto, setCaixaAberto] = useState<CaixaMovimento | null>(null);
  const [vendas, setVendas] = useState<PDVVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadCaixaAberto = async () => {
    if (!clinicId) return;

    try {
      const data = await apiClient.get<CaixaMovimento[]>(
        `/rest/v1/caixa_movimentos?clinic_id=eq.${clinicId}&status=eq.ABERTO&order=created_at.desc&limit=1`
      );

      setCaixaAberto(data?.[0] || null);
    } catch (error: any) {
      console.error('Error loading caixa:', error);
    }
  };

  const loadVendas = async () => {
    if (!clinicId || !caixaAberto) return;

    try {
      const data = await apiClient.get<PDVVenda[]>(
        `/rest/v1/pdv_vendas?clinic_id=eq.${clinicId}&caixa_movimento_id=eq.${caixaAberto.id}&order=created_at.desc`
      );

      setVendas(data || []);
    } catch (error: any) {
      console.error('Error loading vendas:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCaixaAberto(), loadVendas()]);
      if (mounted) setLoading(false);
    };

    const pollData = async () => {
      if (!mounted) return;
      try {
        await Promise.all([loadCaixaAberto(), loadVendas()]);
      } catch (e) {}
      if (mounted) {
        timeoutId = setTimeout(pollData, 10000);
      }
    };

    if (clinicId) {
      loadData().then(() => {
        if (mounted) timeoutId = setTimeout(pollData, 10000);
      });
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [clinicId, caixaAberto?.id]);

  const abrirCaixa = async (valorInicial: number, observacoes?: string) => {
    if (!clinicId) throw new Error('Clinic ID required');
    if (!user) throw new Error('User not authenticated');

    try {
      const data = await apiClient.post<CaixaMovimento[]>(
        '/rest/v1/caixa_movimentos',
        {
          clinic_id: clinicId,
          user_id: user.id,
          tipo: 'ABERTURA',
          valor_inicial: valorInicial,
          observacoes,
          status: 'ABERTO',
        },
        { headers: { Prefer: 'return=representation' } }
      );

      const novoCaixa = data?.[0];
      setCaixaAberto(novoCaixa || null);
      sonnerToast.success('Caixa aberto com sucesso!');
      return novoCaixa;
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
      const pagamentos = await apiClient.get<any[]>(
        `/rest/v1/pdv_pagamentos?select=valor_liquido&caixa_movimento_id=eq.${caixaAberto.id}`
      );

      const valorEsperado = caixaAberto.valor_inicial + 
        (pagamentos?.reduce((sum, p) => sum + p.valor_liquido, 0) || 0);

      const diferenca = valorFinal - valorEsperado;

      await apiClient.patch(
        `/rest/v1/caixa_movimentos?id=eq.${caixaAberto.id}`,
        {
          valor_final: valorFinal,
          valor_esperado: valorEsperado,
          diferenca,
          observacoes,
          fechado_em: new Date().toISOString(),
          status: 'FECHADO',
        }
      );

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
    if (!user) throw new Error('User not authenticated');

    try {
      const allVendas = await apiClient.get<{id: string}[]>(
        `/rest/v1/pdv_vendas?select=id&clinic_id=eq.${clinicId}`
      );
      const count = allVendas?.length || 0;
      const numeroVenda = `PDV-${String(count + 1).padStart(6, '0')}`;

      const vendaData = await apiClient.post<any[]>(
        '/rest/v1/pdv_vendas',
        {
          clinic_id: clinicId,
          caixa_movimento_id: caixaAberto.id,
          vendedor_id: user.id,
          numero_venda: numeroVenda,
          ...venda,
        },
        { headers: { Prefer: 'return=representation' } }
      );

      const novaVenda = vendaData?.[0];
      if (!novaVenda) throw new Error('Failed to create venda');

      if (itens.length > 0) {
        await apiClient.post(
          '/rest/v1/pdv_venda_itens',
          itens.map(item => ({
            venda_id: novaVenda.id,
            ...item,
          }))
        );
      }

      if (pagamentos.length > 0) {
        await apiClient.post(
          '/rest/v1/pdv_pagamentos',
          pagamentos.map(pag => ({
            clinic_id: clinicId,
            venda_id: novaVenda.id,
            caixa_movimento_id: caixaAberto.id,
            ...pag,
          }))
        );
      }

      await loadVendas();
      sonnerToast.success(`Venda ${numeroVenda} realizada com sucesso!`);
      return novaVenda;
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
    if (!user) throw new Error('User not authenticated');

    try {
      await apiClient.patch(
        `/rest/v1/pdv_vendas?id=eq.${vendaId}`,
        {
          status: 'CANCELADO',
          cancelado_em: new Date().toISOString(),
          cancelado_por: user.id,
          motivo_cancelamento: motivo,
        }
      );

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
