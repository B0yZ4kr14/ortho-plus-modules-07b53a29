import { z } from 'zod';

// Schemas Zod
export const patientAccountSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  email: z.string().email('Email inválido'),
  senha_hash: z.string().optional(),
  ativo: z.boolean().default(true),
  email_verificado: z.boolean().default(false),
});

export const patientNotificationSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  tipo: z.enum(['CONSULTA_AGENDADA', 'LEMBRETE_CONSULTA', 'ORCAMENTO_DISPONIVEL', 'PAGAMENTO_PENDENTE', 'RESULTADO_EXAME', 'MENSAGEM_CLINICA']),
  titulo: z.string().min(1),
  mensagem: z.string().min(1),
  lida: z.boolean().default(false),
  link_acao: z.string().optional(),
});

export const patientMessageSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  remetente_tipo: z.enum(['PACIENTE', 'CLINICA']),
  remetente_id: z.string().uuid(),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  anexos: z.array(z.object({
    nome: z.string(),
    url: z.string(),
    tipo: z.string(),
  })).optional(),
  lida: z.boolean().default(false),
});

export const patientPreferencesSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  notificacoes_email: z.boolean().default(true),
  notificacoes_sms: z.boolean().default(true),
  notificacoes_whatsapp: z.boolean().default(true),
  notificacoes_push: z.boolean().default(true),
  lembrete_consulta_horas: z.number().default(24),
  idioma: z.string().default('pt-BR'),
  tema: z.string().default('light'),
});

// TypeScript Types
export type PatientAccount = z.infer<typeof patientAccountSchema>;
export type PatientNotification = z.infer<typeof patientNotificationSchema>;
export type PatientMessage = z.infer<typeof patientMessageSchema>;
export type PatientPreferences = z.infer<typeof patientPreferencesSchema>;

export const notificationTypeLabels: Record<string, string> = {
  CONSULTA_AGENDADA: 'Consulta Agendada',
  LEMBRETE_CONSULTA: 'Lembrete de Consulta',
  ORCAMENTO_DISPONIVEL: 'Orçamento Disponível',
  PAGAMENTO_PENDENTE: 'Pagamento Pendente',
  RESULTADO_EXAME: 'Resultado de Exame',
  MENSAGEM_CLINICA: 'Mensagem da Clínica',
};

export const notificationTypeIcons: Record<string, string> = {
  CONSULTA_AGENDADA: 'calendar-check',
  LEMBRETE_CONSULTA: 'bell',
  ORCAMENTO_DISPONIVEL: 'file-text',
  PAGAMENTO_PENDENTE: 'credit-card',
  RESULTADO_EXAME: 'file-check',
  MENSAGEM_CLINICA: 'message-circle',
};
