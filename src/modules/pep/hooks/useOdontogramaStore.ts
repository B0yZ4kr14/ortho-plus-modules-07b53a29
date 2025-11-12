import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Odontograma, StatusDente } from '../types/pep.types';
import { toast } from 'sonner';

export function useOdontogramaStore() {
  const [odontograma, setOdontograma] = useState<Odontograma[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOdontograma = useCallback(async (prontuarioId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pep_odontograma')
        .select('*')
        .eq('prontuario_id', prontuarioId);

      if (error) throw error;
      setOdontograma(data as Odontograma[] || []);
    } catch (error: any) {
      console.error('Error fetching odontograma:', error);
      toast.error('Erro ao carregar odontograma');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDente = useCallback(async (
    prontuarioId: string,
    denteCodigo: string,
    status: StatusDente,
    facesAfetadas?: string[],
    observacoes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if dente already exists
      const { data: existing } = await supabase
        .from('pep_odontograma')
        .select('id')
        .eq('prontuario_id', prontuarioId)
        .eq('dente_codigo', denteCodigo)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('pep_odontograma')
          .update({
            status,
            faces_afetadas: facesAfetadas,
            observacoes,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('pep_odontograma')
          .insert({
            prontuario_id: prontuarioId,
            dente_codigo: denteCodigo,
            status,
            faces_afetadas: facesAfetadas,
            observacoes,
            created_by: user.id,
          });

        if (error) throw error;
      }

      toast.success('Odontograma atualizado!');
      await fetchOdontograma(prontuarioId);
    } catch (error: any) {
      console.error('Error updating dente:', error);
      toast.error('Erro ao atualizar dente');
    }
  }, [fetchOdontograma]);

  const getStatusDente = useCallback((denteCodigo: string): StatusDente => {
    const dente = odontograma.find(d => d.dente_codigo === denteCodigo);
    return dente?.status || 'NORMAL';
  }, [odontograma]);

  return {
    odontograma,
    loading,
    fetchOdontograma,
    updateDente,
    getStatusDente,
  };
}
