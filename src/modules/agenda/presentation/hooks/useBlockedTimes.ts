import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlockedTimeRepositorySupabase } from '../../infrastructure/repositories/BlockedTimeRepositorySupabase';
import { AppointmentRepositorySupabase } from '../../infrastructure/repositories/AppointmentRepositorySupabase';
import { CreateBlockedTimeUseCase } from '../../application/useCases/CreateBlockedTimeUseCase';
import { ListBlockedTimesUseCase } from '../../application/useCases/ListBlockedTimesUseCase';
import { DeleteBlockedTimeUseCase } from '../../application/useCases/DeleteBlockedTimeUseCase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const blockedTimeRepo = new BlockedTimeRepositorySupabase();
const appointmentRepo = new AppointmentRepositorySupabase();

export function useBlockedTimes(filters?: {
  clinicId?: string;
  dentistId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: blockedTimes, isLoading, error } = useQuery({
    queryKey: ['blocked-times', filters],
    queryFn: async () => {
      const useCase = new ListBlockedTimesUseCase(blockedTimeRepo);
      return await useCase.execute(filters || {});
    },
    enabled: !!filters,
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      clinicId: string;
      dentistId: string;
      startDatetime: Date;
      endDatetime: Date;
      reason: string;
    }) => {
      const useCase = new CreateBlockedTimeUseCase(blockedTimeRepo, appointmentRepo);
      return await useCase.execute({
        ...input,
        createdBy: user?.id || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-times'] });
      toast.success('Horário bloqueado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (blockedTimeId: string) => {
      const useCase = new DeleteBlockedTimeUseCase(blockedTimeRepo);
      return await useCase.execute({ blockedTimeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-times'] });
      toast.success('Bloqueio removido');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    blockedTimes: blockedTimes || [],
    isLoading,
    error,
    createBlockedTime: createMutation.mutate,
    deleteBlockedTime: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
