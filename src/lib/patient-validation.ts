import { z } from 'zod';

// Schema de validação completo para pacientes
export const patientFormSchema = z.object({
  // Dados Pessoais (Tab 1)
  full_name: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres').max(200),
  social_name: z.string().max(200).optional().nullable(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional().nullable(),
  rg: z.string().max(20).optional().nullable(),
  birth_date: z.string().min(1, 'Data de nascimento obrigatória'),
  gender: z.enum(['masculino', 'feminino', 'outro', 'nao_informar']).optional().nullable(),
  marital_status: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  occupation: z.string().max(200).optional().nullable(),
  education_level: z.enum(['fundamental', 'medio', 'superior', 'pos_graduacao', 'nao_informado']).optional().nullable(),
  
  // Contato e Endereço (Tab 2)
  email: z.string().email('Email inválido').max(255).optional().nullable(),
  phone_primary: z.string().min(14, 'Telefone inválido').max(15),
  phone_secondary: z.string().max(15).optional().nullable(),
  phone_emergency: z.string().max(15).optional().nullable(),
  emergency_contact_name: z.string().max(200).optional().nullable(),
  emergency_contact_relationship: z.string().max(100).optional().nullable(),
  address_zipcode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido').optional().nullable(),
  address_street: z.string().max(255).optional().nullable(),
  address_number: z.string().max(20).optional().nullable(),
  address_complement: z.string().max(100).optional().nullable(),
  address_neighborhood: z.string().max(100).optional().nullable(),
  address_city: z.string().max(100).optional().nullable(),
  address_state: z.string().length(2).optional().nullable(),
  address_country: z.string().max(100).optional().nullable(),
  
  // Histórico Médico (Tab 3)
  has_systemic_disease: z.boolean().optional().nullable(),
  systemic_diseases: z.array(z.string()).optional().nullable(),
  has_cardiovascular_disease: z.boolean().optional().nullable(),
  cardiovascular_details: z.string().optional().nullable(),
  has_diabetes: z.boolean().optional().nullable(),
  diabetes_type: z.enum(['tipo1', 'tipo2', 'gestacional']).optional().nullable(),
  diabetes_controlled: z.boolean().optional().nullable(),
  has_hypertension: z.boolean().optional().nullable(),
  hypertension_controlled: z.boolean().optional().nullable(),
  has_allergies: z.boolean().optional().nullable(),
  allergies_list: z.array(z.string()).optional().nullable(),
  has_medication_allergy: z.boolean().optional().nullable(),
  medication_allergies: z.array(z.string()).optional().nullable(),
  current_medications: z.array(z.string()).optional().nullable(),
  has_bleeding_disorder: z.boolean().optional().nullable(),
  bleeding_disorder_details: z.string().optional().nullable(),
  is_pregnant: z.boolean().optional().nullable(),
  pregnancy_trimester: z.number().min(1).max(3).optional().nullable(),
  is_breastfeeding: z.boolean().optional().nullable(),
  has_hepatitis: z.boolean().optional().nullable(),
  hepatitis_type: z.enum(['A', 'B', 'C', 'D', 'E']).optional().nullable(),
  has_hiv: z.boolean().optional().nullable(),
  
  // Hábitos e Medidas (Tab 4)
  has_smoking_habit: z.boolean().optional().nullable(),
  smoking_frequency: z.enum(['leve', 'moderado', 'pesado']).optional().nullable(),
  has_alcohol_habit: z.boolean().optional().nullable(),
  alcohol_frequency: z.enum(['ocasional', 'moderado', 'frequente']).optional().nullable(),
  blood_pressure_systolic: z.number().min(50).max(250).optional().nullable(),
  blood_pressure_diastolic: z.number().min(30).max(150).optional().nullable(),
  heart_rate: z.number().min(30).max(220).optional().nullable(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
  weight_kg: z.number().min(1).max(300).optional().nullable(),
  height_cm: z.number().min(50).max(250).optional().nullable(),
  bmi: z.number().optional().nullable(),
  
  // Odontológico (Tab 5)
  main_complaint: z.string().max(1000).optional().nullable(),
  pain_level: z.number().min(0).max(10).optional().nullable(),
  clinical_observations: z.string().optional().nullable(),
  oral_hygiene_quality: z.enum(['excelente', 'boa', 'regular', 'ruim']).optional().nullable(),
  gum_condition: z.enum(['saudavel', 'leve_inflamacao', 'gengivite', 'periodontite']).optional().nullable(),
  
  // Financeiro e LGPD (Tab 6)
  preferred_payment_method: z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto']).optional().nullable(),
  lgpd_consent: z.boolean().optional().nullable(),
  image_usage_consent: z.boolean().optional().nullable(),
  treatment_consent: z.boolean().optional().nullable(),
  data_sharing_consent: z.boolean().optional().nullable(),
  status: z.enum(['ativo', 'inativo', 'arquivado']).default('ativo'),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

// Função para calcular IMC
export function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm || heightCm === 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// Função para calcular idade
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Função para buscar CEP
export async function fetchAddressFromCEP(cep: string) {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;
    
    return {
      address_street: data.logradouro || '',
      address_neighborhood: data.bairro || '',
      address_city: data.localidade || '',
      address_state: data.uf || '',
      address_country: 'Brasil',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}
