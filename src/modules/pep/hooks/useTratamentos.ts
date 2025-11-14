import { useState, useEffect } from 'react';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { Tratamento } from '@/domain/entities/Tratamento';
import { CreateTratamentoUseCase } from '@/application/use-cases/prontuario/CreateTratamentoUseCase';
import { GetTratamentosByProntuarioUseCase } from '@/application/use-cases/prontuario/GetTratamentosByProntuarioUseCase';
import { UpdateTratamentoStatusUseCase } from '@/application/use-cases/prontuario/UpdateTratamentoStatusUseCase';
import { useToast } from '@/hooks/use-toast';

export function useTratamentos(prontuarioId: string | null, clinicId: string) {
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getTratamentosUseCase = container.resolve<GetTratamentosByProntuarioUseCase>(
    SERVICE_KEYS.GET_TRATAMENTOS_BY_PRONTUARIO_USE_CASE
  );
  const createTratamentoUseCase = container.resolve<CreateTratamentoUseCase>(
    SERVICE_KEYS.CREATE_TRATAMENTO_USE_CASE
  );
  const updateTratamentoStatusUseCase = container.resolve<UpdateTratamentoStatusUseCase>(
    SERVICE_KEYS.UPDATE_TRATAMENTO_STATUS_USE_CASE
  );

  const fetchTratamentos = async () => {
    if (!prontuarioId) return;

    setIsLoading(true);
    try {
      const result = await getTratamentosUseCase.execute(prontuarioId);
      setTratamentos(result);
    } catch (error) {
      toast({
        title: 'Erro ao carregar tratamentos',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTratamentos();
  }, [prontuarioId]);

  const createTratamento = async (data: {
    titulo: string;
    descricao: string;
    denteCodigo?: string;
    procedimentoId?: string;
    valorEstimado?: number;
    dataInicio: Date;
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
      await createTratamentoUseCase.execute({
        prontuarioId,
        clinicId,
        ...data,
      });
      
      toast({
        title: 'Sucesso',
        description: 'Tratamento criado com sucesso',
      });
      
      await fetchTratamentos();
    } catch (error) {
      toast({
        title: 'Erro ao criar tratamento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateStatus = async (
    tratamentoId: string,
    action: 'iniciar' | 'concluir' | 'cancelar',
    options?: { valorCobrado?: number; motivoCancelamento?: string }
  ) => {
    try {
      await updateTratamentoStatusUseCase.execute({
        tratamentoId,
        action,
        ...options,
      });
      
      toast({
        title: 'Sucesso',
        description: 'Status do tratamento atualizado',
      });
      
      await fetchTratamentos();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    tratamentos,
    isLoading,
    createTratamento,
    updateStatus,
    refresh: fetchTratamentos,
  };
}
