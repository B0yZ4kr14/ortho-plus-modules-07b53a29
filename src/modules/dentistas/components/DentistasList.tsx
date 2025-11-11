import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dentista, DentistaFilters, especialidadesDisponiveis } from '../types/dentista.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DentistasListProps {
  dentistas: Dentista[];
  onEdit: (dentista: Dentista) => void;
  onDelete: (id: string) => void;
  onView: (dentista: Dentista) => void;
  onAdd: () => void;
}

export function DentistasList({ dentistas, onEdit, onDelete, onView, onAdd }: DentistasListProps) {
  const [filters, setFilters] = useState<DentistaFilters>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredDentistas = dentistas.filter(dentista => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !dentista.nome.toLowerCase().includes(searchLower) &&
        !dentista.cro.toLowerCase().includes(searchLower) &&
        !dentista.cpf.includes(filters.search) &&
        !dentista.email.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.status && dentista.status !== filters.status) {
      return false;
    }
    if (filters.especialidade) {
      if (!dentista.especialidades.includes(filters.especialidade)) {
        return false;
      }
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default';
      case 'Inativo':
        return 'secondary';
      case 'Férias':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CRO, CPF, email..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Férias">Férias</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.especialidade || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, especialidade: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {especialidadesDisponiveis.map((esp) => (
                <SelectItem key={esp} value={esp}>
                  {esp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Dentista
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredDentistas.length} dentista(s) encontrado(s)
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CRO</TableHead>
              <TableHead>Especialidades</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDentistas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum dentista encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDentistas.map((dentista) => (
                <TableRow key={dentista.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dentista.corCalendario }}
                      />
                      <span className="font-medium">{dentista.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>{dentista.cro}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dentista.especialidades.slice(0, 2).map((esp) => (
                        <Badge key={esp} variant="secondary" className="text-xs">
                          {esp}
                        </Badge>
                      ))}
                      {dentista.especialidades.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{dentista.especialidades.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{dentista.celular}</div>
                      <div className="text-muted-foreground text-xs">{dentista.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(dentista.status)}>{dentista.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(dentista)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(dentista)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(dentista.id!)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este dentista? Esta ação não pode ser desfeita e pode afetar consultas agendadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
