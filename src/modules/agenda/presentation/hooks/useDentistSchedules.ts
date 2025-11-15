import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DentistScheduleRepositorySupabase } from '../../infrastructure/repositories/DentistScheduleRepositorySupabase';
import { CreateDentistScheduleUseCase } from '../../application/useCases/CreateDentistScheduleUseCase';
import { UpdateDentistScheduleUseCase } from '../../application/useCases/UpdateDentistScheduleUseCase';
import { ListDentistSchedulesUseCase } from '../../application/useCases/ListDentistSchedulesUseCase';
import { toast } from 'sonner';

const scheduleRepo = new DentistScheduleRepositorySupabase();

export function useDentistSchedules(filters?: {
  clinicId?: string;
  dentistId?: string;
}) {
  const queryClient = useQueryClient();

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ['dentist-schedules', filters],
    queryFn: async () => {
      const useCase = new ListDentistSchedulesUseCase(scheduleRepo);
      return await useCase.execute(filters || {});
    },
    enabled: !!filters,
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      clinicId: string;
      dentistId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      breakStart?: string;
      breakEnd?: string;
    }) => {
      const useCase = new CreateDentistScheduleUseCase(scheduleRepo);
      return await useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentist-schedules'] });
      toast.success('Horário configurado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: {
      scheduleId: string;
      startTime?: string;
      endTime?: string;
      breakStart?: string;
      breakEnd?: string;
    }) => {
      const useCase = new UpdateDentistScheduleUseCase(scheduleRepo);
      return await useCase.execute(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentist-schedules'] });
      toast.success('Horário atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      await scheduleRepo.delete(scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentist-schedules'] });
      toast.success('Horário removido');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    schedules: schedules || [],
    isLoading,
    error,
    createSchedule: createMutation.mutate,
    updateSchedule: updateMutation.mutate,
    deleteSchedule: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
