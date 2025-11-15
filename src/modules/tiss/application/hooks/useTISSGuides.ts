import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTISSGuides = () => {
  const { clinicId, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['tiss-guides', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('tiss_guides')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('data_atendimento', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['tiss-batches', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('tiss_batches')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const createGuide = useMutation({
    mutationFn: async (guideData: any) => {
      const { data, error } = await supabase
        .from('tiss_guides')
        .insert([{ 
          ...guideData, 
          clinic_id: clinicId,
          created_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiss-guides', clinicId] });
      toast.success('Guia TISS criada!');
    },
    onError: () => {
      toast.error('Erro ao criar guia');
    },
  });

  const createBatch = useMutation({
    mutationFn: async (guideIds: string[]) => {
      const { data, error } = await supabase
        .from('tiss_batches')
        .insert([{ 
          clinic_id: clinicId,
          guide_ids: guideIds,
          status: 'PENDENTE',
          batch_number: `LOTE-${Date.now()}`,
          insurance_company: 'A_DEFINIR',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiss-batches', clinicId] });
      toast.success('Lote criado!');
    },
    onError: () => {
      toast.error('Erro ao criar lote');
    },
  });

  return {
    guides,
    batches,
    isLoading: isLoading || isLoadingBatches,
    createGuide: createGuide.mutate,
    createBatch: createBatch.mutate,
  };
};
