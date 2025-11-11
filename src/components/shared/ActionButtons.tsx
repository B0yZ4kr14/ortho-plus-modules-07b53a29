import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-2">
      {showView && onView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          title="Visualizar"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Excluir"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
