import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/infrastructure/di';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { CreateLeadUseCase } from '../../application/use-cases/CreateLeadUseCase';
import { UpdateLeadStatusUseCase } from '../../application/use-cases/UpdateLeadStatusUseCase';
import { GetLeadsByStatusUseCase } from '../../application/use-cases/GetLeadsByStatusUseCase';
import { Lead, LeadStatus } from '../../domain/entities/Lead';
import { toast } from 'sonner';

export function useLeads(clinicId: string, status?: string) {
  const queryClient = useQueryClient();
  
  const getLeadsByStatusUseCase = useService<GetLeadsByStatusUseCase>(
    SERVICE_KEYS.GET_LEADS_BY_STATUS_USE_CASE
  );

  // Query para buscar leads
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads', clinicId, status],
    queryFn: async () => {
      if (!status) {
        return [];
      }
      return await getLeadsByStatusUseCase.execute({ clinicId, status });
    },
    enabled: !!clinicId,
  });

  // Mutation para criar lead
  const createLeadUseCase = useService<CreateLeadUseCase>(
    SERVICE_KEYS.CREATE_LEAD_USE_CASE
  );

  const createLeadMutation = useMutation({
    mutationFn: async (input: {
      nome: string;
      email?: string;
      telefone?: string;
      origem: string;
      interesseDescricao?: string;
      valorEstimado?: number;
    }) => {
      return await createLeadUseCase.execute({
        clinicId,
        ...input,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar lead');
    },
  });

  // Mutation para atualizar status do lead
  const updateLeadStatusUseCase = useService<UpdateLeadStatusUseCase>(
    SERVICE_KEYS.UPDATE_LEAD_STATUS_USE_CASE
  );

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      leadId,
      newStatus,
    }: {
      leadId: string;
      newStatus: LeadStatus;
    }) => {
      return await updateLeadStatusUseCase.execute({ leadId, newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status do lead atualizado!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });

  return {
    leads,
    isLoading,
    error,
    createLead: createLeadMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isCreating: createLeadMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
}
