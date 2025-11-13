import { z } from 'zod';

// Cargos disponíveis
export const cargosDisponiveis = [
  'Administrador',
  'Gerente',
  'Recepcionista',
  'Auxiliar de Dentista',
  'Assistente Administrativo',
  'Secretário(a)',
  'Técnico em Radiologia',
  'Auxiliar de Limpeza',
] as const;

export type Cargo = typeof cargosDisponiveis[number];

// Permissões disponíveis
export const permissoesDisponiveis = {
  pacientes: {
    label: 'Pacientes',
    permissions: ['visualizar', 'criar', 'editar', 'excluir'] as const,
  },
  dentistas: {
    label: 'Dentistas',
    permissions: ['visualizar', 'criar', 'editar', 'excluir'] as const,
  },
  funcionarios: {
    label: 'Funcionários',
    permissions: ['visualizar', 'criar', 'editar', 'excluir'] as const,
  },
  agenda: {
    label: 'Agenda',
    permissions: ['visualizar', 'criar', 'editar', 'excluir', 'confirmar'] as const,
  },
  financeiro: {
    label: 'Financeiro',
    permissions: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar'] as const,
  },
  relatorios: {
    label: 'Relatórios',
    permissions: ['visualizar', 'exportar'] as const,
  },
  configuracoes: {
    label: 'Configurações',
    permissions: ['visualizar', 'editar'] as const,
  },
} as const;

export type PermissaoModulo = keyof typeof permissoesDisponiveis;
export type PermissaoAcao = 
  | 'visualizar' 
  | 'criar' 
  | 'editar' 
  | 'excluir' 
  | 'confirmar' 
  | 'aprovar' 
  | 'exportar';

export interface Permissoes {
  [key: string]: string[];
}

// Funcionário validation schema
export const funcionarioSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  rg: z.string().optional(),
  dataNascimento: z.string(),
  sexo: z.enum(['M', 'F', 'Outro']),
  telefone: z.string().min(10, 'Telefone inválido'),
  celular: z.string().min(10, 'Celular inválido'),
  email: z.string().email('Email inválido'),
  endereco: z.object({
    cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    logradouro: z.string().min(1, 'Logradouro obrigatório'),
    numero: z.string().min(1, 'Número obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro obrigatório'),
    cidade: z.string().min(1, 'Cidade obrigatória'),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  }),
  cargo: z.enum(cargosDisponiveis, { required_error: 'Cargo é obrigatório' }),
  dataAdmissao: z.string(),
  salario: z.number().min(0, 'Salário deve ser maior ou igual a zero'),
  permissoes: z.record(z.array(z.string())),
  horarioTrabalho: z.object({
    inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
    fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  }),
  diasTrabalho: z.array(z.number()).min(1, 'Selecione ao menos um dia de trabalho'),
  observacoes: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo', 'Férias', 'Afastado']).default('Ativo'),
  senhaAcesso: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  avatar_url: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Funcionario = z.infer<typeof funcionarioSchema>;

export interface FuncionarioFilters {
  search?: string;
  status?: string;
  cargo?: string;
}

// Dias da semana
export const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
] as const;

// Perfis de permissões predefinidos
export const perfisPermissoes: Record<string, Permissoes> = {
  'Administrador': {
    pacientes: ['visualizar', 'criar', 'editar', 'excluir'],
    dentistas: ['visualizar', 'criar', 'editar', 'excluir'],
    funcionarios: ['visualizar', 'criar', 'editar', 'excluir'],
    agenda: ['visualizar', 'criar', 'editar', 'excluir', 'confirmar'],
    financeiro: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar'],
    relatorios: ['visualizar', 'exportar'],
    configuracoes: ['visualizar', 'editar'],
  },
  'Gerente': {
    pacientes: ['visualizar', 'criar', 'editar'],
    dentistas: ['visualizar'],
    funcionarios: ['visualizar'],
    agenda: ['visualizar', 'criar', 'editar', 'confirmar'],
    financeiro: ['visualizar', 'criar', 'editar'],
    relatorios: ['visualizar', 'exportar'],
    configuracoes: ['visualizar'],
  },
  'Recepcionista': {
    pacientes: ['visualizar', 'criar', 'editar'],
    dentistas: ['visualizar'],
    funcionarios: [],
    agenda: ['visualizar', 'criar', 'editar', 'confirmar'],
    financeiro: ['visualizar'],
    relatorios: ['visualizar'],
    configuracoes: [],
  },
  'Auxiliar de Dentista': {
    pacientes: ['visualizar'],
    dentistas: ['visualizar'],
    funcionarios: [],
    agenda: ['visualizar'],
    financeiro: [],
    relatorios: [],
    configuracoes: [],
  },
};
