import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLGPDRequests = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['lgpd-requests', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('lgpd_data_requests')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: consents = [], isLoading: isLoadingConsents } = useQuery({
    queryKey: ['lgpd-consents', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('lgpd_consents')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const createRequest = useMutation({
    mutationFn: async (requestData: any) => {
      const { data, error } = await supabase
        .from('lgpd_data_requests')
        .insert([{ 
          ...requestData, 
          clinic_id: clinicId,
          requested_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lgpd-requests', clinicId] });
      toast.success('Solicitação criada!');
    },
    onError: () => {
      toast.error('Erro ao criar solicitação');
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('lgpd_data_requests')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lgpd-requests', clinicId] });
      toast.success('Status atualizado!');
    },
  });

  return {
    requests,
    consents,
    isLoading: isLoading || isLoadingConsents,
    createRequest: createRequest.mutate,
    updateRequestStatus: updateRequestStatus.mutate,
  };
};
