import { z } from 'zod';

// Schemas Zod
export const contratoTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo_tratamento: z.string().min(1, 'Tipo de tratamento é obrigatório'),
  conteudo_html: z.string().min(1, 'Conteúdo é obrigatório'),
  variaveis_disponiveis: z.record(z.string()).optional(),
  ativo: z.boolean().default(true),
});

export const contratoSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  orcamento_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  numero_contrato: z.string().min(1),
  titulo: z.string().min(1, 'Título é obrigatório'),
  conteudo_html: z.string().min(1),
  valor_contrato: z.number().min(0),
  data_inicio: z.string(),
  data_termino: z.string().optional(),
  renovacao_automatica: z.boolean().default(false),
  status: z.enum(['AGUARDANDO_ASSINATURA', 'ASSINADO', 'CANCELADO', 'EXPIRADO', 'CONCLUIDO']).default('AGUARDANDO_ASSINATURA'),
});

// TypeScript Types
export type ContratoTemplate = z.infer<typeof contratoTemplateSchema>;
export type Contrato = z.infer<typeof contratoSchema>;

export interface ContratoComplete extends Contrato {
  patient_name?: string;
  template_name?: string;
  assinado_em?: string;
  anexos?: ContratoAnexo[];
}

export interface ContratoAnexo {
  id: string;
  contrato_id: string;
  nome_arquivo: string;
  caminho_storage: string;
  mime_type: string;
  tamanho_bytes: number;
  created_at: string;
}

export const statusContratoLabels: Record<string, string> = {
  AGUARDANDO_ASSINATURA: 'Aguardando Assinatura',
  ASSINADO: 'Assinado',
  CANCELADO: 'Cancelado',
  EXPIRADO: 'Expirado',
  CONCLUIDO: 'Concluído',
};

// Variáveis disponíveis para templates
export const variaveisTemplate = {
  '{PACIENTE_NOME}': 'Nome do paciente',
  '{PACIENTE_CPF}': 'CPF do paciente',
  '{PACIENTE_EMAIL}': 'Email do paciente',
  '{PACIENTE_TELEFONE}': 'Telefone do paciente',
  '{CLINICA_NOME}': 'Nome da clínica',
  '{CLINICA_CNPJ}': 'CNPJ da clínica',
  '{CLINICA_ENDERECO}': 'Endereço da clínica',
  '{VALOR_CONTRATO}': 'Valor do contrato',
  '{DATA_INICIO}': 'Data de início',
  '{DATA_TERMINO}': 'Data de término',
  '{NUMERO_CONTRATO}': 'Número do contrato',
  '{DATA_ATUAL}': 'Data atual',
};
