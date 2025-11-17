import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Venda {
  id: string;
  clinic_id: string;
  valor_total: number;
  metodo_pagamento: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface CaixaMovimento {
  id: string;
  tipo: string;
  valor: number;
  status: string;
  aberto_em?: string;
  fechado_em?: string;
}

export const usePDV = () => {
  const queryClient = useQueryClient();

  const { data: vendas = [], isLoading: isLoadingVendas } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      return await apiClient.get<Venda[]>('/pdv/vendas');
    },
  });

  const { data: caixaAtual, isLoading: isLoadingCaixa } = useQuery({
    queryKey: ['caixa-atual'],
    queryFn: async () => {
      return await apiClient.get<CaixaMovimento>('/pdv/caixa/atual');
    },
  });

  const registrarVenda = useMutation({
    mutationFn: async (venda: {
      valor_total: number;
      metodo_pagamento: string;
      items: Array<{ produto_id: string; quantidade: number; valor_unitario: number }>;
    }) => {
      return await apiClient.post<Venda>('/pdv/vendas', venda);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-atual'] });
      toast.success('Venda registrada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao registrar venda');
    },
  });

  const abrirCaixa = useMutation({
    mutationFn: async (valorInicial: number) => {
      return await apiClient.post<CaixaMovimento>('/pdv/caixa/abrir', { valor_inicial: valorInicial });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-atual'] });
      toast.success('Caixa aberto com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao abrir caixa');
    },
  });

  const fecharCaixa = useMutation({
    mutationFn: async (valorFinal: number) => {
      return await apiClient.post<CaixaMovimento>('/pdv/caixa/fechar', { valor_final: valorFinal });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-atual'] });
      toast.success('Caixa fechado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao fechar caixa');
    },
  });

  const realizarSangria = useMutation({
    mutationFn: async (data: { valor: number; motivo: string }) => {
      return await apiClient.post<CaixaMovimento>('/pdv/caixa/sangria', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-atual'] });
      toast.success('Sangria realizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao realizar sangria');
    },
  });

  return {
    vendas,
    isLoadingVendas,
    caixaAtual,
    isLoadingCaixa,
    registrarVenda: registrarVenda.mutate,
    abrirCaixa: abrirCaixa.mutate,
    fecharCaixa: fecharCaixa.mutate,
    realizarSangria: realizarSangria.mutate,
    isRegistrandoVenda: registrarVenda.isPending,
  };
};
