import { z } from 'zod';

// Categorias de procedimentos odontológicos
export const categoriasDisponiveis = [
  'Clínica Geral',
  'Endodontia',
  'Periodontia',
  'Ortodontia',
  'Implantodontia',
  'Prótese',
  'Estética',
  'Cirurgia',
  'Odontopediatria',
  'Radiologia',
] as const;

export type CategoriaProcedimento = typeof categoriasDisponiveis[number];

// Unidades de tempo
export const unidadesTempo = ['minutos', 'horas'] as const;
export type UnidadeTempo = typeof unidadesTempo[number];

// Schema do procedimento
export const procedimentoSchema = z.object({
  id: z.string().optional(),
  codigo: z.string().min(1, 'Código obrigatório').max(20),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(150),
  categoria: z.enum(categoriasDisponiveis),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  duracaoEstimada: z.number().min(1, 'Duração deve ser no mínimo 1'),
  unidadeTempo: z.enum(unidadesTempo),
  materiaisNecessarios: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo']),
  dataCriacao: z.string(),
  dataAtualizacao: z.string(),
});

export type Procedimento = z.infer<typeof procedimentoSchema>;

// Schema para criação (sem id, datas automáticas)
export const criarProcedimentoSchema = procedimentoSchema.omit({
  id: true,
  dataCriacao: true,
  dataAtualizacao: true,
});

export type CriarProcedimento = z.infer<typeof criarProcedimentoSchema>;
