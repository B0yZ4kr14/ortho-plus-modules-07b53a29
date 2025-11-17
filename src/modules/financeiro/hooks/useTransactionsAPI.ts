/**
 * useTransactionsAPI Hook
 * Hook para gestão de transações financeiras via REST API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/apiClient';
import { TransactionAdapter } from '@/lib/adapters/transactionAdapter';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'RECEITA' | 'DESPESA';
  category: string;
  description: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useTransactionsAPI() {
  const { clinicId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<{ transactions: any[] }>('/financeiro/transactions');
      
      // Converter dados da API para formato frontend
      const transformed = response.transactions.map((apiTx: any) => {
        const frontendTx = TransactionAdapter.toFrontend(apiTx);
        
        return {
          id: frontendTx.id,
          type: frontendTx.type as 'RECEITA' | 'DESPESA',
          category: frontendTx.category,
          description: frontendTx.description,
          amount: frontendTx.amount,
          dueDate: new Date(frontendTx.due_date),
          paymentDate: frontendTx.payment_date ? new Date(frontendTx.payment_date) : undefined,
          status: frontendTx.status as 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO',
          paymentMethod: frontendTx.payment_method,
          createdAt: new Date(frontendTx.created_at),
          updatedAt: new Date(frontendTx.updated_at),
        };
      });

      setTransactions(transformed);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast.error('Erro ao carregar transações: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const createTransaction = async (data: Partial<Transaction>) => {
    if (!clinicId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      await apiClient.post('/financeiro/transactions', {
        clinicId,
        type: data.type,
        category: data.category,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate?.toISOString(),
        status: data.status || 'PENDENTE',
      });

      toast.success('Transação criada com sucesso!');
      await loadTransactions();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error('Erro ao criar transação: ' + error.message);
      throw error;
    }
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      await apiClient.patch(`/financeiro/transactions/${id}`, {
        status: data.status,
        paymentDate: data.paymentDate?.toISOString(),
        paymentMethod: data.paymentMethod,
      });

      toast.success('Transação atualizada com sucesso!');
      await loadTransactions();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação: ' + error.message);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiClient.delete(`/financeiro/transactions/${id}`);
      toast.success('Transação removida com sucesso!');
      await loadTransactions();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao remover transação: ' + error.message);
      throw error;
    }
  };

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    reloadTransactions: loadTransactions,
  };
}
