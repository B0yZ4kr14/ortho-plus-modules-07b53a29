import { z } from 'zod';

// Schema para Categoria
export const categoriaSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  descricao: z.string().optional(),
  cor: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Categoria = z.infer<typeof categoriaSchema>;

// Schema para Requisição
export const requisicaoSchema = z.object({
  id: z.string().uuid().optional(),
  produtoId: z.string().uuid('Selecione um produto'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  motivo: z.string().min(5, 'Motivo deve ter no mínimo 5 caracteres'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']),
  status: z.enum(['PENDENTE', 'APROVADA', 'REJEITADA', 'ENTREGUE']).default('PENDENTE'),
  solicitadoPor: z.string(),
  aprovadoPor: z.string().optional(),
  dataAprovacao: z.string().optional(),
  observacoes: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Requisicao = z.infer<typeof requisicaoSchema>;

// Schema para Movimentação
export const movimentacaoSchema = z.object({
  id: z.string().uuid().optional(),
  produtoId: z.string().uuid('Selecione um produto'),
  tipo: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE', 'DEVOLUCAO', 'PERDA']),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  lote: z.string().optional(),
  dataValidade: z.string().optional(),
  motivo: z.string().min(3, 'Motivo é obrigatório'),
  valorUnitario: z.number().min(0).optional(),
  valorTotal: z.number().min(0).optional(),
  fornecedorId: z.string().uuid().optional(),
  notaFiscal: z.string().optional(),
  realizadoPor: z.string(),
  observacoes: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Movimentacao = z.infer<typeof movimentacaoSchema>;

// Schema para Alerta
export const alertaSchema = z.object({
  id: z.string().uuid().optional(),
  produtoId: z.string().uuid(),
  tipo: z.enum(['ESTOQUE_MINIMO', 'ESTOQUE_CRITICO', 'VALIDADE_PROXIMA', 'SUGESTAO_REPOSICAO']),
  mensagem: z.string(),
  quantidadeAtual: z.number(),
  quantidadeSugerida: z.number().optional(),
  lido: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export type Alerta = z.infer<typeof alertaSchema>;

// Schema para Fornecedor
export const fornecedorSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
  // Campos de integração API
  apiEnabled: z.boolean().default(false),
  apiEndpoint: z.string().optional(),
  apiAuthType: z.enum(['none', 'basic', 'bearer', 'api_key']).default('none'),
  apiUsername: z.string().optional(),
  apiPassword: z.string().optional(),
  apiToken: z.string().optional(),
  apiKeyHeader: z.string().optional(),
  apiKeyValue: z.string().optional(),
  apiRequestFormat: z.enum(['json', 'xml', 'form']).default('json'),
  autoOrderEnabled: z.boolean().default(false),
  autoOrderConfig: z.any().optional(),
  createdAt: z.string().optional(),
});

export type Fornecedor = z.infer<typeof fornecedorSchema>;

// Schema para Produto
export const produtoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  descricao: z.string().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  codigoBarras: z.string().optional(), // Código de barras
  categoriaId: z.string().uuid('Selecione uma categoria'),
  fornecedorId: z.string().uuid('Selecione um fornecedor'),
  unidadeMedida: z.enum(['UNIDADE', 'CAIXA', 'FRASCO', 'PACOTE', 'KG', 'LITRO']),
  quantidadeMinima: z.number().min(0, 'Quantidade mínima deve ser maior ou igual a 0'),
  quantidadeAtual: z.number().min(0, 'Quantidade atual deve ser maior ou igual a 0').default(0),
  precoCompra: z.number().min(0, 'Preço de compra deve ser maior ou igual a 0'),
  precoVenda: z.number().min(0, 'Preço de venda deve ser maior ou igual a 0').optional(),
  lote: z.string().optional(),
  dataValidade: z.string().optional(),
  ativo: z.boolean().default(true),
  createdAt: z.string().optional(),
});

export type Produto = z.infer<typeof produtoSchema>;

export const unidadesMedida = [
  { value: 'UNIDADE', label: 'Unidade' },
  { value: 'CAIXA', label: 'Caixa' },
  { value: 'FRASCO', label: 'Frasco' },
  { value: 'PACOTE', label: 'Pacote' },
  { value: 'KG', label: 'Quilograma' },
  { value: 'LITRO', label: 'Litro' },
] as const;

export const prioridadesRequisicao = [
  { value: 'BAIXA', label: 'Baixa', color: 'bg-blue-500' },
  { value: 'MEDIA', label: 'Média', color: 'bg-yellow-500' },
  { value: 'ALTA', label: 'Alta', color: 'bg-orange-500' },
  { value: 'URGENTE', label: 'Urgente', color: 'bg-red-500' },
] as const;

export const statusRequisicao = [
  { value: 'PENDENTE', label: 'Pendente', color: 'bg-gray-500' },
  { value: 'APROVADA', label: 'Aprovada', color: 'bg-green-500' },
  { value: 'REJEITADA', label: 'Rejeitada', color: 'bg-red-500' },
  { value: 'ENTREGUE', label: 'Entregue', color: 'bg-blue-500' },
] as const;

export const tiposMovimentacao = [
  { value: 'ENTRADA', label: 'Entrada', color: 'bg-green-500' },
  { value: 'SAIDA', label: 'Saída', color: 'bg-red-500' },
  { value: 'AJUSTE', label: 'Ajuste', color: 'bg-blue-500' },
  { value: 'DEVOLUCAO', label: 'Devolução', color: 'bg-yellow-500' },
  { value: 'PERDA', label: 'Perda', color: 'bg-gray-500' },
] as const;

// Schema para Inventário
export const inventarioSchema = z.object({
  id: z.string().uuid().optional(),
  numero: z.string().min(1, 'Número do inventário é obrigatório'),
  data: z.string().min(1, 'Data é obrigatória'),
  status: z.enum(['PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']).default('PLANEJADO'),
  tipo: z.enum(['GERAL', 'PARCIAL', 'CICLICO']),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  observacoes: z.string().optional(),
  totalItens: z.number().optional(),
  itensContados: z.number().optional(),
  divergenciasEncontradas: z.number().optional(),
  valorDivergencias: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Inventario = z.infer<typeof inventarioSchema>;

// Schema para Item de Inventário
export const inventarioItemSchema = z.object({
  id: z.string().uuid().optional(),
  inventarioId: z.string().uuid(),
  produtoId: z.string().uuid(),
  produtoNome: z.string().optional(),
  quantidadeSistema: z.number().min(0),
  quantidadeFisica: z.number().min(0).nullable(),
  divergencia: z.number().optional(),
  percentualDivergencia: z.number().optional(),
  valorUnitario: z.number().min(0).optional(),
  valorDivergencia: z.number().optional(),
  lote: z.string().optional(),
  dataValidade: z.string().optional(),
  observacoes: z.string().optional(),
  contadoPor: z.string().optional(),
  dataContagem: z.string().optional(),
});

export type InventarioItem = z.infer<typeof inventarioItemSchema>;

export const tiposInventario = [
  { value: 'GERAL', label: 'Geral', description: 'Contagem completa de todos os itens' },
  { value: 'PARCIAL', label: 'Parcial', description: 'Contagem de itens específicos' },
  { value: 'CICLICO', label: 'Cíclico', description: 'Contagem periódica por categoria' },
] as const;

export const statusInventario = [
  { value: 'PLANEJADO', label: 'Planejado', color: 'bg-blue-500' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento', color: 'bg-yellow-500' },
  { value: 'CONCLUIDO', label: 'Concluído', color: 'bg-green-500' },
  { value: 'CANCELADO', label: 'Cancelado', color: 'bg-red-500' },
] as const;

// Schema para Pedido
export const pedidoSchema = z.object({
  id: z.string().uuid().optional(),
  numeroPedido: z.string().min(1, 'Número do pedido é obrigatório'),
  fornecedorId: z.string().uuid('Selecione um fornecedor'),
  status: z.enum(['PENDENTE', 'ENVIADO', 'RECEBIDO', 'CANCELADO']).default('PENDENTE'),
  tipo: z.enum(['MANUAL', 'AUTOMATICO']).default('MANUAL'),
  dataPedido: z.string(),
  dataPrevistaEntrega: z.string().optional(),
  dataRecebimento: z.string().optional(),
  valorTotal: z.number().min(0).default(0),
  observacoes: z.string().optional(),
  geradoAutomaticamente: z.boolean().default(false),
  createdAt: z.string().optional(),
  createdBy: z.string(),
});

export type Pedido = z.infer<typeof pedidoSchema>;

// Schema para Item do Pedido
export const pedidoItemSchema = z.object({
  id: z.string().uuid().optional(),
  pedidoId: z.string().uuid(),
  produtoId: z.string().uuid('Selecione um produto'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  precoUnitario: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
  valorTotal: z.number().min(0),
  quantidadeRecebida: z.number().min(0).default(0),
  observacoes: z.string().optional(),
  createdAt: z.string().optional(),
});

export type PedidoItem = z.infer<typeof pedidoItemSchema>;

// Schema para Configuração de Pedido Automático
export const pedidoConfigSchema = z.object({
  id: z.string().uuid().optional(),
  produtoId: z.string().uuid(),
  quantidadeReposicao: z.number().min(1, 'Quantidade de reposição deve ser maior que 0'),
  pontoPedido: z.number().min(0, 'Ponto de pedido deve ser maior ou igual a 0'),
  gerarAutomaticamente: z.boolean().default(true),
  diasEntregaEstimados: z.number().min(1).default(7),
  createdAt: z.string().optional(),
});

export type PedidoConfig = z.infer<typeof pedidoConfigSchema>;

export const statusPedido = [
  { value: 'PENDENTE', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'ENVIADO', label: 'Enviado', color: 'bg-blue-500' },
  { value: 'RECEBIDO', label: 'Recebido', color: 'bg-green-500' },
  { value: 'CANCELADO', label: 'Cancelado', color: 'bg-red-500' },
] as const;
