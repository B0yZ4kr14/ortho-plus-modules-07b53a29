import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/infrastructure/di';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import type {
  CreateProdutoUseCase,
  CreateProdutoInput,
  UpdateProdutoUseCase,
  UpdateProdutoInput,
  GetProdutoByIdUseCase,
  ListProdutosByClinicUseCase,
} from '@/modules/estoque/application/use-cases';
import { Produto } from '@/domain/entities/Produto';
import { toast } from 'sonner';

const QUERY_KEY = 'produtos';

/**
 * Hook customizado para gerenciar produtos do estoque
 * 
 * Funcionalidades:
 * - Listar produtos (todos ou apenas ativos)
 * - Buscar produto por ID
 * - Criar novo produto
 * - Atualizar produto existente
 * - Filtrar por categoria
 * - Alertas de estoque baixo/zerado
 */
export function useProdutos(clinicId: string, apenasAtivos: boolean = false) {
  const queryClient = useQueryClient();

  // Resolver Use Cases do DI Container
  const createProdutoUseCase = useService<CreateProdutoUseCase>(SERVICE_KEYS.CREATE_PRODUTO_USE_CASE);
  const updateProdutoUseCase = useService<UpdateProdutoUseCase>(SERVICE_KEYS.UPDATE_PRODUTO_USE_CASE);
  const getProdutoByIdUseCase = useService<GetProdutoByIdUseCase>(SERVICE_KEYS.GET_PRODUTO_BY_ID_USE_CASE);
  const listProdutosUseCase = useService<ListProdutosByClinicUseCase>(SERVICE_KEYS.LIST_PRODUTOS_BY_CLINIC_USE_CASE);

  // Query: Listar produtos
  const { data: produtos = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY, clinicId, apenasAtivos],
    queryFn: async () => {
      const result = await listProdutosUseCase.execute({ clinicId, apenasAtivos });
      return result.produtos;
    },
    enabled: !!clinicId,
  });

  // Query: Buscar produto por ID
  const useProdutoById = (produtoId: string) => {
    return useQuery({
      queryKey: [QUERY_KEY, produtoId],
      queryFn: async () => {
        const result = await getProdutoByIdUseCase.execute({ produtoId });
        return result.produto;
      },
      enabled: !!produtoId,
    });
  };

  // Mutation: Criar produto
  const createMutation = useMutation({
    mutationFn: async (input: CreateProdutoInput) => {
      const result = await createProdutoUseCase.execute(input);
      return result.produto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Produto criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });

  // Mutation: Atualizar produto
  const updateMutation = useMutation({
    mutationFn: async (input: UpdateProdutoInput) => {
      const result = await updateProdutoUseCase.execute(input);
      return result.produto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Produto atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });

  // Helpers: Filtros e Alertas
  const produtosPorCategoria = (categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO') => {
    return produtos.filter((p) => p.categoria === categoria);
  };

  const produtosEstoqueBaixo = () => {
    return produtos.filter((p) => p.isEstoqueBaixo());
  };

  const produtosEstoqueZerado = () => {
    return produtos.filter((p) => p.isEstoqueZerado());
  };

  const totalProdutosAtivos = () => {
    return produtos.filter((p) => p.ativo).length;
  };

  const valorTotalEstoque = () => {
    return produtos.reduce((acc, p) => acc + p.calcularValorTotal(), 0);
  };

  return {
    // Data
    produtos,
    isLoading,
    error,

    // Queries
    useProdutoById,

    // Mutations
    createProduto: createMutation.mutateAsync,
    updateProduto: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,

    // Helpers
    produtosPorCategoria,
    produtosEstoqueBaixo,
    produtosEstoqueZerado,
    totalProdutosAtivos,
    valorTotalEstoque,
  };
}
