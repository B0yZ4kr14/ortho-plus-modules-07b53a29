import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimelineEvent {
  id: string;
  type: 'appointment' | 'treatment' | 'budget' | 'status_change';
  title: string;
  description: string;
  date: string;
  icon: string;
}

export function usePatientTimeline(patientId: string | undefined) {
  return useQuery({
    queryKey: ['patient-timeline', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');

      const { data, error } = await supabase.functions.invoke('patient-timeline', {
        body: { patientId }
      });

      if (error) throw error;
      return data.timeline as TimelineEvent[];
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
