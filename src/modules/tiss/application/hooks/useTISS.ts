import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TISSGuide {
  id: string;
  clinic_id: string;
  batch_id?: string;
  guide_number: string;
  patient_id: string;
  insurance_company: string;
  procedure_code: string;
  procedure_name: string;
  amount: number;
  status: 'pendente' | 'enviada' | 'aprovada' | 'glosada';
  service_date: string;
  submission_date?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TISSBatch {
  id: string;
  clinic_id: string;
  batch_number: string;
  insurance_company: string;
  total_guides: number;
  total_amount: number;
  status: 'pendente' | 'enviado' | 'processando' | 'concluido';
  sent_at?: string;
  processed_at?: string;
  created_at: string;
}

export function useTISS() {
  const { user, clinicId } = useAuth();
  const queryClient = useQueryClient();

  const { data: guides = [], isLoading: loadingGuides } = useQuery({
    queryKey: ['tiss-guides', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiss_guides')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as TISSGuide[];
    },
    enabled: !!clinicId,
  });

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ['tiss-batches', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiss_batches')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TISSBatch[];
    },
    enabled: !!clinicId,
  });

  const createGuide = useMutation({
    mutationFn: async (guideData: Partial<TISSGuide> & { patient_id: string; insurance_company: string; procedure_code: string; procedure_name: string; amount: number; service_date: string }) => {
      const guideNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('tiss_guides')
        .insert([{
          clinic_id: clinicId!,
          guide_number: guideNumber,
          patient_id: guideData.patient_id,
          insurance_company: guideData.insurance_company,
          procedure_code: guideData.procedure_code,
          procedure_name: guideData.procedure_name,
          amount: guideData.amount,
          service_date: guideData.service_date,
          status: 'pendente',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiss-guides'] });
      toast.success('Guia TISS criada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar guia: ${error.message}`);
    },
  });

  const createBatch = useMutation({
    mutationFn: async ({ insurance_company, guide_ids }: { insurance_company: string; guide_ids: string[] }) => {
      // Generate batch number
      const batchNumber = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      // Get guides to calculate totals
      const { data: batchGuides, error: guidesError } = await supabase
        .from('tiss_guides')
        .select('*')
        .in('id', guide_ids);

      if (guidesError) throw guidesError;

      const totalAmount = batchGuides.reduce((sum, guide) => sum + guide.amount, 0);

      const { data, error } = await supabase
        .from('tiss_batches')
        .insert([{
          clinic_id: clinicId,
          batch_number: batchNumber,
          insurance_company,
          total_guides: guide_ids.length,
          total_amount: totalAmount,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update guides with batch_id
      await supabase
        .from('tiss_guides')
        .update({ batch_id: data.id, status: 'enviada', submission_date: new Date().toISOString() })
        .in('id', guide_ids);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiss-batches'] });
      queryClient.invalidateQueries({ queryKey: ['tiss-guides'] });
      toast.success('Lote TISS criado e enviado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar lote: ${error.message}`);
    },
  });

  return {
    guides,
    batches,
    isLoading: loadingGuides || loadingBatches,
    createGuide: createGuide.mutate,
    isCreatingGuide: createGuide.isPending,
    createBatch: createBatch.mutate,
    isCreatingBatch: createBatch.isPending,
  };
}
