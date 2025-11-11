import { Appointment } from '../types/agenda.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Calendar, Clock, User, Stethoscope, FileText, Bell } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onEdit: () => void;
  onClose: () => void;
  onSendReminder?: () => void;
}

export function AppointmentDetails({ 
  appointment, 
  onEdit, 
  onClose,
  onSendReminder 
}: AppointmentDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return 'default';
      case 'Agendada':
        return 'outline';
      case 'Realizada':
        return 'secondary';
      case 'Cancelada':
        return 'destructive';
      case 'Faltou':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Agendada': 'Agendada',
      'Confirmada': 'Confirmada',
      'Realizada': 'Realizada',
      'Cancelada': 'Cancelada',
      'Faltou': 'Paciente Faltou',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{appointment.pacienteNome}</h2>
            <Badge variant={getStatusColor(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Agendado em {format(parseISO(appointment.createdAt!), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Fechar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Informações da Consulta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">
                {format(parseISO(appointment.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-medium">
                {appointment.horaInicio} às {appointment.horaFim}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-5 w-5" />
              Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Dentista Responsável</p>
              <p className="font-medium">{appointment.dentistaNome}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Procedimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{appointment.procedimento}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5" />
              Lembrete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Status do Lembrete</p>
              <p className="font-medium">
                {appointment.lembreteEnviado ? 'Enviado' : 'Não enviado'}
              </p>
            </div>
            {!appointment.lembreteEnviado && onSendReminder && (
              <Button 
                onClick={onSendReminder} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enviar Lembrete
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      {appointment.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{appointment.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID da Consulta:</span>
            <span className="font-medium">{appointment.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cadastrado em:</span>
            <span className="font-medium">
              {format(parseISO(appointment.createdAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última atualização:</span>
            <span className="font-medium">
              {format(parseISO(appointment.updatedAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
