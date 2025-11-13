import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import type { Appointment, AppointmentFilters, Dentista } from '../types/agenda.types';

export function useAgendaSupabase() {
  const { user, selectedClinic } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(true);

  // ============= LOAD APPOINTMENTS =============
  const loadAppointments = async () => {
    if (!user || !selectedClinic) {
      setLoading(false);
      return;
    }

    try {
      const clinicId = typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id;
      
      // @ts-ignore
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:prontuarios!patient_id(
            patient_id,
            profiles!prontuarios_patient_id_fkey(full_name)
          ),
          dentist:profiles!dentist_id(full_name)
        `)
        .eq('clinic_id', clinicId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform Supabase data to Appointment format
      const transformedAppointments: Appointment[] = (data || []).map((apt: any) => {
        const startDate = new Date(apt.start_time);
        const endDate = new Date(apt.end_time);
        
        return {
          id: apt.id,
          pacienteId: apt.patient_id,
          pacienteNome: apt.patient?.profiles?.full_name || 'Paciente',
          dentistaId: apt.dentist_id,
          dentistaNome: apt.dentist?.full_name || 'Dentista',
          data: startDate.toISOString().split('T')[0],
          horaInicio: startDate.toTimeString().slice(0, 5),
          horaFim: endDate.toTimeString().slice(0, 5),
          procedimento: apt.title || '',
          status: apt.status === 'agendado' ? 'Agendada' : 
                  apt.status === 'confirmado' ? 'Confirmada' :
                  apt.status === 'cancelado' ? 'Cancelada' :
                  apt.status === 'concluido' ? 'Realizada' : 'Agendada',
          observacoes: apt.description || '',
          lembreteEnviado: apt.reminder_sent || false,
          createdAt: apt.created_at,
          updatedAt: apt.updated_at,
        };
      });

      setAppointments(transformedAppointments);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast.error('Erro ao carregar agendamentos: ' + error.message);
    }
  };

  // ============= LOAD DENTISTAS =============
  const loadDentistas = async () => {
    if (!selectedClinic) return;

    try {
      const clinicId = typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id;
      
      // @ts-ignore
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('clinic_id', clinicId)
        .eq('app_role', 'MEMBER')
        .order('full_name', { ascending: true });

      if (error) throw error;

      const transformedDentistas: Dentista[] = (data || []).map((dentista: any, index: number) => ({
        id: dentista.id,
        nome: dentista.full_name || 'Dentista',
        especialidade: 'Odontologia',
        cor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
      }));

      setDentistas(transformedDentistas);
    } catch (error: any) {
      console.error('Error loading dentistas:', error);
      toast.error('Erro ao carregar dentistas: ' + error.message);
    }
  };

  // ============= INITIAL LOAD & REALTIME =============
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadAppointments(), loadDentistas()]);
      setLoading(false);
    };

    if (user && selectedClinic) {
      loadAll();

      // Realtime subscription for appointments
      const appointmentsChannel = supabase
        .channel('appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `clinic_id=eq.${selectedClinic}`,
          },
          () => {
            loadAppointments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(appointmentsChannel);
      };
    }
  }, [user, selectedClinic]);

  // ============= CRUD OPERATIONS =============
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !selectedClinic) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const clinicId = typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id;
      const startDateTime = new Date(`${appointment.data}T${appointment.horaInicio}`);
      const endDateTime = new Date(`${appointment.data}T${appointment.horaFim}`);

      const statusMap: Record<string, string> = {
        'Agendada': 'agendado',
        'Confirmada': 'confirmado',
        'Cancelada': 'cancelado',
        'Realizada': 'concluido',
      };

      // @ts-ignore - Tabela criada via migration
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          clinic_id: clinicId,
          patient_id: appointment.pacienteId,
          dentist_id: appointment.dentistaId,
          title: appointment.procedimento,
          description: appointment.observacoes || '',
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: statusMap[appointment.status] || 'agendado',
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Consulta agendada com sucesso!');
      await loadAppointments();
      return data;
    } catch (error: any) {
      console.error('Error adding appointment:', error);
      toast.error('Erro ao agendar consulta: ' + error.message);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!selectedClinic) return;

    try {
      const clinicId = typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id;
      const updateData: any = {};

      if (updates.data && updates.horaInicio) {
        const startDateTime = new Date(`${updates.data}T${updates.horaInicio}`);
        updateData.start_time = startDateTime.toISOString();
      }

      if (updates.data && updates.horaFim) {
        const endDateTime = new Date(`${updates.data}T${updates.horaFim}`);
        updateData.end_time = endDateTime.toISOString();
      }

      if (updates.procedimento) {
        updateData.title = updates.procedimento;
      }

      if (updates.observacoes !== undefined) {
        updateData.description = updates.observacoes;
      }

      if (updates.status) {
        const statusMap: Record<string, string> = {
          'Agendada': 'agendado',
          'Confirmada': 'confirmado',
          'Cancelada': 'cancelado',
          'Realizada': 'concluido',
        };
        updateData.status = statusMap[updates.status] || 'agendado';
      }

      if (updates.dentistaId) {
        updateData.dentist_id = updates.dentistaId;
      }

      // @ts-ignore
      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      toast.success('Consulta atualizada com sucesso!');
      await loadAppointments();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao atualizar consulta: ' + error.message);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!selectedClinic) return;

    try {
      const clinicId = typeof selectedClinic === 'string' ? selectedClinic : selectedClinic.id;
      
      // @ts-ignore
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      toast.success('Consulta removida com sucesso!');
      await loadAppointments();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast.error('Erro ao remover consulta: ' + error.message);
      throw error;
    }
  };

  // ============= QUERY OPERATIONS =============
  const getAppointment = (id: string) => {
    return appointments.find(a => a.id === id);
  };

  const getAppointmentsByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.data === dateStr);
  };

  const getAppointmentsByDateRange = (startDate: Date, endDate: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.data);
      return isWithinInterval(appointmentDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate),
      });
    });
  };

  const filterAppointments = (filters: AppointmentFilters) => {
    return appointments.filter(appointment => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !appointment.pacienteNome.toLowerCase().includes(searchLower) &&
          !appointment.dentistaNome.toLowerCase().includes(searchLower) &&
          !appointment.procedimento.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.status && appointment.status !== filters.status) {
        return false;
      }
      if (filters.dentistaId && appointment.dentistaId !== filters.dentistaId) {
        return false;
      }
      if (filters.data && appointment.data !== filters.data) {
        return false;
      }
      return true;
    });
  };

  const enviarLembrete = async (id: string) => {
    await updateAppointment(id, { lembreteEnviado: true } as any);
    toast.success('Lembrete enviado com sucesso!');
  };

  return {
    appointments,
    dentistas,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getAppointmentsByDate,
    getAppointmentsByDateRange,
    filterAppointments,
    enviarLembrete,
    reloadAppointments: loadAppointments,
  };
}