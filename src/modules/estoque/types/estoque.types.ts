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
  createdAt: z.string().optional(),
});

export type Fornecedor = z.infer<typeof fornecedorSchema>;

// Schema para Produto
export const produtoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  descricao: z.string().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
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
