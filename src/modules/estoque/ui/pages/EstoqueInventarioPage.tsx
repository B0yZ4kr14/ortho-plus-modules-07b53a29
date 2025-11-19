import { useState } from 'react';
import { useInventarioSupabase } from '@/modules/estoque/hooks/useInventarioSupabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Eye, Edit, FileText, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Inventario, statusInventario, tiposInventario } from '@/modules/estoque/types/estoque.types';
import { InventarioForm } from '@/modules/estoque/components/InventarioForm';
import { InventarioContagemDialog } from '@/modules/estoque/components/InventarioContagemDialog';
import { InventarioDivergenciasDialog } from '@/modules/estoque/components/InventarioDivergenciasDialog';

export default function EstoqueInventarioPage() {
  const {
    inventarios,
    loading,
    addInventario,
    updateInventario,
    deleteInventario,
  } = useInventarioSupabase();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contagemDialogOpen, setContagemDialogOpen] = useState(false);
  const [divergenciasDialogOpen, setDivergenciasDialogOpen] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<Inventario | undefined>();
  const [viewMode, setViewMode] = useState<'form' | 'view'>('form');

  const filteredInventarios = inventarios.filter(inv => {
    const matchesSearch = inv.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesTipo = tipoFilter === 'all' || inv.tipo === tipoFilter;
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleAdd = () => {
    setSelectedInventario(undefined);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleEdit = (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setViewMode('form');
    setDialogOpen(true);
  };

  const handleView = (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setViewMode('view');
    setDialogOpen(true);
  };

  const handleContagem = (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setContagemDialogOpen(true);
  };

  const handleDivergencias = (inventario: Inventario) => {
    setSelectedInventario(inventario);
    setDivergenciasDialogOpen(true);
  };

  const handleSubmit = async (data: Inventario) => {
    try {
      if (selectedInventario) {
        await updateInventario(selectedInventario.id, data);
      } else {
        await addInventario(data);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving inventário:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = statusInventario.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-500';
  };

  const getTipoLabel = (tipo: string) => {
    const tipoConfig = tiposInventario.find(t => t.value === tipo);
    return tipoConfig?.label || tipo;
  };

  const calculatePercentualContado = (inv: Inventario) => {
    if (!inv.totalItens || !inv.itensContados) return 0;
    return Math.round((inv.itensContados / inv.totalItens) * 100);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Inventário de Estoque"
        description="Gestão completa de inventários físicos com divergências e auditoria"
      />

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusInventario.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {tiposInventario.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Inventário
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum inventário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredInventarios.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.numero}</TableCell>
                  <TableCell>{getTipoLabel(inv.tipo)}</TableCell>
                  <TableCell>{inv.responsavel}</TableCell>
                  <TableCell>
                    {new Date(inv.data || '').toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${calculatePercentualContado(inv)}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {calculatePercentualContado(inv)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inv.status)}>
                      {statusInventario.find(s => s.value === inv.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {inv.status === 'EM_ANDAMENTO' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContagem(inv)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-1" />
                          Contagem
                        </Button>
                      )}
                      {inv.status === 'CONCLUIDO' && (inv.valorDivergencias || 0) > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDivergencias(inv)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Divergências
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(inv)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {inv.status !== 'CONCLUIDO' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(inv)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode === 'form'
                ? selectedInventario
                  ? 'Editar Inventário'
                  : 'Novo Inventário'
                : 'Detalhes do Inventário'}
            </DialogTitle>
          </DialogHeader>
          <InventarioForm
            inventario={selectedInventario}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedInventario && (
        <>
          <InventarioContagemDialog
            open={contagemDialogOpen}
            onOpenChange={setContagemDialogOpen}
            inventario={selectedInventario}
          />
          <InventarioDivergenciasDialog
            open={divergenciasDialogOpen}
            onOpenChange={setDivergenciasDialogOpen}
            inventario={selectedInventario}
          />
        </>
      )}
    </div>
  );
}
