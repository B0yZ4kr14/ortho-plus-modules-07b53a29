import { BadgeProps } from '@/components/ui/badge';

// Mapeamento centralizado de cores de status
export const statusColorMap: Record<string, BadgeProps['variant']> = {
  'Ativo': 'default',
  'Inativo': 'secondary',
  'Pendente': 'outline',
  'Férias': 'outline',
  'Afastado': 'destructive',
  'Agendada': 'outline',
  'Confirmada': 'default',
  'Realizada': 'secondary',
  'Cancelada': 'destructive',
  'Faltou': 'outline',
};

export function getStatusColor(status: string): BadgeProps['variant'] {
  return statusColorMap[status] || 'default';
}

// Labels de status para exibição
export const statusLabels: Record<string, string> = {
  'Ativo': 'Ativo',
  'Inativo': 'Inativo',
  'Pendente': 'Pendente',
  'Férias': 'Férias',
  'Afastado': 'Afastado',
  'Agendada': 'Agendada',
  'Confirmada': 'Confirmada',
  'Realizada': 'Realizada',
  'Cancelada': 'Cancelada',
  'Faltou': 'Paciente Faltou',
};

export function getStatusLabel(status: string): string {
  return statusLabels[status] || status;
}
