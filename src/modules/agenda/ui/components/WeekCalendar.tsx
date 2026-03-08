import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAgenda } from "../../presentation/contexts/AgendaContext";
import { Appointment } from "../../domain/entities/Appointment";

interface WeekCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

export function WeekCalendar({
  appointments,
  onAppointmentClick,
}: WeekCalendarProps) {
  const { weekStart, goToPreviousWeek, goToNextWeek, goToToday } = useAgenda();

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = apt.scheduledDatetime;
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            aria-label="anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            aria-label="Hoje"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            aria-label="próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm font-medium">
          {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} -{" "}
          {format(addDays(weekStart, 6), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-2 text-xs font-medium"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-2 text-center border-l">
              <div className="text-xs font-medium">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className="text-sm">{format(day, "dd")}</div>
            </div>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b hover:bg-muted/30"
            >
              <div className="p-2 text-xs text-muted-foreground border-r">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="p-1 border-l min-h-[60px]"
                  >
                    {dayAppointments.map((apt) => (
                      <Card
                        key={apt.id}
                        data-testid="appointment-item"
                        className="p-2 mb-1 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onAppointmentClick?.(apt)}
                      >
                        <div className="text-xs font-medium truncate">
                          {format(apt.scheduledDatetime, "HH:mm")}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Paciente: {apt.patientId.slice(0, 8)}
                        </div>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
