import { z } from 'zod';

export const tipoHistoricoEnum = z.enum([
  'ANAMNESE',
  'EXAME_CLINICO',
  'DIAGNOSTICO',
  'PRESCRICAO',
  'EVOLUCAO',
  'OBSERVACAO',
]);

export const tipoArquivoEnum = z.enum(['IMAGEM', 'PDF', 'DOCUMENTO']);

export const statusTratamentoEnum = z.enum([
  'PLANEJADO',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'CANCELADO',
]);

export const tipoEvolucaoEnum = z.enum([
  'CONSULTA',
  'PROCEDIMENTO',
  'OBSERVACAO',
  'INTERCORRENCIA',
]);

export const statusDenteEnum = z.enum([
  'NORMAL',
  'CARIADO',
  'RESTAURADO',
  'AUSENTE',
  'IMPLANTE',
  'PROTESE',
  'TRATAMENTO_CANAL',
  'FRATURADO',
  'EM_TRATAMENTO',
]);

export const prontuarioSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  patient_name: z.string(),
  clinic_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const historicoClinicoSchema = z.object({
  id: z.string().uuid(),
  prontuario_id: z.string().uuid(),
  tipo: tipoHistoricoEnum,
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  dados_estruturados: z.any().optional(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const anexoSchema = z.object({
  id: z.string().uuid(),
  prontuario_id: z.string().uuid(),
  historico_id: z.string().uuid().optional(),
  tipo_arquivo: tipoArquivoEnum,
  nome_arquivo: z.string(),
  caminho_storage: z.string(),
  tamanho_bytes: z.number(),
  mime_type: z.string(),
  descricao: z.string().optional(),
  uploaded_by: z.string().uuid(),
  created_at: z.string(),
});

export const tratamentoSchema = z.object({
  id: z.string().uuid(),
  prontuario_id: z.string().uuid(),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  dente_codigo: z.string().optional(),
  procedimento_id: z.string().uuid().optional(),
  status: statusTratamentoEnum,
  data_inicio: z.string(),
  data_conclusao: z.string().optional(),
  valor_estimado: z.number().optional(),
  observacoes: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const evolucaoSchema = z.object({
  id: z.string().uuid(),
  tratamento_id: z.string().uuid(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  tipo: tipoEvolucaoEnum,
  data_evolucao: z.string(),
  created_by: z.string().uuid(),
  created_at: z.string(),
});

export const odontogramaSchema = z.object({
  id: z.string().uuid(),
  prontuario_id: z.string().uuid(),
  dente_codigo: z.string().regex(/^[1-8][1-8]$/),
  status: statusDenteEnum,
  faces_afetadas: z.array(z.string()).optional(),
  observacoes: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const assinaturaSchema = z.object({
  id: z.string().uuid(),
  prontuario_id: z.string().uuid(),
  historico_id: z.string().uuid().optional(),
  tipo_documento: z.enum([
    'ANAMNESE',
    'TERMO_CONSENTIMENTO',
    'PLANO_TRATAMENTO',
    'ATESTADO',
    'RECEITA',
    'OUTROS',
  ]),
  assinatura_base64: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  signed_by: z.string().uuid(),
  signed_at: z.string(),
});

export type Prontuario = z.infer<typeof prontuarioSchema>;
export type HistoricoClinico = z.infer<typeof historicoClinicoSchema>;
export type Anexo = z.infer<typeof anexoSchema>;
export type Tratamento = z.infer<typeof tratamentoSchema>;
export type Evolucao = z.infer<typeof evolucaoSchema>;
export type Odontograma = z.infer<typeof odontogramaSchema>;
export type Assinatura = z.infer<typeof assinaturaSchema>;
export type TipoHistorico = z.infer<typeof tipoHistoricoEnum>;
export type StatusTratamento = z.infer<typeof statusTratamentoEnum>;
export type StatusDente = z.infer<typeof statusDenteEnum>;
