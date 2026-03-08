import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, FileText, Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: { appointmentId: string; notes?: string }) => void;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (data: { appointmentId: string; reason?: string }) => void;
  isUpdating?: boolean;
}

const statusColors: Record<string, string> = {
  AGENDADO: 'bg-blue-500/10 text-blue-700 border-blue-200',
  CONFIRMADO: 'bg-green-500/10 text-green-700 border-green-200',
  REALIZADO: 'bg-gray-500/10 text-gray-700 border-gray-200',
  CANCELADO: 'bg-red-500/10 text-red-700 border-red-200',
  FALTOU: 'bg-orange-500/10 text-orange-700 border-orange-200',
};

const statusLabels: Record<string, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmada',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
  FALTOU: 'Faltou',
};

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  onUpdate,
  onConfirm,
  onCancel,
  isUpdating,
}: AppointmentDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('AGENDADO');

  const handleEdit = () => {
    if (appointment) {
      setNotes(appointment.notes || '');
      setStatus(appointment.status);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (appointment && onUpdate) {
      onUpdate({
        appointmentId: appointment.id,
        notes,
      });

      if (status === 'CONFIRMADO' && appointment.status !== 'CONFIRMADO' && onConfirm) {
        onConfirm(appointment.id);
      }

      setIsEditing(false);
    }
  };

  const handleSendReminder = () => {
    toast.success('Lembrete enviado com sucesso');
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(appointment.scheduledDatetime, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <Badge variant="outline" className={statusColors[appointment.status]}>
              {statusLabels[appointment.status]}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(appointment.scheduledDatetime, 'HH:mm')} -{' '}
              {format(appointment.endDatetime, 'HH:mm')}
              {' '}({appointment.durationMinutes} min)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Paciente: {appointment.patientId}</span>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{appointment.appointmentType}</span>
          </div>

          {isEditing ? (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observações</Label>
                <Textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENDADO">Agendado</SelectItem>
                    <SelectItem value="CONFIRMADO">Confirmada</SelectItem>
                    <SelectItem value="REALIZADO">Realizado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    <SelectItem value="FALTOU">Faltou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            appointment.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            )
          )}
        </div>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminder}
          >
            <Bell className="mr-2 h-4 w-4" />
            Lembrete
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  Salvar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                Editar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
