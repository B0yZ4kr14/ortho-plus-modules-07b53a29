/**
 * ✅ FASE 2: PatientsList com Virtual Scrolling
 * Otimização para listas grandes usando @tanstack/react-virtual
 */

import { useState, useCallback, memo, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Patient, PatientFilters } from '../types/patient.types';
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

interface PatientsListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onView: (patient: Patient) => void;
  onAdd: () => void;
}

export const PatientsListVirtual = memo(function PatientsListVirtual({ 
  patients, 
  onEdit, 
  onDelete, 
  onView, 
  onAdd 
}: PatientsListProps) {
  const [filters, setFilters] = useState<PatientFilters>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }));
  }, []);

  const handleConvenioChange = useCallback((value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      convenio: value === 'all' ? undefined : value === 'true' 
    }));
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, onDelete]);

  // ✅ Filtragem memoizada
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !patient.nome.toLowerCase().includes(searchLower) &&
          !patient.cpf.includes(filters.search) &&
          !patient.telefone.includes(filters.search) &&
          !patient.celular.includes(filters.search) &&
          !(patient.email?.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }
      if (filters.status && patient.status !== filters.status) {
        return false;
      }
      if (filters.convenio !== undefined) {
        if (filters.convenio !== patient.convenio.temConvenio) {
          return false;
        }
      }
      return true;
    });
  }, [patients, filters]);

  // ✅ FASE 2: Virtual Scrolling
  const rowVirtualizer = useVirtualizer({
    count: filteredPatients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // altura estimada de cada linha
    overscan: 5, // render 5 items extras acima/abaixo
  });

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Ativo': return 'default';
      case 'Inativo': return 'secondary';
      case 'Pendente': return 'outline';
      default: return 'default';
    }
  }, []);

  return (
    <div className="space-y-4" data-testid="patient-list">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, telefone ou email..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              aria-label="Buscar pacientes"
            />
          </div>
          
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.convenio === true ? 'true' : filters.convenio === false ? 'false' : 'all'} onValueChange={handleConvenioChange}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por convênio">
              <SelectValue placeholder="Convênio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Com Convênio</SelectItem>
              <SelectItem value="false">Sem Convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAdd} className="w-full sm:w-auto" aria-label="Adicionar novo paciente">
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Virtual Scrolling Table */}
      <Card>
        <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Header fixo */}
            <div className="sticky top-0 z-10 bg-card border-b">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm">
                <div className="col-span-2">Nome</div>
                <div>CPF</div>
                <div>Telefone</div>
                <div>Status</div>
                <div className="text-right">Ações</div>
              </div>
            </div>

            {/* Linhas virtualizadas */}
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const patient = filteredPatients[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="border-b hover:bg-muted/50"
                >
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="col-span-2">
                      <div className="font-medium">{patient.nome}</div>
                      {patient.email && (
                        <div className="text-sm text-muted-foreground">{patient.email}</div>
                      )}
                    </div>
                    <div className="text-sm">{patient.cpf}</div>
                    <div className="text-sm">{patient.celular || patient.telefone}</div>
                    <div>
                      <Badge variant={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(patient)}
                        aria-label={`Ver detalhes de ${patient.nome}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(patient)}
                        aria-label={`Editar ${patient.nome}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(patient.id)}
                        aria-label={`Excluir ${patient.nome}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum paciente encontrado
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
