import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useInadimplentes = () => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: inadimplentes = [], isLoading } = useQuery({
    queryKey: ['inadimplentes', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('inadimplentes')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('valor_total_devido', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const { data: campanhas = [], isLoading: isLoadingCampanhas } = useQuery({
    queryKey: ['campanhas-inadimplencia', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('campanhas_inadimplencia')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const iniciarCobranca = useMutation({
    mutationFn: async ({ inadimplenteId, tipo }: { inadimplenteId: string; tipo: string }) => {
      const { data, error } = await supabase
        .from('campanhas_inadimplencia')
        .insert([{
          clinic_id: clinicId,
          inadimplente_id: inadimplenteId,
          tipo_campanha: tipo,
          status: 'ATIVA',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas-inadimplencia', clinicId] });
      toast.success('Cobrança iniciada!');
    },
    onError: () => {
      toast.error('Erro ao iniciar cobrança');
    },
  });

  return {
    inadimplentes,
    campanhas,
    isLoading: isLoading || isLoadingCampanhas,
    iniciarCobranca: iniciarCobranca.mutate,
  };
};
