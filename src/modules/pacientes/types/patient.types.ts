import { z } from 'zod';

// Patient validation schema
export const patientSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  rg: z.string().optional(),
  dataNascimento: z.string(),
  sexo: z.enum(['M', 'F', 'Outro']),
  telefone: z.string().min(10, 'Telefone inválido'),
  celular: z.string().min(10, 'Celular inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.object({
    cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    logradouro: z.string().min(1, 'Logradouro obrigatório'),
    numero: z.string().min(1, 'Número obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro obrigatório'),
    cidade: z.string().min(1, 'Cidade obrigatória'),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  }),
  convenio: z.object({
    temConvenio: z.boolean(),
    nomeConvenio: z.string().optional(),
    numeroCarteira: z.string().optional(),
    validade: z.string().optional(),
  }),
  observacoes: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo', 'Pendente']).default('Ativo'),
  avatar_url: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

export interface PatientFilters {
  search?: string;
  status?: string;
  convenio?: boolean;
}

export interface Consulta {
  id: string;
  data: string;
  hora: string;
  dentista: string;
  procedimento: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada' | 'Faltou';
  observacoes?: string;
}

export interface Prontuario {
  id: string;
  pacienteId: string;
  data: string;
  dentista: string;
  anamnese?: string;
  diagnostico?: string;
  tratamento?: string;
  prescricao?: string;
  observacoes?: string;
  anexos?: string[];
}
