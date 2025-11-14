import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { toast } from 'sonner';
import type { IOdontogramaRepository } from '@/domain/repositories/IOdontogramaRepository';
import type {
  GetOdontogramaUseCase,
  UpdateToothStatusUseCase,
  UpdateToothSurfaceUseCase,
  UpdateToothNotesUseCase,
  UpdateToothStatusInput,
  UpdateToothSurfaceInput,
  UpdateToothNotesInput,
} from '@/application/use-cases/odontograma';
import type { ToothStatus, ToothSurface } from '../types/odontograma.types';

/**
 * Hook para gerenciar Odontograma
 * 
 * Fornece:
 * - Busca/criação automática de odontograma
 * - Atualização de status de dentes
 * - Atualização de superfícies
 * - Atualização de notas
 * - Estatísticas por status
 * - Histórico de alterações
 */
export function useOdontograma(prontuarioId: string | null) {
  const queryClient = useQueryClient();

  // Repositories e Use Cases
  const odontogramaRepository = container.resolve<IOdontogramaRepository>(SERVICE_KEYS.ODONTOGRAMA_REPOSITORY);
  const getOdontogramaUseCase = container.resolve<GetOdontogramaUseCase>(SERVICE_KEYS.GET_ODONTOGRAMA_USE_CASE);
  const updateToothStatusUseCase = container.resolve<UpdateToothStatusUseCase>(SERVICE_KEYS.UPDATE_TOOTH_STATUS_USE_CASE);
  const updateToothSurfaceUseCase = container.resolve<UpdateToothSurfaceUseCase>(SERVICE_KEYS.UPDATE_TOOTH_SURFACE_USE_CASE);
  const updateToothNotesUseCase = container.resolve<UpdateToothNotesUseCase>(SERVICE_KEYS.UPDATE_TOOTH_NOTES_USE_CASE);

  // Query: Buscar ou criar odontograma
  const { data: odontograma, isLoading, error } = useQuery({
    queryKey: ['odontograma', prontuarioId],
    queryFn: async () => {
      if (!prontuarioId) return null;
      
      const { odontograma } = await getOdontogramaUseCase.execute({
        prontuarioId,
      });
      
      return odontograma;
    },
    enabled: !!prontuarioId,
  });

  // Mutation: Atualizar status de dente
  const updateToothStatusMutation = useMutation({
    mutationFn: async (input: {
      toothNumber: number;
      newStatus: ToothStatus;
      notes?: string;
    }) => {
      if (!odontograma) {
        throw new Error('Odontograma não encontrado');
      }

      const updateInput: UpdateToothStatusInput = {
        odontogramaId: odontograma.id,
        toothNumber: input.toothNumber,
        newStatus: input.newStatus,
        notes: input.notes,
      };

      const { odontograma: updated } = await updateToothStatusUseCase.execute(updateInput);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odontograma', prontuarioId] });
      toast.success('Status do dente atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar dente: ${error.message}`);
    },
  });

  // Mutation: Atualizar superfície de dente
  const updateToothSurfaceMutation = useMutation({
    mutationFn: async (input: {
      toothNumber: number;
      surface: ToothSurface;
      newStatus: ToothStatus;
    }) => {
      if (!odontograma) {
        throw new Error('Odontograma não encontrado');
      }

      const updateInput: UpdateToothSurfaceInput = {
        odontogramaId: odontograma.id,
        toothNumber: input.toothNumber,
        surface: input.surface,
        newStatus: input.newStatus,
      };

      const { odontograma: updated } = await updateToothSurfaceUseCase.execute(updateInput);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odontograma', prontuarioId] });
      toast.success('Superfície do dente atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar superfície: ${error.message}`);
    },
  });

  // Mutation: Atualizar notas de dente
  const updateToothNotesMutation = useMutation({
    mutationFn: async (input: {
      toothNumber: number;
      notes: string;
    }) => {
      if (!odontograma) {
        throw new Error('Odontograma não encontrado');
      }

      const updateInput: UpdateToothNotesInput = {
        odontogramaId: odontograma.id,
        toothNumber: input.toothNumber,
        notes: input.notes,
      };

      const { odontograma: updated } = await updateToothNotesUseCase.execute(updateInput);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['odontograma', prontuarioId] });
      toast.success('Notas do dente atualizadas!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar notas: ${error.message}`);
    },
  });

  // Estatísticas
  const statistics = odontograma ? {
    counts: odontograma.contarDentesPorStatus(),
    total: 32,
  } : null;

  // Dados dos dentes
  const teeth = odontograma?.teeth || {};

  // Histórico
  const history = odontograma?.history || [];

  return {
    // Data
    odontograma,
    teeth,
    history,
    statistics,
    isLoading,
    error,

    // Actions
    updateToothStatus: updateToothStatusMutation.mutateAsync,
    updateToothSurface: updateToothSurfaceMutation.mutateAsync,
    updateToothNotes: updateToothNotesMutation.mutateAsync,

    // Loading states
    isUpdatingStatus: updateToothStatusMutation.isPending,
    isUpdatingSurface: updateToothSurfaceMutation.isPending,
    isUpdatingNotes: updateToothNotesMutation.isPending,
    isUpdating: updateToothStatusMutation.isPending || 
                updateToothSurfaceMutation.isPending || 
                updateToothNotesMutation.isPending,
  };
}
