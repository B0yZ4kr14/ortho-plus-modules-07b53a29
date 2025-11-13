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
  // Mock data com divergências
  const items: InventarioItem[] = [
    {
      id: '1',
      inventarioId: inventario?.id || '',
      produtoId: 'prod-1',
      produtoNome: 'Luva de Procedimento',
      quantidadeSistema: 150,
      quantidadeFisica: 145,
      divergencia: -5,
      percentualDivergencia: -3.33,
      valorUnitario: 0.50,
      valorDivergencia: -2.50,
      lote: 'LT-2024-001',
    },
    {
      id: '2',
      inventarioId: inventario?.id || '',
      produtoId: 'prod-2',
      produtoNome: 'Seringa 10ml',
      quantidadeSistema: 80,
      quantidadeFisica: 92,
      divergencia: 12,
      percentualDivergencia: 15.0,
      valorUnitario: 1.20,
      valorDivergencia: 14.40,
      lote: 'LT-2024-005',
    },
  ];

  const divergencias = items.filter(item => item.divergencia !== 0);

  const totalValorDivergencias = divergencias.reduce(
    (acc, item) => acc + (item.valorDivergencia || 0),
    0
  );

  const handleGerarAjustes = () => {
    console.log('Gerar ajustes automáticos de estoque');
  };

  const handleExportarRelatorio = () => {
    console.log('Exportar relatório de divergências');
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
                <Button onClick={handleGerarAjustes}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Gerar Ajustes Automáticos
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
