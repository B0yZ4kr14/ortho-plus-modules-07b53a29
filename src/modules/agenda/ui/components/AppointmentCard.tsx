import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Appointment } from "../../domain/entities/Appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  isLoading?: boolean;
}

const statusColors = {
  AGENDADO: "bg-blue-500/10 text-blue-700 border-blue-200",
  CONFIRMADO: "bg-green-500/10 text-green-700 border-green-200",
  REALIZADO: "bg-gray-500/10 text-gray-700 border-gray-200",
  CANCELADO: "bg-red-500/10 text-red-700 border-red-200",
  FALTOU: "bg-orange-500/10 text-orange-700 border-orange-200",
};

const statusLabels = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  REALIZADO: "Realizado",
  CANCELADO: "Cancelado",
  FALTOU: "Faltou",
};

export function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
  onReschedule,
  isLoading,
}: AppointmentCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow"
      data-testid="appointment-item"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(appointment.scheduledDatetime, "dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(appointment.scheduledDatetime, "HH:mm")} -{" "}
                {format(appointment.endDatetime, "HH:mm")}
              </span>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[appointment.status]}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Paciente ID: {appointment.patientId}</span>
        </div>

        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{appointment.appointmentType}</span>
        </div>

        {appointment.notes && (
          <p className="text-sm text-muted-foreground">{appointment.notes}</p>
        )}

        <div className="flex gap-2 pt-2">
          {appointment.canBeConfirmed && onConfirm && (
            <Button size="sm" onClick={onConfirm} disabled={isLoading}>
              Confirmar
            </Button>
          )}
          {appointment.canBeRescheduled && onReschedule && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReschedule}
              disabled={isLoading}
            >
              Reagendar
            </Button>
          )}
          {appointment.canBeCancelled && onCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
