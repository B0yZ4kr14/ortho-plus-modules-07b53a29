import { z } from 'zod';

export const transactionTypeEnum = z.enum(['RECEITA', 'DESPESA']);
export const transactionCategoryEnum = z.enum([
  'CONSULTA',
  'TRATAMENTO',
  'ORTODONTIA',
  'IMPLANTE',
  'OUTROS',
  'SALARIO',
  'ALUGUEL',
  'MATERIAL',
  'EQUIPAMENTO',
  'SERVICOS'
]);
export const paymentMethodEnum = z.enum([
  'DINHEIRO',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'PIX',
  'TRANSFERENCIA',
  'BOLETO'
]);
export const transactionStatusEnum = z.enum(['PENDENTE', 'CONCLUIDO', 'CANCELADO']);

export const transactionSchema = z.object({
  id: z.string(),
  type: transactionTypeEnum,
  category: transactionCategoryEnum,
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string(),
  dueDate: z.string().optional(),
  status: transactionStatusEnum,
  paymentMethod: paymentMethodEnum.optional(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionType = z.infer<typeof transactionTypeEnum>;
export type TransactionCategory = z.infer<typeof transactionCategoryEnum>;
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;
export type TransactionStatus = z.infer<typeof transactionStatusEnum>;

export interface FinancialSummary {
  totalRevenue: number;
  pendingPayments: number;
  totalExpenses: number;
  netProfit: number;
  revenueChange: number;
  paymentsChange: number;
  expensesChange: number;
  profitChange: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

export interface CategoryDistribution {
  category: string;
  value: number;
  percentage: number;
}
