/**
 * FASE 2 - TASK 2.1: useSplitPayment Hook
 * Hook para gerenciar split de pagamentos
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SupabaseSplitRepository } from '@/infrastructure/repositories/SupabaseSplitRepository';
import { CreateSplitConfigUseCase } from '@/application/use-cases/split/CreateSplitConfigUseCase';
import { ApplySplitUseCase } from '@/application/use-cases/split/ApplySplitUseCase';
import { 
  SplitConfig, 
  CreateSplitConfigDTO 
} from '@/domain/entities/SplitConfig';
import {
  SplitTransaction,
  CreateSplitTransactionDTO
} from '@/domain/entities/SplitTransaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const repository = new SupabaseSplitRepository();
const createConfigUseCase = new CreateSplitConfigUseCase(repository);
const applySplitUseCase = new ApplySplitUseCase(repository);

export function useSplitPayment() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const clinicId = profile?.clinic_id || '';
  const userId = profile?.id || '';
  const userRole = profile?.app_role || 'MEMBER';

  // ========================================================================
  // QUERIES
  // ========================================================================

  // Buscar todas as configurações
  const { data: configs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['split-configs', clinicId],
    queryFn: () => repository.getAllConfigs(clinicId),
    enabled: !!clinicId,
  });

  // Buscar configurações ativas
  const { data: activeConfigs = [] } = useQuery({
    queryKey: ['split-configs-active', clinicId],
    queryFn: () => repository.getActiveConfigs(clinicId),
    enabled: !!clinicId,
  });

  // Buscar transações de split
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['split-transactions', clinicId],
    queryFn: () => repository.getAllTransactions(clinicId),
    enabled: !!clinicId,
  });

  // ========================================================================
  // MUTATIONS
  // ========================================================================

  // Criar configuração
  const createConfigMutation = useMutation({
    mutationFn: async (dto: CreateSplitConfigDTO) => {
      return await createConfigUseCase.execute({
        ...dto,
        clinicId,
        userId,
        userRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-configs'] });
      toast({
        title: 'Configuração criada',
        description: 'Configuração de split criada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar configuração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Aplicar split a um pagamento
  const applySplitMutation = useMutation({
    mutationFn: async (dto: CreateSplitTransactionDTO) => {
      return await applySplitUseCase.execute({
        ...dto,
        clinicId,
        userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-transactions'] });
      toast({
        title: 'Split aplicado',
        description: 'Split de pagamento aplicado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao aplicar split',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deletar configuração
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      return await repository.deleteConfig(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-configs'] });
      toast({
        title: 'Configuração deletada',
        description: 'Configuração de split deletada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao deletar configuração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return {
    // Data
    configs,
    activeConfigs,
    transactions,
    
    // Loading states
    isLoading: isLoading || isLoadingConfigs || isLoadingTransactions,
    isLoadingConfigs,
    isLoadingTransactions,
    
    // Actions
    createConfig: createConfigMutation.mutate,
    applySplit: applySplitMutation.mutate,
    deleteConfig: deleteConfigMutation.mutate,
    
    // Helpers
    formatCurrency,
  };
}
