import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { CloseCashRegisterUseCase } from "../../application/use-cases/CloseCashRegisterUseCase";
import { OpenCashRegisterUseCase } from "../../application/use-cases/OpenCashRegisterUseCase";
import { CashRegister } from "../../domain/entities/CashRegister";
import { ApiCashRegisterRepository } from "../../infrastructure/repositories/ApiCashRegisterRepository";

const repository = new ApiCashRegisterRepository();
const openUseCase = new OpenCashRegisterUseCase(repository);
const closeUseCase = new CloseCashRegisterUseCase(repository);

export function useCashRegister() {
  const { clinicId, user } = useAuth();
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCurrentRegister = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      setError(null);
      const register = await repository.findOpenRegister(clinicId);
      setCurrentRegister(register);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Erro ao carregar caixa"),
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadCurrentRegister();
  }, [loadCurrentRegister]);

  const openRegister = useCallback(
    async (initialAmount: number, notes?: string) => {
      if (!clinicId || !user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const register = await openUseCase.execute({
        clinicId,
        openedBy: user.id,
        initialAmount,
        notes,
      });

      setCurrentRegister(register);
    },
    [clinicId, user],
  );

  const closeRegister = useCallback(
    async (finalAmount: number, expectedAmount: number, notes?: string) => {
      if (!currentRegister || !user?.id) {
        throw new Error("Nenhum caixa aberto");
      }

      await closeUseCase.execute({
        cashRegisterId: currentRegister.id,
        closedBy: user.id,
        finalAmount,
        expectedAmount,
        notes,
      });

      setCurrentRegister(null);
      await loadCurrentRegister();
    },
    [currentRegister, user, loadCurrentRegister],
  );

  return {
    currentRegister,
    loading,
    error,
    openRegister,
    closeRegister,
    loadCurrentRegister,
    isOpen: currentRegister?.isOpen() || false,
  };
}
