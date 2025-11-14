import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { toast } from 'sonner';
import type { IItemOrcamentoRepository } from '@/domain/repositories/IItemOrcamentoRepository';
import type {
  AddItemOrcamentoUseCase,
  AddItemOrcamentoInput,
} from '@/application/use-cases/orcamentos';

/**
 * Hook para gerenciar Itens de Orçamento
 * 
 * Fornece:
 * - Listagem de itens por orçamento
 * - Adição de itens
 * - Recálculo automático de totais
 * - Invalidação de cache do orçamento
 */
export function useItensOrcamento(orcamentoId: string | null) {
  const queryClient = useQueryClient();

  // Repositories e Use Cases
  const itemRepository = container.resolve<IItemOrcamentoRepository>(SERVICE_KEYS.ITEM_ORCAMENTO_REPOSITORY);
  const addItemUseCase = container.resolve<AddItemOrcamentoUseCase>(SERVICE_KEYS.ADD_ITEM_ORCAMENTO_USE_CASE);

  // Query: Listar itens do orçamento
  const { data: itens = [], isLoading } = useQuery({
    queryKey: ['orcamento-itens', orcamentoId],
    queryFn: () => itemRepository.findByOrcamentoId(orcamentoId!),
    enabled: !!orcamentoId,
  });

  // Mutation: Adicionar item
  const addItemMutation = useMutation({
    mutationFn: async (input: AddItemOrcamentoInput) => {
      const { item } = await addItemUseCase.execute(input);
      return item;
    },
    onSuccess: (_, variables) => {
      // Invalidar cache dos itens
      queryClient.invalidateQueries({ queryKey: ['orcamento-itens', variables.orcamentoId] });
      
      // Invalidar cache do orçamento (valores foram recalculados)
      queryClient.invalidateQueries({ queryKey: ['orcamento', variables.orcamentoId] });
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      
      toast.success('Item adicionado ao orçamento!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    },
  });

  // Mutation: Remover item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await itemRepository.delete(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamento-itens', orcamentoId] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', orcamentoId] });
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Item removido do orçamento');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover item: ${error.message}`);
    },
  });

  // Calcular totais dos itens
  const totais = itens.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.getSubtotal(),
      descontoTotal: acc.descontoTotal + item.descontoValor,
      total: acc.total + item.valorTotal,
    }),
    { subtotal: 0, descontoTotal: 0, total: 0 }
  );

  return {
    // Data
    itens,
    totais,
    isLoading,

    // Actions
    addItem: addItemMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,

    // Loading states
    isAddingItem: addItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
  };
}
