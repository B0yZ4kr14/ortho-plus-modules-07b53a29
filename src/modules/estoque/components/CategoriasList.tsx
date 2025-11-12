import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import type { Categoria } from '../types/estoque.types';

interface CategoriasListProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: string) => void;
}

export function CategoriasList({ categorias, onEdit, onDelete }: CategoriasListProps) {
  if (categorias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categorias.map((categoria) => (
        <div
          key={categoria.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: categoria.cor }}
              />
              <h3 className="font-semibold">{categoria.nome}</h3>
            </div>
            <ActionButtons
              onEdit={() => onEdit(categoria)}
              onDelete={() => onDelete(categoria.id!)}
            />
          </div>
          {categoria.descricao && (
            <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
          )}
        </div>
      ))}
    </div>
  );
}
