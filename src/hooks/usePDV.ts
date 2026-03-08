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
      const data = await apiClient.get<CaixaMovimento | null>(
        '/pdv/caixa/aberto'
      );

      setCaixaAberto(data || null);
    } catch (error: any) {
      console.error('Error loading caixa:', error);
    }
  };

  const loadVendas = async () => {
    if (!clinicId || !caixaAberto) return;

    try {
      const data = await apiClient.get<PDVVenda[]>(
        `/pdv/caixa/${caixaAberto.id}/vendas`
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
      const data = await apiClient.post<CaixaMovimento>(
        '/pdv/caixa/abrir',
        {
          valor_inicial: valorInicial,
          observacoes,
        },
      );

      setCaixaAberto(data || null);
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
      await apiClient.post(
        `/pdv/caixa/${caixaAberto.id}/fechar`,
        {
          valor_final: valorFinal,
          observacoes,
        },
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
      const novaVenda = await apiClient.post<PDVVenda>(
        `/pdv/caixa/${caixaAberto.id}/vendas`,
        {
          ...venda,
          itens,
          pagamentos,
        },
      );

      if (!novaVenda) throw new Error('Failed to create venda');

      await loadVendas();
      sonnerToast.success(`Venda ${novaVenda.numero_venda} realizada com sucesso!`);
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
      await apiClient.post(
        `/pdv/vendas/${vendaId}/cancelar`,
        { motivo_cancelamento: motivo },
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
