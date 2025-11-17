import { useState } from 'react';
import { useAgendaSupabase } from '@/modules/agenda/hooks/useAgendaSupabase';
import { usePatientsSupabase } from '@/modules/pacientes/hooks/usePatientsSupabase';
import { AgendaCalendar } from '@/modules/agenda/components/AgendaCalendar';
import { AppointmentForm } from '@/modules/agenda/components/AppointmentForm';
import { AppointmentDetails } from '@/modules/agenda/components/AppointmentDetails';
import { Appointment } from '@/modules/agenda/types/agenda.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';

type ViewMode = 'calendar' | 'form' | 'details';

export default function AgendaClinica() {
  const { 
    appointments, 
    dentistas, 
    loading, 
    addAppointment, 
    updateAppointment, 
    enviarLembrete 
  } = useAgendaSupabase();
  
  const { patients } = usePatientsSupabase();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string>();
  const [initialTime, setInitialTime] = useState<string>();

  const handleAdd = (date?: string, time?: string) => {
    setSelectedAppointment(undefined);
    setInitialDate(date);
    setInitialTime(time);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setInitialDate(undefined);
    setInitialTime(undefined);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewMode('details');
    setDialogOpen(true);
  };

  const handleSubmit = (data: Appointment) => {
    if (selectedAppointment?.id) {
      updateAppointment(selectedAppointment.id, data);
    } else {
      addAppointment(data);
    }
    setDialogOpen(false);
    setSelectedAppointment(undefined);
    setInitialDate(undefined);
    setInitialTime(undefined);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedAppointment(undefined);
    setInitialDate(undefined);
    setInitialTime(undefined);
  };

  const handleSendReminder = () => {
    if (selectedAppointment?.id) {
      enviarLembrete(selectedAppointment.id);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando agenda...</p>
      </div>
    );
  }

  const pacientesOptions = patients.map(p => ({ id: p.id!, nome: p.full_name }));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda Clínica</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de consultas e agendamentos
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <AgendaCalendar
        appointments={appointments}
        onAppointmentClick={handleView}
        onAddAppointment={handleAdd}
      />

      {/* Dialog for Form and Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'form'
                ? selectedAppointment
                  ? 'Editar Consulta'
                  : 'Nova Consulta'
                : 'Detalhes da Consulta'}
            </DialogTitle>
          </DialogHeader>

          {viewMode === 'form' && (
            <AppointmentForm
              appointment={selectedAppointment}
              dentistas={dentistas}
              pacientes={pacientesOptions}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialDate={initialDate}
              initialTime={initialTime}
            />
          )}

          {viewMode === 'details' && selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onEdit={() => setViewMode('form')}
              onClose={handleCancel}
              onSendReminder={handleSendReminder}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
