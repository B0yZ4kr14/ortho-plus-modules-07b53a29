import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableTimeSlotProps {
  timeSlot: string;
  dentistId: string;
  date: Date;
  children?: React.ReactNode;
  onDrop?: (appointmentId: string, newTime: string, dentistId: string) => void;
}

export function DroppableTimeSlot({
  timeSlot,
  dentistId,
  date,
  children,
}: DroppableTimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${dentistId}-${timeSlot}`,
    data: {
      timeSlot,
      dentistId,
      date,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[80px] p-2 border-b border-border/50 transition-colors',
        isOver && 'bg-primary/10 border-primary'
      )}
    >
      {children}
    </div>
  );
}
