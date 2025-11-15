import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSplitConfig = () => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['split-config', clinicId],
    queryFn: async () => {
      if (!clinicId) return null;
      
      const { data, error } = await supabase
        .from('split_payment_config')
        .select('*')
        .eq('clinic_id', clinicId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['split-transactions', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('split_transactions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const saveConfig = useMutation({
    mutationFn: async (configData: any) => {
      const { data, error } = await supabase
        .from('split_payment_config')
        .upsert([{ ...configData, clinic_id: clinicId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-config', clinicId] });
      toast.success('Configuração salva!');
    },
    onError: () => {
      toast.error('Erro ao salvar configuração');
    },
  });

  return {
    config,
    transactions,
    isLoading: isLoading || isLoadingTransactions,
    saveConfig: saveConfig.mutate,
  };
};
