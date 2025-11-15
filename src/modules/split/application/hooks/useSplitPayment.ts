import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SplitConfig {
  id: string;
  clinic_id: string;
  professional_id: string;
  percentage: number;
  procedure_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SplitTransaction {
  id: string;
  clinic_id: string;
  transaction_id: string;
  professional_id: string;
  total_amount: number;
  professional_amount: number;
  clinic_amount: number;
  percentage: number;
  status: 'pending' | 'processed' | 'failed';
  processed_at?: string;
  created_at: string;
}

export function useSplitPayment() {
  const { user, clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['split-configs', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('split_payment_config')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SplitConfig[];
    },
    enabled: !!clinicId,
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['split-transactions', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('split_transactions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SplitTransaction[];
    },
    enabled: !!clinicId,
  });

  const createConfig = useMutation({
    mutationFn: async (configData: Partial<SplitConfig> & { professional_id: string; percentage: number }) => {
      const { data, error } = await supabase
        .from('split_payment_config')
        .insert([{ 
          clinic_id: clinicId!,
          professional_id: configData.professional_id,
          percentage: configData.percentage,
          procedure_type: configData.procedure_type,
          is_active: configData.is_active ?? true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-configs'] });
      toast.success('Configuração de split criada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar configuração: ${error.message}`);
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SplitConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('split_payment_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['split-configs'] });
      toast.success('Configuração atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  return {
    configs,
    transactions,
    isLoading: loadingConfigs || loadingTransactions,
    createConfig: createConfig.mutate,
    isCreating: createConfig.isPending,
    updateConfig: updateConfig.mutate,
    isUpdating: updateConfig.isPending,
  };
}
