import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, FileDown } from 'lucide-react';
import { Inventario, InventarioItem } from '../types/estoque.types';
import { useInventarioSupabase } from '../hooks/useInventarioSupabase';
import { toast } from 'sonner';
import { exportInventarioPDF } from './InventarioPDFExport';

interface InventarioDivergenciasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventario?: Inventario;
}

export function InventarioDivergenciasDialog({
  open,
  onOpenChange,
  inventario,
}: InventarioDivergenciasDialogProps) {
  const { getInventarioItemsByInventarioId, gerarAjustesAutomaticos } = useInventarioSupabase();
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inventario?.id && open) {
      const inventarioItems = getInventarioItemsByInventarioId(inventario.id);
      setItems(inventarioItems);
    }
  }, [inventario?.id, open, getInventarioItemsByInventarioId]);

  const divergencias = items.filter(item => item.divergencia !== 0);

  const totalValorDivergencias = divergencias.reduce(
    (acc, item) => acc + (item.valorDivergencia || 0),
    0
  );

  const handleGerarAjustes = async () => {
    if (!inventario?.id) return;
    
    setLoading(true);
    try {
      await gerarAjustesAutomaticos(inventario.id);
      toast.success('Ajustes automáticos gerados com sucesso');
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating adjustments:', error);
      toast.error('Erro ao gerar ajustes automáticos');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarRelatorio = async () => {
    if (!inventario) return;
    
    try {
      await exportInventarioPDF(inventario, items);
      toast.success('Relatório PDF exportado com sucesso');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar relatório PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Divergências do Inventário - {inventario?.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Divergências</div>
              <div className="text-2xl font-bold text-red-600">{divergencias.length}</div>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Valor Total</div>
              <div className="text-2xl font-bold text-orange-600">
                R$ {Math.abs(totalValorDivergencias).toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Itens OK</div>
              <div className="text-2xl font-bold text-green-600">
                {items.length - divergencias.length}
              </div>
            </div>
          </div>

          {/* Tabela de Divergências */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-center">Sistema</TableHead>
                  <TableHead className="text-center">Físico</TableHead>
                  <TableHead className="text-center">Divergência</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Criticidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divergencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-green-600">
                        <CheckCircle className="h-12 w-12" />
                        <p className="font-medium">Nenhuma divergência encontrada!</p>
                        <p className="text-sm text-muted-foreground">
                          Todas as contagens estão de acordo com o sistema.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  divergencias.map((item) => {
                    const criticidade = Math.abs(item.percentualDivergencia || 0);
                    let criticidadeLabel = 'Baixa';
                    let criticidadeColor = 'bg-yellow-500';

                    if (criticidade >= 20) {
                      criticidadeLabel = 'Alta';
                      criticidadeColor = 'bg-red-500';
                    } else if (criticidade >= 10) {
                      criticidadeLabel = 'Média';
                      criticidadeColor = 'bg-orange-500';
                    }

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.produtoNome}</TableCell>
                        <TableCell>{item.lote || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.quantidadeSistema}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.quantidadeFisica}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`text-center font-medium ${
                            (item.divergencia || 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(item.divergencia || 0) > 0 && '+'}
                            {item.divergencia}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={
                            (item.percentualDivergencia || 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }>
                            {(item.percentualDivergencia || 0) > 0 && '+'}
                            {item.percentualDivergencia?.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={
                            (item.valorDivergencia || 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }>
                            R$ {Math.abs(item.valorDivergencia || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={criticidadeColor}>
                            {criticidadeLabel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer com ações */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Total de {divergencias.length} divergência(s) encontrada(s)
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportarRelatorio}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              {divergencias.length > 0 && (
                <Button onClick={handleGerarAjustes} disabled={loading}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {loading ? 'Gerando...' : 'Gerar Ajustes Automáticos'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
