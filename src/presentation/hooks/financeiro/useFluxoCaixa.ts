import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import type { GetFluxoCaixaUseCase, FluxoCaixaData } from '@/application/use-cases/financeiro';

export function useFluxoCaixa() {
  const { clinicId, isPatient } = useAuth();
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use Case
  const getFluxoCaixaUseCase = container.resolve<GetFluxoCaixaUseCase>(
    SERVICE_KEYS.GET_FLUXO_CAIXA_USE_CASE
  );

  const loadFluxoCaixa = useCallback(
    async (dataInicio?: Date, dataFim?: Date) => {
      if (!clinicId || isPatient) return;

      try {
        setLoading(true);
        setError(null);
        const result = await getFluxoCaixaUseCase.execute({
          clinicId,
          startDate: dataInicio,
          endDate: dataFim,
        });
        setFluxoCaixa(result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar fluxo de caixa'));
      } finally {
        setLoading(false);
      }
    },
    [clinicId, isPatient, getFluxoCaixaUseCase]
  );

  useEffect(() => {
    loadFluxoCaixa();
  }, [loadFluxoCaixa]);

  return {
    fluxoCaixa,
    loading,
    error,
    loadFluxoCaixa,
  };
}
