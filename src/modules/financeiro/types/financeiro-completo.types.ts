import { z } from 'zod';

// Contas a Receber
export const contaReceberSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional().nullable(),
  patient_name: z.string().min(1, 'Nome do paciente é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().positive('Valor deve ser positivo'),
  valor_pago: z.number().min(0).default(0),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_pagamento: z.string().optional().nullable(),
  status: z.enum(['pendente', 'pago', 'atrasado', 'parcial', 'cancelado']).default('pendente'),
  forma_pagamento: z.string().optional().nullable(),
  parcelas: z.number().int().min(1).default(1),
  parcela_atual: z.number().int().min(1).default(1),
  observacoes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

export type ContaReceber = z.infer<typeof contaReceberSchema>;

// Contas a Pagar
export const contaPagarSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
  fornecedor_id: z.string().uuid().optional().nullable(),
  fornecedor_nome: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().positive('Valor deve ser positivo'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_pagamento: z.string().optional().nullable(),
  status: z.enum(['pendente', 'pago', 'atrasado', 'agendado', 'cancelado']).default('pendente'),
  forma_pagamento: z.string().optional().nullable(),
  documento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

export type ContaPagar = z.infer<typeof contaPagarSchema>;

// Notas Fiscais
export const notaFiscalSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid().optional(),
  numero: z.string().min(1, 'Número da nota é obrigatório'),
  serie: z.string().min(1, 'Série é obrigatória'),
  tipo: z.enum(['NFe', 'NFSe']),
  chave_acesso: z.string().optional().nullable(),
  protocolo: z.string().optional().nullable(),
  patient_id: z.string().uuid().optional().nullable(),
  cliente_nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  cliente_cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  cliente_endereco: z.string().optional().nullable(),
  valor_total: z.number().positive('Valor total deve ser positivo'),
  valor_servicos: z.number().optional().nullable(),
  valor_iss: z.number().optional().nullable(),
  aliquota_iss: z.number().optional().nullable(),
  retencao_impostos: z.string().optional().nullable(),
  servicos: z.array(z.string()).default([]),
  codigo_servico: z.string().optional().nullable(),
  data_emissao: z.string().optional(),
  status: z.enum(['pendente', 'emitida', 'enviada', 'cancelada']).default('pendente'),
  observacoes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

export type NotaFiscal = z.infer<typeof notaFiscalSchema>;

// Dashboard Consolidado
export interface DashboardFinanceiroData {
  fluxoCaixa: {
    entradas: number;
    saidas: number;
    saldo: number;
    projecao7dias: number;
    projecao30dias: number;
  };
  contasReceber: {
    total: number;
    vencidas: number;
    aVencer: number;
    recebidas: number;
  };
  contasPagar: {
    total: number;
    vencidas: number;
    aVencer: number;
    pagas: number;
  };
  dre: {
    receitaBruta: number;
    deducoes: number;
    receitaLiquida: number;
    despesasOperacionais: number;
    despesasFinanceiras: number;
    lucroLiquido: number;
  };
  notasFiscais: {
    emitidas: number;
    valorTotal: number;
    pendentes: number;
  };
}

export interface FluxoCaixaEntry {
  data: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface DRECategoria {
  categoria: string;
  valor: number;
  percentual: number;
}
