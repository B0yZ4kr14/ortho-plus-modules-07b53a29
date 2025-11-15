import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTeleconsultas = () => {
  const { clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: teleconsultas = [], isLoading } = useQuery({
    queryKey: ['teleconsultas', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('teleconsultas')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('data_agendada', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  const createTeleconsulta = useMutation({
    mutationFn: async (teleconsulta: any) => {
      const { data, error } = await supabase
        .from('teleconsultas')
        .insert([{ ...teleconsulta, clinic_id: clinicId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teleconsultas', clinicId] });
      toast.success('Teleconsulta agendada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao agendar teleconsulta');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('teleconsultas')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teleconsultas', clinicId] });
      toast.success('Status atualizado!');
    },
  });

  return {
    teleconsultas,
    isLoading,
    createTeleconsulta: createTeleconsulta.mutate,
    updateStatus: updateStatus.mutate,
  };
};
