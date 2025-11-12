import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { Fornecedor } from '../types/estoque.types';

interface FornecedoresListProps {
  fornecedores: Fornecedor[];
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (id: string) => void;
}

export function FornecedoresList({ fornecedores, onEdit, onDelete }: FornecedoresListProps) {
  if (fornecedores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum fornecedor cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fornecedores.map((fornecedor) => (
        <div
          key={fornecedor.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{fornecedor.nome}</h3>
                <Badge variant={fornecedor.ativo ? 'default' : 'secondary'}>
                  {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              {fornecedor.razaoSocial && (
                <p className="text-sm text-muted-foreground">{fornecedor.razaoSocial}</p>
              )}
              {fornecedor.cnpj && (
                <p className="text-sm text-muted-foreground">CNPJ: {fornecedor.cnpj}</p>
              )}
            </div>
            <ActionButtons
              onEdit={() => onEdit(fornecedor)}
              onDelete={() => onDelete(fornecedor.id!)}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-3 text-sm">
            {fornecedor.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{fornecedor.email}</span>
              </div>
            )}
            {fornecedor.telefone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{fornecedor.telefone}</span>
              </div>
            )}
            {fornecedor.cidade && fornecedor.estado && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{fornecedor.cidade}/{fornecedor.estado}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
