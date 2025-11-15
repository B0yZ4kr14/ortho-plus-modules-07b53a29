import { DragEndEvent } from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export function useAppointmentDragAndDrop() {
  const { toast } = useToast();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const appointmentId = active.id as string;
    const { timeSlot, dentistId, date } = over.data.current as {
      timeSlot: string;
      dentistId: string;
      date: Date;
    };

    try {
      // Calcular novo horário
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const newStartTime = new Date(date);
      newStartTime.setHours(hours, minutes, 0, 0);

      // Assumir duração de 1 hora por padrão
      const newEndTime = new Date(newStartTime);
      newEndTime.setHours(newEndTime.getHours() + 1);

      // Atualizar no banco
      const { error } = await supabase
        .from('appointments')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          dentist_id: dentistId,
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: 'Consulta reagendada',
        description: `Novo horário: ${format(newStartTime, 'dd/MM/yyyy HH:mm')}`,
      });
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      toast({
        title: 'Erro ao reagendar',
        description: 'Não foi possível mover a consulta. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return { handleDragEnd };
}
