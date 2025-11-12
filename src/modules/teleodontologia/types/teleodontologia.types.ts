import { z } from 'zod';

export const teleconsultaSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  dentist_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  titulo: z.string().min(1, 'Título é obrigatório'),
  tipo: z.enum(['VIDEO', 'AUDIO', 'CHAT']),
  status: z.enum(['AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'NAO_COMPARECEU']).default('AGENDADA'),
  data_agendada: z.string(),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
  diagnostico: z.string().optional(),
  conduta: z.string().optional(),
  observacoes: z.string().optional(),
});

export const prescricaoRemotaSchema = z.object({
  id: z.string().uuid().optional(),
  teleconsulta_id: z.string().uuid(),
  tipo: z.enum(['MEDICAMENTO', 'PROCEDIMENTO', 'RECOMENDACAO']),
  descricao: z.string().min(1),
  medicamento_nome: z.string().optional(),
  medicamento_dosagem: z.string().optional(),
  medicamento_frequencia: z.string().optional(),
  medicamento_duracao: z.string().optional(),
  instrucoes: z.string().optional(),
});

export const triagemSchema = z.object({
  id: z.string().uuid().optional(),
  teleconsulta_id: z.string().uuid(),
  sintomas: z.array(z.string()),
  intensidade_dor: z.number().min(0).max(10),
  tempo_sintoma: z.string(),
  alergias: z.string().optional(),
  medicamentos_uso: z.string().optional(),
  fotos_anexas: z.array(z.object({
    url: z.string(),
    descricao: z.string(),
  })).optional(),
});

export type Teleconsulta = z.infer<typeof teleconsultaSchema>;
export type PrescricaoRemota = z.infer<typeof prescricaoRemotaSchema>;
export type Triagem = z.infer<typeof triagemSchema>;

export interface TeleconsultaComplete extends Omit<Teleconsulta, 'id' | 'clinic_id' | 'patient_id' | 'dentist_id' | 'appointment_id'> {
  id?: string;
  clinic_id?: string;
  patient_id?: string;
  dentist_id?: string;
  appointment_id?: string;
  patient_name?: string;
  dentist_name?: string;
  link_sala?: string;
  duracao_minutos?: number;
  prescricoes?: PrescricaoRemota[];
  triagem?: Triagem;
}

export const statusLabels: Record<string, string> = {
  AGENDADA: 'Agendada',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  NAO_COMPARECEU: 'Não Compareceu',
};

export const tipoLabels: Record<string, string> = {
  VIDEO: 'Videochamada',
  AUDIO: 'Áudio',
  CHAT: 'Chat',
};
