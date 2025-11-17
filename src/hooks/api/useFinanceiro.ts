/**
 * useFinanceiro Hook
 * Hook para gestão financeira via REST API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  amount: number;
  description: string;
  categoryId?: string;
  dueDate: string;
  paidDate?: string;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
  paymentMethod?: string;
}

interface CreateTransactionData {
  type: 'RECEITA' | 'DESPESA';
  amount: number;
  description: string;
  categoryId?: string;
  dueDate: string;
  paymentMethod?: string;
}

interface CashFlowData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  period: {
    start: string;
    end: string;
  };
}

export const useFinanceiro = () => {
  const queryClient = useQueryClient();

  // Listar transações
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      return await apiClient.get<{ transactions: Transaction[] }>('/financeiro/transactions');
    },
  });

  // Criar transação
  const createMutation = useMutation({
    mutationFn: async (transactionData: CreateTransactionData) => {
      return await apiClient.post('/financeiro/transactions', transactionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow'] });
      toast.success('Transação criada com sucesso!');
    },
  });

  // Marcar como paga
  const payMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiClient.patch(`/financeiro/transactions/${transactionId}/pay`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow'] });
      toast.success('Transação marcada como paga!');
    },
  });

  // Obter fluxo de caixa
  const useCashFlow = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['cashflow', startDate, endDate],
      queryFn: async () => {
        return await apiClient.get<CashFlowData>(
          `/financeiro/cash-flow?startDate=${startDate}&endDate=${endDate}`
        );
      },
    });
  };

  // Transações pendentes
  const pendingTransactions = data?.transactions.filter(t => t.status === 'PENDENTE') || [];

  // Transações vencidas
  const overdueTransactions = data?.transactions.filter(t => t.status === 'VENCIDO') || [];

  return {
    transactions: data?.transactions || [],
    pendingTransactions,
    overdueTransactions,
    isLoading,
    error,
    createTransaction: createMutation.mutate,
    isCreating: createMutation.isPending,
    payTransaction: payMutation.mutate,
    isPaying: payMutation.isPending,
    useCashFlow,
  };
};
