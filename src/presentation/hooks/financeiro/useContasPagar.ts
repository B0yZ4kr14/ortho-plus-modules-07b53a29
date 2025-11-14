import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { ContaPagar, CategoriaContaPagar, StatusContaPagar } from '@/domain/entities/ContaPagar';
import type {
  CreateContaPagarUseCase,
  PagarContaUseCase,
  ListContasPagarUseCase,
} from '@/application/use-cases/financeiro';

export interface ContasPagarFilters {
  status?: StatusContaPagar;
  fornecedor?: string;
  categoria?: CategoriaContaPagar;
  dataInicio?: Date;
  dataFim?: Date;
}

export function useContasPagar() {
  const { clinicId, isPatient } = useAuth();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use Cases
  const createContaPagarUseCase = container.resolve<CreateContaPagarUseCase>(
    SERVICE_KEYS.CREATE_CONTA_PAGAR_USE_CASE
  );
  const pagarContaUseCase = container.resolve<PagarContaUseCase>(
    SERVICE_KEYS.PAGAR_CONTA_USE_CASE
  );
  const listContasPagarUseCase = container.resolve<ListContasPagarUseCase>(
    SERVICE_KEYS.LIST_CONTAS_PAGAR_USE_CASE
  );

  const loadContas = useCallback(
    async (filters?: ContasPagarFilters) => {
      if (!clinicId || isPatient) return;

      try {
        setLoading(true);
        setError(null);
        const result = await listContasPagarUseCase.execute({
          clinicId,
          ...filters,
        });
        setContas(result.contas);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar contas a pagar'));
      } finally {
        setLoading(false);
      }
    },
    [clinicId, isPatient, listContasPagarUseCase]
  );

  useEffect(() => {
    loadContas();
  }, [loadContas]);

  const createConta = useCallback(
    async (data: {
      descricao: string;
      fornecedor: string;
      categoria: CategoriaContaPagar;
      valor: number;
      dataVencimento: Date;
      dataEmissao?: Date;
      recorrente?: boolean;
      periodicidade?: string;
      parcelaNumero?: number;
      parcelaTotal?: number;
      observacoes?: string;
    }, userId: string) => {
      if (!clinicId || isPatient) {
        throw new Error('Usuário não autenticado');
      }

      await createContaPagarUseCase.execute({
        ...data,
        clinicId,
        createdBy: userId,
        dataEmissao: data.dataEmissao || new Date(),
      });

      await loadContas();
    },
    [clinicId, isPatient, createContaPagarUseCase, loadContas]
  );

  const pagarConta = useCallback(
    async (contaId: string, valorPago?: number, formaPagamento?: string) => {
      await pagarContaUseCase.execute({
        contaId,
        dataPagamento: new Date(),
        valorPago,
        formaPagamento,
      });

      await loadContas();
    },
    [pagarContaUseCase, loadContas]
  );

  // Análises
  const contasPendentes = contas.filter((c) => c.isPendente());
  const contasVencidas = contas.filter((c) => c.isVencida());
  const contasPagas = contas.filter((c) => c.isPaga());

  const totalAPagar = contasPendentes.reduce((sum, c) => sum + c.calcularSaldoDevedor(), 0);
  const totalVencido = contasVencidas.reduce((sum, c) => sum + c.calcularSaldoDevedor(), 0);
  const totalPago = contasPagas.reduce((sum, c) => sum + (c.valorPago || 0), 0);

  return {
    contas,
    loading,
    error,
    createConta,
    pagarConta,
    loadContas,
    // Análises
    contasPendentes,
    contasVencidas,
    contasPagas,
    totalAPagar,
    totalVencido,
    totalPago,
  };
}
