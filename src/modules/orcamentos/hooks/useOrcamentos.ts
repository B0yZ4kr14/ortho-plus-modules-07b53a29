import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/Container';
import { SERVICE_KEYS } from '@/infrastructure/di/ServiceKeys';
import { toast } from 'sonner';
import type { Orcamento } from '@/domain/entities/Orcamento';
import type { IOrcamentoRepository } from '@/domain/repositories/IOrcamentoRepository';
import type {
  CreateOrcamentoUseCase,
  CreateOrcamentoInput,
  UpdateOrcamentoUseCase,
  UpdateOrcamentoInput,
  AprovarOrcamentoUseCase,
  RejeitarOrcamentoUseCase,
} from '@/application/use-cases/orcamentos';

/**
 * Hook para gerenciar Orçamentos
 * 
 * Fornece:
 * - Listagem de orçamentos (por clínica, paciente, status)
 * - Criação de orçamento
 * - Atualização de valores
 * - Aprovação e rejeição
 * - Invalidação de cache automática
 */
export function useOrcamentos(clinicId: string) {
  const queryClient = useQueryClient();
  const [selectedOrcamentoId, setSelectedOrcamentoId] = useState<string | null>(null);

  // Repositories e Use Cases
  const orcamentoRepository = container.resolve<IOrcamentoRepository>(SERVICE_KEYS.ORCAMENTO_REPOSITORY);
  const createUseCase = container.resolve<CreateOrcamentoUseCase>(SERVICE_KEYS.CREATE_ORCAMENTO_USE_CASE);
  const updateUseCase = container.resolve<UpdateOrcamentoUseCase>(SERVICE_KEYS.UPDATE_ORCAMENTO_USE_CASE);
  const aprovarUseCase = container.resolve<AprovarOrcamentoUseCase>(SERVICE_KEYS.APROVAR_ORCAMENTO_USE_CASE);
  const rejeitarUseCase = container.resolve<RejeitarOrcamentoUseCase>(SERVICE_KEYS.REJEITAR_ORCAMENTO_USE_CASE);

  // Query: Listar todos os orçamentos da clínica
  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ['orcamentos', clinicId],
    queryFn: () => orcamentoRepository.findByClinicId(clinicId),
    enabled: !!clinicId,
  });

  // Query: Orçamentos por paciente
  const getOrcamentosByPatient = (patientId: string) => {
    return useQuery({
      queryKey: ['orcamentos', 'patient', patientId],
      queryFn: () => orcamentoRepository.findByPatientId(patientId, clinicId),
      enabled: !!patientId && !!clinicId,
    });
  };

  // Query: Orçamentos pendentes
  const { data: orcamentosPendentes = [] } = useQuery({
    queryKey: ['orcamentos', 'pendentes', clinicId],
    queryFn: () => orcamentoRepository.findPendentes(clinicId),
    enabled: !!clinicId,
  });

  // Query: Orçamentos expirados
  const { data: orcamentosExpirados = [] } = useQuery({
    queryKey: ['orcamentos', 'expirados', clinicId],
    queryFn: () => orcamentoRepository.findExpirados(clinicId),
    enabled: !!clinicId,
  });

  // Query: Orçamento por ID
  const { data: selectedOrcamento } = useQuery({
    queryKey: ['orcamento', selectedOrcamentoId],
    queryFn: () => orcamentoRepository.findById(selectedOrcamentoId!),
    enabled: !!selectedOrcamentoId,
  });

  // Mutation: Criar orçamento
  const createMutation = useMutation({
    mutationFn: async (input: CreateOrcamentoInput) => {
      const { orcamento } = await createUseCase.execute(input);
      return orcamento;
    },
    onSuccess: (orcamento) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      toast.success('Orçamento criado com sucesso!');
      setSelectedOrcamentoId(orcamento.id);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar orçamento: ${error.message}`);
    },
  });

  // Mutation: Atualizar orçamento
  const updateMutation = useMutation({
    mutationFn: async (input: UpdateOrcamentoInput) => {
      const { orcamento } = await updateUseCase.execute(input);
      return orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', selectedOrcamentoId] });
      toast.success('Orçamento atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar orçamento: ${error.message}`);
    },
  });

  // Mutation: Aprovar orçamento
  const aprovarMutation = useMutation({
    mutationFn: async ({ orcamentoId, aprovadoPor }: { orcamentoId: string; aprovadoPor: string }) => {
      const { orcamento } = await aprovarUseCase.execute({ orcamentoId, aprovadoPor });
      return orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', selectedOrcamentoId] });
      toast.success('Orçamento aprovado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar orçamento: ${error.message}`);
    },
  });

  // Mutation: Rejeitar orçamento
  const rejeitarMutation = useMutation({
    mutationFn: async ({ 
      orcamentoId, 
      rejeitadoPor, 
      motivo 
    }: { 
      orcamentoId: string; 
      rejeitadoPor: string; 
      motivo: string;
    }) => {
      const { orcamento } = await rejeitarUseCase.execute({ orcamentoId, rejeitadoPor, motivo });
      return orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento', selectedOrcamentoId] });
      toast.success('Orçamento rejeitado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao rejeitar orçamento: ${error.message}`);
    },
  });

  return {
    // Data
    orcamentos,
    orcamentosPendentes,
    orcamentosExpirados,
    selectedOrcamento,
    isLoading,

    // Selection
    selectedOrcamentoId,
    setSelectedOrcamentoId,

    // Actions
    createOrcamento: createMutation.mutateAsync,
    updateOrcamento: updateMutation.mutateAsync,
    aprovarOrcamento: aprovarMutation.mutateAsync,
    rejeitarOrcamento: rejeitarMutation.mutateAsync,

    // Query helpers
    getOrcamentosByPatient,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isAprovando: aprovarMutation.isPending,
    isRejeitando: rejeitarMutation.isPending,
  };
}
