import { z } from 'zod';

// Appointment validation schema
export const appointmentSchema = z.object({
  id: z.string().optional(),
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  pacienteNome: z.string().min(1, 'Nome do paciente é obrigatório'),
  dentistaId: z.string().min(1, 'Dentista é obrigatório'),
  dentistaNome: z.string().min(1, 'Nome do dentista é obrigatório'),
  data: z.string().min(1, 'Data é obrigatória'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inicial inválida'),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, 'Hora final inválida'),
  procedimento: z.string().min(3, 'Procedimento deve ter no mínimo 3 caracteres'),
  status: z.enum(['Agendada', 'Confirmada', 'Realizada', 'Cancelada', 'Faltou']).default('Agendada'),
  observacoes: z.string().optional(),
  lembreteEnviado: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export interface AppointmentFilters {
  search?: string;
  status?: string;
  dentistaId?: string;
  data?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  appointment: Appointment;
}

// Dentista type
export interface Dentista {
  id: string;
  nome: string;
  especialidade?: string;
  cor?: string; // Para identificação visual no calendário
}

// Horários disponíveis
export interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
}
