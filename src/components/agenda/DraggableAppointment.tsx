import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DraggableAppointmentProps {
  appointment: {
    id: string;
    patientName: string;
    startTime: string;
    endTime: string;
    status: string;
    treatmentType?: string;
  };
}

export function DraggableAppointment({ appointment }: DraggableAppointmentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: appointment,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
      }
    : undefined;

  const statusColors = {
    AGENDADO: 'bg-blue-100 text-blue-800 border-blue-200',
    CONFIRMADO: 'bg-green-100 text-green-800 border-green-200',
    EM_ATENDIMENTO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONCLUIDO: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELADO: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 cursor-move hover:shadow-lg transition-shadow
        ${isDragging ? 'opacity-50 shadow-2xl' : ''}
        ${statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-50'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3 w-3 flex-shrink-0" />
            <p className="font-medium text-sm truncate">{appointment.patientName}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {format(new Date(appointment.startTime), 'HH:mm', { locale: ptBR })} -{' '}
              {format(new Date(appointment.endTime), 'HH:mm', { locale: ptBR })}
            </span>
          </div>
          {appointment.treatmentType && (
            <Badge variant="outline" className="mt-2 text-xs">
              {appointment.treatmentType}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
