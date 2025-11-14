import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { MovimentoCaixa } from '@/domain/entities/MovimentoCaixa';
import { IMovimentoCaixaRepository } from '@/domain/repositories/IMovimentoCaixaRepository';
import type {
  AbrirCaixaUseCase,
  FecharCaixaUseCase,
  RegistrarSangriaUseCase,
} from '@/application/use-cases/financeiro';

export function useCaixa() {
  const { clinicId, isPatient } = useAuth();
  const [caixaAtual, setCaixaAtual] = useState<MovimentoCaixa | null>(null);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use Cases
  const abrirCaixaUseCase = container.resolve<AbrirCaixaUseCase>(
    SERVICE_KEYS.ABRIR_CAIXA_USE_CASE
  );
  const fecharCaixaUseCase = container.resolve<FecharCaixaUseCase>(
    SERVICE_KEYS.FECHAR_CAIXA_USE_CASE
  );
  const registrarSangriaUseCase = container.resolve<RegistrarSangriaUseCase>(
    SERVICE_KEYS.REGISTRAR_SANGRIA_USE_CASE
  );
  const movimentoCaixaRepository = container.resolve<IMovimentoCaixaRepository>(
    SERVICE_KEYS.MOVIMENTO_CAIXA_REPOSITORY
  );

  const loadCaixaAtual = useCallback(async () => {
    if (!clinicId || isPatient) return;

    try {
      setLoading(true);
      setError(null);
      const caixa = await movimentoCaixaRepository.findUltimoAberto(clinicId);
      setCaixaAtual(caixa);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar caixa'));
    } finally {
      setLoading(false);
    }
  }, [clinicId, isPatient, movimentoCaixaRepository]);

  const loadMovimentos = useCallback(async () => {
    if (!clinicId || isPatient) return;

    try {
      const movs = await movimentoCaixaRepository.findByClinicId(clinicId);
      setMovimentos(movs);
    } catch (err) {
      console.error('Erro ao carregar movimentos:', err);
    }
  }, [clinicId, isPatient, movimentoCaixaRepository]);

  useEffect(() => {
    loadCaixaAtual();
    loadMovimentos();
  }, [loadCaixaAtual, loadMovimentos]);

  const abrirCaixa = useCallback(
    async (valorInicial: number, userId: string) => {
      if (!clinicId || isPatient) {
        throw new Error('Usuário não autenticado');
      }

      await abrirCaixaUseCase.execute({
        clinicId,
        createdBy: userId,
        valorInicial,
      });

      await loadCaixaAtual();
      await loadMovimentos();
    },
    [clinicId, isPatient, abrirCaixaUseCase, loadCaixaAtual, loadMovimentos]
  );

  const fecharCaixa = useCallback(
    async (valorFinal: number, valorEsperado: number, observacoes?: string) => {
      if (!clinicId || !caixaAtual) {
        throw new Error('Nenhum caixa aberto');
      }

      await fecharCaixaUseCase.execute({
        clinicId,
        valorFinal,
        valorEsperado,
        observacoes,
      });

      await loadCaixaAtual();
      await loadMovimentos();
    },
    [clinicId, caixaAtual, fecharCaixaUseCase, loadCaixaAtual, loadMovimentos]
  );

  const registrarSangria = useCallback(
    async (valor: number, motivo: string, userId: string, horarioRisco?: string) => {
      if (!clinicId || isPatient) {
        throw new Error('Usuário não autenticado');
      }

      await registrarSangriaUseCase.execute({
        clinicId,
        createdBy: userId,
        valor,
        motivo,
        horarioRisco,
      });

      await loadMovimentos();
    },
    [clinicId, isPatient, registrarSangriaUseCase, loadMovimentos]
  );

  const caixaAberto = caixaAtual?.isAberto() || false;
  const sangrias = movimentos.filter((m) => m.tipo === 'SANGRIA');

  return {
    caixaAtual,
    movimentos,
    sangrias,
    loading,
    error,
    caixaAberto,
    abrirCaixa,
    fecharCaixa,
    registrarSangria,
    loadCaixaAtual,
    loadMovimentos,
  };
}
