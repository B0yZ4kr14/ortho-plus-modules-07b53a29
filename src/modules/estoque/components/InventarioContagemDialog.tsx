import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Save, AlertTriangle } from 'lucide-react';
import { Inventario, InventarioItem } from '../types/estoque.types';

interface InventarioContagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventario?: Inventario;
}

export function InventarioContagemDialog({
  open,
  onOpenChange,
  inventario,
}: InventarioContagemDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - substituir por hook real
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
      dataValidade: '2025-12-31',
    },
    {
      id: '2',
      inventarioId: inventario?.id || '',
      produtoId: 'prod-2',
      produtoNome: 'Máscara Cirúrgica',
      quantidadeSistema: 200,
      quantidadeFisica: null,
      lote: 'LT-2024-002',
      dataValidade: '2025-06-30',
    },
  ];

  const handleQuantityChange = (itemId: string, quantity: number) => {
    console.log('Atualizar quantidade:', itemId, quantity);
  };

  const handleSave = () => {
    console.log('Salvar contagens');
    onOpenChange(false);
  };

  const filteredItems = items.filter(item =>
    item.produtoNome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDivergence = (sistema: number, fisica: number | null) => {
    if (fisica === null) return null;
    return fisica - sistema;
  };

  const calculatePercentage = (sistema: number, fisica: number | null) => {
    if (fisica === null || sistema === 0) return null;
    return ((fisica - sistema) / sistema) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Contagem de Inventário - {inventario?.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabela de Contagem */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-center">Qtd. Sistema</TableHead>
                  <TableHead className="text-center">Qtd. Física</TableHead>
                  <TableHead className="text-center">Divergência</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-right">Valor Diverg.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const divergencia = calculateDivergence(item.quantidadeSistema, item.quantidadeFisica);
                  const percentual = calculatePercentage(item.quantidadeSistema, item.quantidadeFisica);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.produtoNome}</div>
                          {item.dataValidade && (
                            <div className="text-xs text-muted-foreground">
                              Val: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.lote || '-'}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.quantidadeSistema}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={item.quantidadeFisica ?? ''}
                          onChange={(e) => handleQuantityChange(item.id!, parseInt(e.target.value) || 0)}
                          className="w-24 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {divergencia !== null && (
                          <div className={`flex items-center justify-center gap-1 ${
                            divergencia > 0 ? 'text-green-600' : divergencia < 0 ? 'text-red-600' : ''
                          }`}>
                            {divergencia > 0 && '+'}
                            {divergencia}
                            {Math.abs(divergencia) > 5 && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {percentual !== null && (
                          <span className={
                            percentual > 0 ? 'text-green-600' : percentual < 0 ? 'text-red-600' : ''
                          }>
                            {percentual > 0 && '+'}
                            {percentual.toFixed(1)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.valorDivergencia && (
                          <span className={
                            item.valorDivergencia > 0 ? 'text-green-600' : 'text-red-600'
                          }>
                            R$ {Math.abs(item.valorDivergencia).toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer com ações */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              {items.filter(i => i.quantidadeFisica !== null).length} de {items.length} itens contados
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Contagens
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
