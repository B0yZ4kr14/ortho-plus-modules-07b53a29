import { useState, useEffect } from 'react';
import { Appointment, AppointmentFilters, Dentista } from '../types/agenda.types';
import { toast } from 'sonner';
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'orthoplus_appointments';
const DENTISTAS_KEY = 'orthoplus_dentistas';

// Mock dentistas
const mockDentistas: Dentista[] = [
  { id: '1', nome: 'Dr. Carlos Silva', especialidade: 'Ortodontia', cor: '#3b82f6' },
  { id: '2', nome: 'Dra. Ana Santos', especialidade: 'Endodontia', cor: '#10b981' },
  { id: '3', nome: 'Dr. Pedro Costa', especialidade: 'Implantodontia', cor: '#f59e0b' },
];

// Mock appointments
const mockAppointments: Appointment[] = [
  {
    id: '1',
    pacienteId: '1',
    pacienteNome: 'Maria Silva Santos',
    dentistaId: '1',
    dentistaNome: 'Dr. Carlos Silva',
    data: '2025-11-12',
    horaInicio: '09:00',
    horaFim: '10:00',
    procedimento: 'Limpeza',
    status: 'Confirmada',
    observacoes: 'Paciente prefere atendimento pela manhã',
    lembreteEnviado: true,
    createdAt: '2025-11-01T10:00:00',
    updatedAt: '2025-11-01T10:00:00',
  },
  {
    id: '2',
    pacienteId: '2',
    pacienteNome: 'João Pedro Oliveira',
    dentistaId: '2',
    dentistaNome: 'Dra. Ana Santos',
    data: '2025-11-13',
    horaInicio: '14:00',
    horaFim: '15:30',
    procedimento: 'Restauração',
    status: 'Agendada',
    lembreteEnviado: false,
    createdAt: '2025-11-01T14:00:00',
    updatedAt: '2025-11-01T14:00:00',
  },
  {
    id: '3',
    pacienteId: '1',
    pacienteNome: 'Maria Silva Santos',
    dentistaId: '1',
    dentistaNome: 'Dr. Carlos Silva',
    data: '2025-11-14',
    horaInicio: '10:00',
    horaFim: '11:00',
    procedimento: 'Consulta de retorno',
    status: 'Agendada',
    lembreteEnviado: false,
    createdAt: '2025-11-01T10:00:00',
    updatedAt: '2025-11-01T10:00:00',
  },
];

export function useAgendaStore() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(true);

  // Load appointments from localStorage
  useEffect(() => {
    try {
      const storedAppointments = localStorage.getItem(STORAGE_KEY);
      const storedDentistas = localStorage.getItem(DENTISTAS_KEY);
      
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      } else {
        setAppointments(mockAppointments);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAppointments));
      }

      if (storedDentistas) {
        setDentistas(JSON.parse(storedDentistas));
      } else {
        setDentistas(mockDentistas);
        localStorage.setItem(DENTISTAS_KEY, JSON.stringify(mockDentistas));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAppointments = (updatedAppointments: Appointment[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error('Error saving appointments:', error);
      toast.error('Erro ao salvar agendamentos');
      throw error;
    }
  };

  const addAppointment = (appointment: Appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveAppointments([...appointments, newAppointment]);
    toast.success('Consulta agendada com sucesso');
    return newAppointment;
  };

  const updateAppointment = (id: string, appointment: Partial<Appointment>) => {
    const updated = appointments.map(a =>
      a.id === id ? { ...a, ...appointment, updatedAt: new Date().toISOString() } : a
    );
    saveAppointments(updated);
    toast.success('Consulta atualizada com sucesso');
  };

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    saveAppointments(updated);
    toast.success('Consulta removida com sucesso');
  };

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

  const enviarLembrete = (id: string) => {
    updateAppointment(id, { lembreteEnviado: true });
    toast.success('Lembrete enviado com sucesso');
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
  };
}
