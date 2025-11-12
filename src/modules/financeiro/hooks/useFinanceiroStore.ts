import { useState, useCallback } from 'react';
import { Transaction, FinancialSummary, MonthlyData, CategoryDistribution } from '../types/financeiro.types';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'RECEITA',
    category: 'CONSULTA',
    description: 'Consulta - Maria Silva',
    amount: 350.00,
    date: '2025-01-09',
    status: 'CONCLUIDO',
    paymentMethod: 'PIX',
    patientName: 'Maria Silva',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'RECEITA',
    category: 'TRATAMENTO',
    description: 'Tratamento de Canal - João Santos',
    amount: 1200.00,
    date: '2025-01-08',
    status: 'PENDENTE',
    dueDate: '2025-01-15',
    patientName: 'João Santos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'DESPESA',
    category: 'MATERIAL',
    description: 'Compra de Material Odontológico',
    amount: 850.00,
    date: '2025-01-07',
    status: 'CONCLUIDO',
    paymentMethod: 'CARTAO_CREDITO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useFinanceiroStore() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'ortho-transactions',
    MOCK_TRANSACTIONS
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, [setTransactions]);

  const updateTransaction = useCallback((id: string, data: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, ...data, updatedAt: new Date().toISOString() }
          : transaction
      )
    );
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, [setTransactions]);

  const getFilteredTransactions = useCallback(() => {
    return transactions.filter(transaction => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm);

      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      const matchesType = filterType === 'all' || transaction.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, filterStatus, filterType]);

  const getFinancialSummary = useCallback((): FinancialSummary => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalRevenue = currentMonthTransactions
      .filter(t => t.type === 'RECEITA' && t.status === 'CONCLUIDO')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayments = currentMonthTransactions
      .filter(t => t.type === 'RECEITA' && t.status === 'PENDENTE')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'DESPESA' && t.status === 'CONCLUIDO')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      pendingPayments,
      totalExpenses,
      netProfit,
      revenueChange: 8,
      paymentsChange: 12,
      expensesChange: 5,
      profitChange: 10,
    };
  }, [transactions]);

  const getMonthlyData = useCallback((): MonthlyData[] => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === index && 
               transactionDate.getFullYear() === currentYear;
      });

      const revenue = monthTransactions
        .filter(t => t.type === 'RECEITA' && t.status === 'CONCLUIDO')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'DESPESA' && t.status === 'CONCLUIDO')
        .reduce((sum, t) => sum + t.amount, 0);

      return { month, revenue, expense };
    });
  }, [transactions]);

  const getCategoryDistribution = useCallback((): CategoryDistribution[] => {
    const revenueTransactions = transactions.filter(
      t => t.type === 'RECEITA' && t.status === 'CONCLUIDO'
    );

    const total = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = revenueTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryMap).map(([category, value]) => ({
      category,
      value,
      percentage: (value / total) * 100,
    }));
  }, [transactions]);

  return {
    transactions: getFilteredTransactions(),
    allTransactions: transactions,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
    getMonthlyData,
    getCategoryDistribution,
  };
}
