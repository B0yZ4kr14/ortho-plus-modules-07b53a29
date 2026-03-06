import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { CreateTransactionUseCase } from "../../application/use-cases/CreateTransactionUseCase";
import { ListTransactionsUseCase } from "../../application/use-cases/ListTransactionsUseCase";
import { PayTransactionUseCase } from "../../application/use-cases/PayTransactionUseCase";
import { Transaction } from "../../domain/entities/Transaction";
import { TransactionFilters } from "../../domain/repositories/ITransactionRepository";
import { ApiTransactionRepository } from "../../infrastructure/repositories/ApiTransactionRepository";

const repository = new ApiTransactionRepository();
const createUseCase = new CreateTransactionUseCase(repository);
const payUseCase = new PayTransactionUseCase(repository);
const listUseCase = new ListTransactionsUseCase(repository);

export function useTransactions(filters?: TransactionFilters) {
  const { clinicId, user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await listUseCase.execute({ clinicId, filters });
      setTransactions(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao carregar transações"),
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const createTransaction = useCallback(
    async (data: {
      type: "RECEITA" | "DESPESA";
      amount: number;
      description: string;
      categoryId?: string;
      dueDate: Date;
      paymentMethod?: string;
      notes?: string;
    }) => {
      if (!clinicId || !user?.id) {
        throw new Error("Usuário não autenticado");
      }

      await createUseCase.execute({
        ...data,
        clinicId,
        createdBy: user.id,
      });

      await loadTransactions();
    },
    [clinicId, user, loadTransactions],
  );

  const payTransaction = useCallback(
    async (transactionId: string, paidDate: Date, paymentMethod?: string) => {
      await payUseCase.execute({
        transactionId,
        paidDate,
        paymentMethod,
      });

      await loadTransactions();
    },
    [loadTransactions],
  );

  // Analytics
  const totalReceitas = transactions
    .filter((t) => t.type === "RECEITA" && t.status === "PAGO")
    .reduce((sum, t) => sum + t.amount.toNumber(), 0);

  const totalDespesas = transactions
    .filter((t) => t.type === "DESPESA" && t.status === "PAGO")
    .reduce((sum, t) => sum + t.amount.toNumber(), 0);

  const receitasPendentes = transactions
    .filter((t) => t.type === "RECEITA" && t.status === "PENDENTE")
    .reduce((sum, t) => sum + t.amount.toNumber(), 0);

  const despesasPendentes = transactions
    .filter((t) => t.type === "DESPESA" && t.status === "PENDENTE")
    .reduce((sum, t) => sum + t.amount.toNumber(), 0);

  const saldo = totalReceitas - totalDespesas;

  return {
    transactions,
    loading,
    error,
    createTransaction,
    payTransaction,
    loadTransactions,
    // Analytics
    totalReceitas,
    totalDespesas,
    receitasPendentes,
    despesasPendentes,
    saldo,
  };
}
