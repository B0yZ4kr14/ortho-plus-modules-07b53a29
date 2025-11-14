import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { ContaReceber, StatusContaReceber } from '@/domain/entities/ContaReceber';
import type {
  CreateContaReceberUseCase,
  ReceberContaUseCase,
  ListContasReceberUseCase,
} from '@/application/use-cases/financeiro';

export interface ContasReceberFilters {
  status?: StatusContaReceber;
  patientId?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export function useContasReceber() {
  const { clinicId, isPatient } = useAuth();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use Cases
  const createContaReceberUseCase = container.resolve<CreateContaReceberUseCase>(
    SERVICE_KEYS.CREATE_CONTA_RECEBER_USE_CASE
  );
  const receberContaUseCase = container.resolve<ReceberContaUseCase>(
    SERVICE_KEYS.RECEBER_CONTA_USE_CASE
  );
  const listContasReceberUseCase = container.resolve<ListContasReceberUseCase>(
    SERVICE_KEYS.LIST_CONTAS_RECEBER_USE_CASE
  );

  const loadContas = useCallback(
    async (filters?: ContasReceberFilters) => {
      if (!clinicId || isPatient) return;

      try {
        setLoading(true);
        setError(null);
        const result = await listContasReceberUseCase.execute({
          clinicId,
          ...filters,
        });
        setContas(result.contas);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar contas a receber'));
      } finally {
        setLoading(false);
      }
    },
    [clinicId, isPatient, listContasReceberUseCase]
  );

  useEffect(() => {
    loadContas();
  }, [loadContas]);

  const createConta = useCallback(
    async (data: {
      patientId?: string;
      descricao: string;
      valor: number;
      dataVencimento: Date;
      dataEmissao?: Date;
      parcelaNumero?: number;
      parcelaTotal?: number;
      observacoes?: string;
    }, userId: string) => {
      if (!clinicId || isPatient) {
        throw new Error('Usuário não autenticado');
      }

      await createContaReceberUseCase.execute({
        ...data,
        clinicId,
        createdBy: userId,
        dataEmissao: data.dataEmissao || new Date(),
      });

      await loadContas();
    },
    [clinicId, isPatient, createContaReceberUseCase, loadContas]
  );

  const receberConta = useCallback(
    async (contaId: string, valorPago?: number, formaPagamento?: string) => {
      await receberContaUseCase.execute({
        contaId,
        dataPagamento: new Date(),
        valorPago,
        formaPagamento,
      });

      await loadContas();
    },
    [receberContaUseCase, loadContas]
  );

  // Análises
  const contasPendentes = contas.filter((c) => c.isPendente());
  const contasVencidas = contas.filter((c) => c.isVencida());
  const contasRecebidas = contas.filter((c) => c.isRecebida());

  const totalAReceber = contasPendentes.reduce((sum, c) => sum + c.calcularSaldoReceber(), 0);
  const totalVencido = contasVencidas.reduce((sum, c) => sum + c.calcularSaldoReceber(), 0);
  const totalRecebido = contasRecebidas.reduce((sum, c) => sum + (c.valorPago || 0), 0);

  return {
    contas,
    loading,
    error,
    createConta,
    receberConta,
    loadContas,
    // Análises
    contasPendentes,
    contasVencidas,
    contasRecebidas,
    totalAReceber,
    totalVencido,
    totalRecebido,
  };
}
