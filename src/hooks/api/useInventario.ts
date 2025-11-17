/**
 * useInventario Hook
 * Hook para gestão de inventário via REST API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Produto {
  id: string;
  nome: string;
  codigoBarras?: string;
  categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO';
  precoCompra: number;
  precoVenda: number;
  quantidadeMinima: number;
  quantidadeAtual: number;
  unidadeMedida: string;
  isActive: boolean;
}

interface CreateProdutoData {
  nome: string;
  codigoBarras?: string;
  categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO';
  precoCompra: number;
  precoVenda: number;
  quantidadeMinima: number;
  quantidadeAtual: number;
  unidadeMedida: string;
}

interface AjusteEstoqueData {
  quantidade: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  motivo: string;
}

export const useInventario = () => {
  const queryClient = useQueryClient();

  // Listar produtos
  const { data, isLoading, error } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      return await apiClient.get<{ produtos: Produto[] }>('/inventario/produtos');
    },
  });

  // Criar produto
  const createMutation = useMutation({
    mutationFn: async (produtoData: CreateProdutoData) => {
      return await apiClient.post('/inventario/produtos', produtoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto cadastrado com sucesso!');
    },
  });

  // Ajustar estoque
  const adjustStockMutation = useMutation({
    mutationFn: async ({ produtoId, data }: { produtoId: string; data: AjusteEstoqueData }) => {
      return await apiClient.patch(`/inventario/produtos/${produtoId}/estoque`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Estoque ajustado com sucesso!');
    },
  });

  // Produtos com estoque baixo
  const lowStockProducts = data?.produtos.filter(
    p => p.quantidadeAtual <= p.quantidadeMinima
  ) || [];

  return {
    produtos: data?.produtos || [],
    lowStockProducts,
    isLoading,
    error,
    createProduto: createMutation.mutate,
    isCreating: createMutation.isPending,
    adjustStock: adjustStockMutation.mutate,
    isAdjusting: adjustStockMutation.isPending,
  };
};
