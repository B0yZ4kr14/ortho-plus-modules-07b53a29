import { useState, useEffect } from 'react';
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

export default function EstoqueInventario() {
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
    <div className="space-y-6 p-6">
      <PageHeader
        title="Inventário de Estoque"
        description="Gerencie contagens físicas e ajustes de inventário"
        icon={ClipboardCheck}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Inventários</p>
              <p className="text-2xl font-bold">{inventarios.length}</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">
                {inventarios.filter(i => i.status === 'EM_ANDAMENTO').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Divergências Totais</p>
              <p className="text-2xl font-bold">
                {inventarios.reduce((acc, inv) => acc + (inv.divergenciasEncontradas || 0), 0)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Divergências</p>
              <p className="text-2xl font-bold">
                R$ {inventarios.reduce((acc, inv) => acc + (inv.valorDivergencias || 0), 0).toFixed(2)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Número do inventário ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusInventario.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {tiposInventario.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAdd} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Inventário
          </Button>
        </div>
      </Card>

      {/* Tabela de Inventários */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Divergências</TableHead>
              <TableHead>Valor Diverg.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum inventário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredInventarios.map((inventario) => (
                <TableRow key={inventario.id}>
                  <TableCell className="font-medium">{inventario.numero}</TableCell>
                  <TableCell>{new Date(inventario.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{getTipoLabel(inventario.tipo)}</TableCell>
                  <TableCell>{inventario.responsavel}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${calculatePercentualContado(inventario)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {inventario.itensContados}/{inventario.totalItens}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {inventario.divergenciasEncontradas || 0}
                  </TableCell>
                  <TableCell>
                    R$ {(inventario.valorDivergencias || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inventario.status)}>
                      {statusInventario.find(s => s.value === inventario.status)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(inventario)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {inventario.status === 'EM_ANDAMENTO' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleContagem(inventario)}
                          title="Contagem"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {inventario.divergenciasEncontradas && inventario.divergenciasEncontradas > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDivergencias(inventario)}
                          title="Ver Divergências"
                        >
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </Button>
                      )}
                      {inventario.status !== 'CONCLUIDO' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(inventario)}
                          title="Editar"
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

      {/* Dialog de Formulário */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedInventario ? 'Editar Inventário' : 'Novo Inventário'}
            </DialogTitle>
          </DialogHeader>
          <InventarioForm
            inventario={selectedInventario}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Contagem */}
      <InventarioContagemDialog
        open={contagemDialogOpen}
        onOpenChange={setContagemDialogOpen}
        inventario={selectedInventario}
      />

      {/* Dialog de Divergências */}
      <InventarioDivergenciasDialog
        open={divergenciasDialogOpen}
        onOpenChange={setDivergenciasDialogOpen}
        inventario={selectedInventario}
      />
    </div>
  );
}
