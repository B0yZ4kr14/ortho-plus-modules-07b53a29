import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/lib/utils/status.utils';

interface StatusBadgeProps {
  status: string;
  showLabel?: boolean;
}

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  return (
    <Badge variant={getStatusColor(status)}>
      {showLabel ? getStatusLabel(status) : status}
    </Badge>
  );
}
