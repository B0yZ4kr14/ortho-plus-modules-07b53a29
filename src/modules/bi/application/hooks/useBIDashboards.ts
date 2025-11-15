import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBIDashboards = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['bi-dashboards', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('bi_dashboards')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: metrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['bi-metrics', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('bi_metrics')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const createDashboard = useMutation({
    mutationFn: async (dashboardData: any) => {
      const { data, error } = await supabase
        .from('bi_dashboards')
        .insert([{ 
          ...dashboardData, 
          clinic_id: clinicId,
          created_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bi-dashboards', clinicId] });
      toast.success('Dashboard criado!');
    },
    onError: () => {
      toast.error('Erro ao criar dashboard');
    },
  });

  return {
    dashboards,
    metrics,
    isLoading: isLoading || isLoadingMetrics,
    createDashboard: createDashboard.mutate,
  };
};
