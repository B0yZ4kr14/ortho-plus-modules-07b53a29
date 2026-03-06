import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import {
  CashFlowResult,
  GetCashFlowUseCase,
} from "../../application/use-cases/GetCashFlowUseCase";
import { Period } from "../../domain/valueObjects/Period";
import { ApiTransactionRepository } from "../../infrastructure/repositories/ApiTransactionRepository";

const repository = new ApiTransactionRepository();
const getCashFlowUseCase = new GetCashFlowUseCase(repository);

export function useCashFlow(period?: Period) {
  const { clinicId } = useAuth();
  const [cashFlow, setCashFlow] = useState<CashFlowResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const currentPeriod = period || Period.currentMonth();

  const loadCashFlow = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getCashFlowUseCase.execute({
        clinicId,
        period: currentPeriod,
      });
      setCashFlow(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erro ao carregar fluxo de caixa"),
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId, currentPeriod]);

  useEffect(() => {
    loadCashFlow();
  }, [loadCashFlow]);

  return {
    cashFlow,
    loading,
    error,
    loadCashFlow,
  };
}
