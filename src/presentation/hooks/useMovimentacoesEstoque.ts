import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/infrastructure/di';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import type {
  RegistrarEntradaUseCase,
  RegistrarEntradaInput,
  RegistrarSaidaUseCase,
  RegistrarSaidaInput,
  AjustarEstoqueUseCase,
  AjustarEstoqueInput,
  GetMovimentacoesByProdutoUseCase,
} from '@/application/use-cases/estoque';
import { MovimentacaoEstoque } from '@/domain/entities/MovimentacaoEstoque';
import { toast } from 'sonner';

const QUERY_KEY = 'movimentacoes-estoque';

/**
 * Hook customizado para gerenciar movimentações de estoque
 * 
 * Funcionalidades:
 * - Registrar entrada de estoque
 * - Registrar saída de estoque
 * - Ajustar estoque (correção)
 * - Buscar histórico de movimentações
 * - Filtrar por período
 * - Relatórios de movimentação
 */
export function useMovimentacoesEstoque(produtoId?: string) {
  const queryClient = useQueryClient();

  // Resolver Use Cases do DI Container
  const registrarEntradaUseCase = useService<RegistrarEntradaUseCase>(SERVICE_KEYS.REGISTRAR_ENTRADA_USE_CASE);
  const registrarSaidaUseCase = useService<RegistrarSaidaUseCase>(SERVICE_KEYS.REGISTRAR_SAIDA_USE_CASE);
  const ajustarEstoqueUseCase = useService<AjustarEstoqueUseCase>(SERVICE_KEYS.AJUSTAR_ESTOQUE_USE_CASE);
  const getMovimentacoesUseCase = useService<GetMovimentacoesByProdutoUseCase>(
    SERVICE_KEYS.GET_MOVIMENTACOES_BY_PRODUTO_USE_CASE
  );

  // Query: Buscar movimentações de um produto
  const { data: movimentacoes = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY, produtoId],
    queryFn: async () => {
      if (!produtoId) return [];
      const result = await getMovimentacoesUseCase.execute({ produtoId });
      return result.movimentacoes;
    },
    enabled: !!produtoId,
  });

  // Query: Buscar movimentações por período
  const useMovimentacoesPorPeriodo = (startDate?: Date, endDate?: Date) => {
    return useQuery({
      queryKey: [QUERY_KEY, produtoId, startDate, endDate],
      queryFn: async () => {
        if (!produtoId || !startDate || !endDate) return [];
        const result = await getMovimentacoesUseCase.execute({
          produtoId,
          startDate,
          endDate,
        });
        return result.movimentacoes;
      },
      enabled: !!produtoId && !!startDate && !!endDate,
    });
  };

  // Mutation: Registrar entrada
  const entradaMutation = useMutation({
    mutationFn: async (input: RegistrarEntradaInput) => {
      const result = await registrarEntradaUseCase.execute(input);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Entrada de estoque registrada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar entrada: ${error.message}`);
    },
  });

  // Mutation: Registrar saída
  const saidaMutation = useMutation({
    mutationFn: async (input: RegistrarSaidaInput) => {
      const result = await registrarSaidaUseCase.execute(input);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Saída de estoque registrada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar saída: ${error.message}`);
    },
  });

  // Mutation: Ajustar estoque
  const ajusteMutation = useMutation({
    mutationFn: async (input: AjustarEstoqueInput) => {
      const result = await ajustarEstoqueUseCase.execute(input);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Estoque ajustado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao ajustar estoque: ${error.message}`);
    },
  });

  // Helpers: Análises e Relatórios
  const movimentacoesPorTipo = (tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE') => {
    return movimentacoes.filter((m) => {
      if (tipo === 'ENTRADA') return m.isEntrada();
      if (tipo === 'SAIDA') return m.isSaida();
      if (tipo === 'AJUSTE') return m.isAjuste();
      return false;
    });
  };

  const totalEntradas = () => {
    return movimentacoes
      .filter((m) => m.isEntrada())
      .reduce((acc, m) => acc + m.quantidade, 0);
  };

  const totalSaidas = () => {
    return movimentacoes
      .filter((m) => m.isSaida())
      .reduce((acc, m) => acc + m.quantidade, 0);
  };

  const valorTotalMovimentado = () => {
    return movimentacoes.reduce((acc, m) => acc + m.valorTotal, 0);
  };

  const ultimasMovimentacoes = (limit: number = 10) => {
    return movimentacoes.slice(0, limit);
  };

  return {
    // Data
    movimentacoes,
    isLoading,
    error,

    // Queries
    useMovimentacoesPorPeriodo,

    // Mutations
    registrarEntrada: entradaMutation.mutateAsync,
    registrarSaida: saidaMutation.mutateAsync,
    ajustarEstoque: ajusteMutation.mutateAsync,
    isRegistrandoEntrada: entradaMutation.isPending,
    isRegistrandoSaida: saidaMutation.isPending,
    isAjustandoEstoque: ajusteMutation.isPending,

    // Helpers
    movimentacoesPorTipo,
    totalEntradas,
    totalSaidas,
    valorTotalMovimentado,
    ultimasMovimentacoes,
  };
}
