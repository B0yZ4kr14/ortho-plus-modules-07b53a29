import { z } from 'zod';

// Dentista validation schema
export const dentistaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  cro: z.string().min(3, 'CRO é obrigatório'),
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
  especialidades: z.array(z.string()).min(1, 'Selecione ao menos uma especialidade'),
  corCalendario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  diasAtendimento: z.array(z.number()).min(1, 'Selecione ao menos um dia de atendimento'),
  horariosAtendimento: z.object({
    inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
    fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  }),
  valorConsulta: z.number().min(0, 'Valor deve ser maior ou igual a zero').optional(),
  observacoes: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo', 'Férias']).default('Ativo'),
  avatar_url: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Dentista = z.infer<typeof dentistaSchema>;

export interface DentistaFilters {
  search?: string;
  status?: string;
  especialidade?: string;
}

// Especialidades disponíveis
export const especialidadesDisponiveis = [
  'Clínico Geral',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Implantodontia',
  'Prótese Dentária',
  'Odontopediatria',
  'Cirurgia Oral',
  'Estética Dental',
  'Radiologia',
] as const;

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

// Cores disponíveis para calendário
export const coresCalendario = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
] as const;
