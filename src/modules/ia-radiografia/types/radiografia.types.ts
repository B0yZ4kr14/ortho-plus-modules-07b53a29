import { z } from 'zod';

export const analiseRadiograficaSchema = z.object({
  id: z.string().uuid().optional(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  prontuario_id: z.string().uuid().optional(),
  tipo_radiografia: z.enum(['PANORAMICA', 'PERIAPICAL', 'BITE_WING', 'CEFALOMETRICA', 'TOMOGRAFIA']),
  imagem_url: z.string().url(),
  imagem_storage_path: z.string(),
  status_analise: z.enum(['PENDENTE', 'PROCESSANDO', 'CONCLUIDA', 'ERRO']).default('PENDENTE'),
  revisado_por_dentista: z.boolean().default(false),
  observacoes_dentista: z.string().optional(),
});

export const problemaRadiograficoSchema = z.object({
  id: z.string().uuid().optional(),
  analise_id: z.string().uuid(),
  tipo_problema: z.enum(['CARIE', 'FRATURA', 'PERIODONTAL', 'IMPLANTE_NECESSARIO', 'CANAL', 'LESAO_PERIAPICAL', 'OUTROS']),
  dente_codigo: z.string().optional(),
  localizacao: z.string().optional(),
  severidade: z.enum(['LEVE', 'MODERADA', 'GRAVE']),
  confianca: z.number().min(0).max(100),
  descricao: z.string().optional(),
  sugestao_tratamento: z.string().optional(),
  urgente: z.boolean().default(false),
});

export type AnaliseRadiografica = z.infer<typeof analiseRadiograficaSchema>;
export type ProblemaRadiografico = z.infer<typeof problemaRadiograficoSchema>;

export interface AnaliseComplete extends AnaliseRadiografica {
  patient_name?: string;
  problemas_detectados?: number;
  confidence_score?: number;
  created_at?: string;
  resultado_ia?: {
    problemas_detectados: ProblemaRadiografico[];
    sugestoes_tratamento: string[];
    observacoes_ia: string;
  };
  problemas?: ProblemaRadiografico[];
}

export const tipoRadiografiaLabels: Record<string, string> = {
  PANORAMICA: 'Panorâmica',
  PERIAPICAL: 'Periapical',
  BITE_WING: 'Bite-Wing',
  CEFALOMETRICA: 'Cefalométrica',
  TOMOGRAFIA: 'Tomografia',
};

export const tipoProblemaLabels: Record<string, string> = {
  CARIE: 'Cárie',
  FRATURA: 'Fratura',
  PERIODONTAL: 'Problema Periodontal',
  IMPLANTE_NECESSARIO: 'Implante Necessário',
  CANAL: 'Tratamento de Canal',
  LESAO_PERIAPICAL: 'Lesão Periapical',
  OUTROS: 'Outros',
};

export const severidadeLabels: Record<string, string> = {
  LEVE: 'Leve',
  MODERADA: 'Moderada',
  GRAVE: 'Grave',
};
