import { useState, useEffect } from 'react';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { Evolucao } from '@/domain/entities/Evolucao';
import { CreateEvolucaoUseCase } from '@/application/use-cases/prontuario/CreateEvolucaoUseCase';
import { IEvolucaoRepository } from '@/domain/repositories/IEvolucaoRepository';
import { useToast } from '@/hooks/use-toast';

export function useEvolucoes(prontuarioId: string | null, clinicId: string) {
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const evolucaoRepository = container.resolve<IEvolucaoRepository>(
    SERVICE_KEYS.EVOLUCAO_REPOSITORY
  );
  const createEvolucaoUseCase = container.resolve<CreateEvolucaoUseCase>(
    SERVICE_KEYS.CREATE_EVOLUCAO_USE_CASE
  );

  const fetchEvolucoes = async () => {
    if (!prontuarioId) return;

    setIsLoading(true);
    try {
      const result = await evolucaoRepository.findByProntuarioId(prontuarioId);
      setEvolucoes(result);
    } catch (error) {
      toast({
        title: 'Erro ao carregar evoluções',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvolucoes();
  }, [prontuarioId]);

  const createEvolucao = async (data: {
    tratamentoId: string;
    descricao: string;
    procedimentosRealizados: string[];
    observacoes?: string;
    assinadoPor: string;
    createdBy: string;
  }) => {
    if (!prontuarioId) {
      toast({
        title: 'Erro',
        description: 'Prontuário não selecionado',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createEvolucaoUseCase.execute({
        prontuarioId,
        clinicId,
        ...data,
      });
      
      toast({
        title: 'Sucesso',
        description: 'Evolução registrada com sucesso',
      });
      
      await fetchEvolucoes();
    } catch (error) {
      toast({
        title: 'Erro ao registrar evolução',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    evolucoes,
    isLoading,
    createEvolucao,
    refresh: fetchEvolucoes,
  };
}
