import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Orcamento, StatusOrcamento } from '../../domain/entities/Orcamento';
import { SupabaseOrcamentoRepository } from '../../infrastructure/repositories/SupabaseOrcamentoRepository';
import { CreateOrcamentoUseCase } from '../../application/use-cases/CreateOrcamentoUseCase';
import { ListOrcamentosUseCase } from '../../application/use-cases/ListOrcamentosUseCase';
import { EnviarOrcamentoUseCase } from '../../application/use-cases/EnviarOrcamentoUseCase';
import { AprovarOrcamentoUseCase } from '../../application/use-cases/AprovarOrcamentoUseCase';

const repository = new SupabaseOrcamentoRepository();
const createUseCase = new CreateOrcamentoUseCase(repository);
const listUseCase = new ListOrcamentosUseCase(repository);
const enviarUseCase = new EnviarOrcamentoUseCase(repository);
const aprovarUseCase = new AprovarOrcamentoUseCase(repository);

export function useOrcamentos() {
  const { clinicId, user, isPatient } = useAuth();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOrcamentos = useCallback(
    async (filters?: { status?: StatusOrcamento; patientId?: string }) => {
      if (!clinicId || isPatient) return;

      try {
        setLoading(true);
        setError(null);
        const result = await listUseCase.execute({
          clinicId,
          ...filters,
        });
        setOrcamentos(result.orcamentos);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar orçamentos'));
      } finally {
        setLoading(false);
      }
    },
    [clinicId, isPatient]
  );

  useEffect(() => {
    loadOrcamentos();
  }, [loadOrcamentos]);

  const createOrcamento = useCallback(
    async (data: {
      patientId: string;
      titulo: string;
      descricao?: string;
      tipoPlano: string;
      validadeDias: number;
      valorSubtotal: number;
      descontoPercentual?: number;
      descontoValor?: number;
      observacoes?: string;
    }) => {
      if (!clinicId || !user?.id || isPatient) {
        throw new Error('Usuário não autenticado');
      }

      await createUseCase.execute({
        ...data,
        clinicId,
        createdBy: user.id,
      });

      await loadOrcamentos();
    },
    [clinicId, user, isPatient, loadOrcamentos]
  );

  const enviarOrcamento = useCallback(
    async (orcamentoId: string) => {
      await enviarUseCase.execute({ orcamentoId });
      await loadOrcamentos();
    },
    [loadOrcamentos]
  );

  const aprovarOrcamento = useCallback(
    async (orcamentoId: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      await aprovarUseCase.execute({ orcamentoId, aprovadoPor: user.id });
      await loadOrcamentos();
    },
    [user, loadOrcamentos]
  );

  // Análises
  const orcamentosRascunho = orcamentos.filter((o) => o.isDraft());
  const orcamentosPendentes = orcamentos.filter((o) => o.isPending());
  const orcamentosAprovados = orcamentos.filter((o) => o.isApproved());

  const totalOrcamentos = orcamentos.length;
  const totalValor = orcamentos.reduce((sum, o) => sum + o.valorTotal, 0);

  return {
    orcamentos,
    loading,
    error,
    createOrcamento,
    enviarOrcamento,
    aprovarOrcamento,
    loadOrcamentos,
    // Análises
    orcamentosRascunho,
    orcamentosPendentes,
    orcamentosAprovados,
    totalOrcamentos,
    totalValor,
  };
}
