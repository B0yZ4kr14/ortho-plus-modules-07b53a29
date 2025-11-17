/**
 * useBackups Hook
 * Hook para gestão de backups (ADMIN ONLY)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Backup {
  id: string;
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
  destination: 'LOCAL' | 'S3' | 'GCS' | 'AZURE' | 'STORJ';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scheduledAt: string;
  completedAt?: string;
  sizeBytes?: number;
  isEncrypted: boolean;
}

interface CreateBackupData {
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
  destination: 'LOCAL' | 'S3' | 'GCS' | 'AZURE' | 'STORJ';
  retentionDays?: number;
  isEncrypted?: boolean;
}

export const useBackups = () => {
  const queryClient = useQueryClient();

  // Listar backups
  const { data, isLoading, error } = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      return await apiClient.get<{ backups: Backup[]; total: number }>('/backups');
    },
  });

  // Criar backup
  const createMutation = useMutation({
    mutationFn: async (backupData: CreateBackupData) => {
      return await apiClient.post('/backups', backupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Backup agendado com sucesso!');
    },
  });

  // Verificar integridade
  const verifyMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return await apiClient.post(`/backups/${backupId}/verify`);
    },
    onSuccess: () => {
      toast.success('Backup verificado com sucesso!');
    },
  });

  // Obter estatísticas
  const { data: statsData } = useQuery({
    queryKey: ['backups', 'statistics'],
    queryFn: async () => {
      return await apiClient.get<{ stats: any }>('/backups/statistics');
    },
  });

  return {
    backups: data?.backups || [],
    total: data?.total || 0,
    isLoading,
    error,
    createBackup: createMutation.mutate,
    isCreating: createMutation.isPending,
    verifyBackup: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    statistics: statsData?.stats,
  };
};
