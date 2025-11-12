export type ToothStatus = 'higido' | 'cariado' | 'obturado' | 'extraido' | 'ausente' | 'implante';

export interface ToothData {
  number: number;
  status: ToothStatus;
  notes?: string;
  surfaces?: {
    mesial?: ToothStatus;
    distal?: ToothStatus;
    oclusal?: ToothStatus;
    vestibular?: ToothStatus;
    lingual?: ToothStatus;
  };
  updatedAt?: string;
}

export interface OdontogramaData {
  prontuarioId: string;
  teeth: Record<number, ToothData>;
  lastUpdated: string;
}

export const TOOTH_STATUS_COLORS: Record<ToothStatus, string> = {
  higido: '#ffffff',
  cariado: '#ef4444',
  obturado: '#3b82f6',
  extraido: '#000000',
  ausente: '#9ca3af',
  implante: '#10b981',
};

export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  higido: 'Hígido',
  cariado: 'Cariado',
  obturado: 'Obturado',
  extraido: 'Extraído',
  ausente: 'Ausente',
  implante: 'Implante',
};

// Numeração FDI padrão
export const UPPER_RIGHT_TEETH = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT_TEETH = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_LEFT_TEETH = [31, 32, 33, 34, 35, 36, 37, 38];
export const LOWER_RIGHT_TEETH = [48, 47, 46, 45, 44, 43, 42, 41];

export const ALL_TEETH = [
  ...UPPER_RIGHT_TEETH,
  ...UPPER_LEFT_TEETH,
  ...LOWER_LEFT_TEETH,
  ...LOWER_RIGHT_TEETH,
];
