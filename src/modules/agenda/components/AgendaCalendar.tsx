import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '../types/agenda.types';
import { cn } from '@/lib/utils';

interface AgendaCalendarProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAddAppointment: (date: string, hora?: string) => void;
}

export function AgendaCalendar({ 
  appointments, 
  onAppointmentClick,
  onAddAppointment 
}: AgendaCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const weekStart = startOfWeek(currentDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const horarios = Array.from({ length: 13 }, (_, i) => {
    const hora = i + 8; // 8h às 20h
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  const getAppointmentsForDateTime = (date: Date, hora: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => {
      if (apt.data !== dateStr) return false;
      const [horaInicio] = apt.horaInicio.split(':');
      const [horaSlot] = hora.split(':');
      return horaInicio === horaSlot;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return 'bg-green-500/20 border-green-500 text-green-700';
      case 'Agendada':
        return 'bg-blue-500/20 border-blue-500 text-blue-700';
      case 'Realizada':
        return 'bg-gray-500/20 border-gray-500 text-gray-700';
      case 'Cancelada':
        return 'bg-red-500/20 border-red-500 text-red-700';
      case 'Faltou':
        return 'bg-orange-500/20 border-orange-500 text-orange-700';
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-700';
    }
  };

  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(weekStart, 'MMMM yyyy', { locale: ptBR })}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Dia
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div className="text-sm font-medium text-muted-foreground"></div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "text-center p-2 rounded-lg",
                    isSameDay(day, new Date()) && "bg-primary/10"
                  )}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    isSameDay(day, new Date()) && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-1">
              {horarios.map((hora) => (
                <div key={hora} className="grid grid-cols-8 gap-2">
                  <div className="text-sm text-muted-foreground font-medium py-2">
                    {hora}
                  </div>
                  {weekDays.map((day) => {
                    const dayAppointments = getAppointmentsForDateTime(day, hora);
                    const dateStr = format(day, 'yyyy-MM-dd');
                    
                    return (
                      <div
                        key={`${day.toISOString()}-${hora}`}
                        className="min-h-[60px] border border-border rounded-lg p-1 hover:bg-accent/50 transition-colors relative group"
                      >
                        {dayAppointments.length > 0 ? (
                          dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => onAppointmentClick(apt)}
                              className={cn(
                                "text-xs p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity",
                                getStatusColor(apt.status)
                              )}
                            >
                              <div className="font-medium truncate">{apt.pacienteNome}</div>
                              <div className="text-xs opacity-80 truncate">{apt.procedimento}</div>
                              <div className="text-xs opacity-60">
                                {apt.horaInicio} - {apt.horaFim}
                              </div>
                            </div>
                          ))
                        ) : (
                          <button
                            onClick={() => onAddAppointment(dateStr, hora)}
                            className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500"></div>
          <span>Agendada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500"></div>
          <span>Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500/20 border border-gray-500"></div>
          <span>Realizada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500"></div>
          <span>Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500"></div>
          <span>Faltou</span>
        </div>
      </div>
    </div>
  );
}
