/**
 * useDatabaseAdmin Hook
 * Hook para administração do banco de dados (ADMIN ONLY)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface DatabaseHealth {
  connectionPoolSize: number;
  activeConnections: number;
  idleConnections: number;
  slowQueriesCount: number;
  averageQueryTime: number;
  diskUsagePercent: number;
  lastVacuum: string | null;
  lastAnalyze: string | null;
  timestamp: string;
}

interface SlowQuery {
  query: string;
  calls: number;
  averageTime: number;
  totalTime: number;
  lastExecuted: string;
}

export const useDatabaseAdmin = () => {
  const queryClient = useQueryClient();

  // Obter saúde do banco
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['database', 'health'],
    queryFn: async () => {
      return await apiClient.get<{
        health: DatabaseHealth;
        isHealthy: boolean;
        needsMaintenance: boolean;
      }>('/database-admin/health');
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Obter queries lentas
  const { data: slowQueriesData, isLoading: isLoadingSlowQueries } = useQuery({
    queryKey: ['database', 'slow-queries'],
    queryFn: async () => {
      return await apiClient.get<{ slowQueries: SlowQuery[] }>('/database-admin/slow-queries');
    },
  });

  // Executar manutenção
  const maintenanceMutation = useMutation({
    mutationFn: async (data: { operation: 'VACUUM' | 'ANALYZE' | 'REINDEX' | 'VACUUM_FULL'; targetSchema?: string }) => {
      return await apiClient.post('/database-admin/maintenance', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database', 'health'] });
      toast.success('Manutenção iniciada com sucesso!');
    },
  });

  // Obter estatísticas do pool de conexões
  const { data: poolData } = useQuery({
    queryKey: ['database', 'connection-pool'],
    queryFn: async () => {
      return await apiClient.get<{ poolStats: any }>('/database-admin/connection-pool');
    },
  });

  return {
    health: healthData?.health,
    isHealthy: healthData?.isHealthy,
    needsMaintenance: healthData?.needsMaintenance,
    isLoadingHealth,
    slowQueries: slowQueriesData?.slowQueries || [],
    isLoadingSlowQueries,
    runMaintenance: maintenanceMutation.mutate,
    isRunningMaintenance: maintenanceMutation.isPending,
    connectionPool: poolData?.poolStats,
  };
};
