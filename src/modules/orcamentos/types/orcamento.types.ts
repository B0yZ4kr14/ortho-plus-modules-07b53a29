import { z } from 'zod';

// Schemas Zod
export const orcamentoItemSchema = z.object({
  id: z.string().uuid().optional(),
  orcamento_id: z.string().uuid().optional(),
  procedimento_id: z.string().uuid().optional(),
  dente_codigo: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().min(1, 'Quantidade mínima é 1'),
  valor_unitario: z.number().min(0, 'Valor deve ser positivo'),
  valor_total: z.number().min(0),
  observacoes: z.string().optional(),
  ordem: z.number().default(0),
});

export const orcamentoPagamentoSchema = z.object({
  id: z.string().uuid().optional(),
  orcamento_id: z.string().uuid().optional(),
  tipo_pagamento: z.enum(['A_VISTA', 'PARCELADO', 'ENTRADA_PARCELADO']),
  numero_parcelas: z.number().optional(),
  valor_entrada: z.number().optional(),
  valor_parcela: z.number().optional(),
  forma_pagamento: z.array(z.string()),
  observacoes: z.string().optional(),
});

export const orcamentoSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  prontuario_id: z.string().uuid().optional(),
  numero_orcamento: z.string().min(1),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  tipo_plano: z.enum(['BASICO', 'INTERMEDIARIO', 'PREMIUM']),
  valor_total: z.number().min(0),
  desconto_percentual: z.number().min(0).max(100).default(0),
  desconto_valor: z.number().min(0).default(0),
  valor_final: z.number().min(0),
  validade_dias: z.number().min(1).default(30),
  data_validade: z.string(),
  status: z.enum(['RASCUNHO', 'ENVIADO', 'VISUALIZADO', 'APROVADO', 'REJEITADO', 'EXPIRADO', 'CONVERTIDO']).default('RASCUNHO'),
  observacoes: z.string().optional(),
});

// TypeScript Types
export type OrcamentoItem = z.infer<typeof orcamentoItemSchema>;
export type OrcamentoPagamento = z.infer<typeof orcamentoPagamentoSchema>;
export type Orcamento = z.infer<typeof orcamentoSchema>;

export interface OrcamentoComplete extends Orcamento {
  itens: OrcamentoItem[];
  pagamento?: OrcamentoPagamento;
  patient_name?: string;
  visualizacoes?: number;
}

export const statusLabels: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  VISUALIZADO: 'Visualizado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  EXPIRADO: 'Expirado',
  CONVERTIDO: 'Convertido',
};

export const tipoPlanoLabels: Record<string, string> = {
  BASICO: 'Básico',
  INTERMEDIARIO: 'Intermediário',
  PREMIUM: 'Premium',
};

export const tipoPagamentoLabels: Record<string, string> = {
  A_VISTA: 'À vista',
  PARCELADO: 'Parcelado',
  ENTRADA_PARCELADO: 'Entrada + Parcelado',
};
