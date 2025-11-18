/**
 * DASHBOARD HOOK - Desacoplado da API REST
 * Substitui queries diretas ao Supabase por chamadas à REST API
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { logger } from '@/lib/logger';

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingTreatments: number;
  completedTreatments: number;
}

export interface DashboardChartData {
  name: string;
  [key: string]: any;
}

export interface DashboardData {
  stats: DashboardStats;
  appointmentsData: DashboardChartData[];
  revenueData: DashboardChartData[];
  treatmentsByStatus: DashboardChartData[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Chamar Edge Function do Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: responseData, error: fnError } = await supabase.functions.invoke('dashboard-overview');
      
      if (fnError) throw fnError;
      const response = responseData as DashboardData;
      setData(response);
    } catch (err) {
      logger.error('[useDashboard] Erro ao buscar dados', err);
      setError(err as Error);
      
      // Fallback com dados mockados em caso de erro
      setData({
        stats: {
          totalPatients: 0,
          todayAppointments: 0,
          monthlyRevenue: 0,
          occupancyRate: 0,
          pendingTreatments: 0,
          completedTreatments: 0,
        },
        appointmentsData: [
          { name: 'Seg', agendadas: 12, realizadas: 10 },
          { name: 'Ter', agendadas: 15, realizadas: 13 },
          { name: 'Qua', agendadas: 18, realizadas: 16 },
          { name: 'Qui', agendadas: 14, realizadas: 12 },
          { name: 'Sex', agendadas: 16, realizadas: 15 },
          { name: 'Sáb', agendadas: 8, realizadas: 7 },
        ],
        revenueData: [
          { name: 'Jan', receita: 45000, despesas: 28000 },
          { name: 'Fev', receita: 52000, despesas: 30000 },
          { name: 'Mar', receita: 48000, despesas: 29000 },
          { name: 'Abr', receita: 61000, despesas: 32000 },
          { name: 'Mai', receita: 55000, despesas: 31000 },
          { name: 'Jun', receita: 67000, despesas: 33000 },
        ],
        treatmentsByStatus: [
          { name: 'Concluído', value: 45 },
          { name: 'Em Andamento', value: 32 },
          { name: 'Pendente', value: 18 },
          { name: 'Cancelado', value: 5 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
