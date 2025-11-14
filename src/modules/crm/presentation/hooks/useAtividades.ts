import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/infrastructure/di';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { CreateAtividadeUseCase } from '../../application/use-cases/CreateAtividadeUseCase';
import { ConcluirAtividadeUseCase } from '../../application/use-cases/ConcluirAtividadeUseCase';
import { IAtividadeRepository } from '../../domain/repositories/IAtividadeRepository';
import { toast } from 'sonner';

export function useAtividades(leadId?: string) {
  const queryClient = useQueryClient();
  
  const atividadeRepository = useService<IAtividadeRepository>(
    SERVICE_KEYS.ATIVIDADE_REPOSITORY
  );

  // Query para buscar atividades do lead
  const { data: atividades = [], isLoading, error } = useQuery({
    queryKey: ['atividades', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      return await atividadeRepository.findByLeadId(leadId);
    },
    enabled: !!leadId,
  });

  // Mutation para criar atividade
  const createAtividadeUseCase = useService<CreateAtividadeUseCase>(
    SERVICE_KEYS.CREATE_ATIVIDADE_USE_CASE
  );

  const createAtividadeMutation = useMutation({
    mutationFn: async (input: {
      leadId: string;
      clinicId: string;
      tipo: string;
      titulo: string;
      descricao?: string;
      dataAgendada?: Date;
      responsavelId: string;
    }) => {
      return await createAtividadeUseCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
      toast.success('Atividade criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar atividade');
    },
  });

  // Mutation para concluir atividade
  const concluirAtividadeUseCase = useService<ConcluirAtividadeUseCase>(
    SERVICE_KEYS.CONCLUIR_ATIVIDADE_USE_CASE
  );

  const concluirAtividadeMutation = useMutation({
    mutationFn: async ({
      atividadeId,
      resultado,
    }: {
      atividadeId: string;
      resultado?: string;
    }) => {
      return await concluirAtividadeUseCase.execute({ atividadeId, resultado });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
      toast.success('Atividade concluída!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao concluir atividade');
    },
  });

  return {
    atividades,
    isLoading,
    error,
    createAtividade: createAtividadeMutation.mutate,
    concluirAtividade: concluirAtividadeMutation.mutate,
    isCreating: createAtividadeMutation.isPending,
    isConcluindo: concluirAtividadeMutation.isPending,
  };
}
