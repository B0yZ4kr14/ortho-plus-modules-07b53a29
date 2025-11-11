import { z } from 'zod';

// Schema compartilhado de endereço
export const enderecoSchema = z.object({
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  logradouro: z.string().min(1, 'Logradouro obrigatório'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro obrigatório'),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
});

export type Endereco = z.infer<typeof enderecoSchema>;

// Schema de dados pessoais básicos
export const dadosPessoaisBaseSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  rg: z.string().optional(),
  dataNascimento: z.string(),
  sexo: z.enum(['M', 'F', 'Outro']),
  telefone: z.string().min(10, 'Telefone inválido'),
  celular: z.string().min(10, 'Celular inválido'),
  email: z.string().email('Email inválido'),
});

// Tipos de status comuns
export const statusComuns = ['Ativo', 'Inativo'] as const;
export type StatusComum = typeof statusComuns[number];
