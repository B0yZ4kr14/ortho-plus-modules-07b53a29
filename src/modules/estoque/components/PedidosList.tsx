import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils/date.utils';
import { formatCurrency } from '@/lib/utils/validation.utils';
import type { Pedido, Fornecedor, PedidoItem, Produto } from '../types/estoque.types';
import { statusPedido } from '../types/estoque.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PedidosListProps {
  pedidos: Pedido[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
  pedidosItens: PedidoItem[];
  onUpdateStatus: (id: string, status: string) => void;
}

export function PedidosList({ 
  pedidos, 
  fornecedores, 
  produtos,
  pedidosItens,
  onUpdateStatus 
}: PedidosListProps) {
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = (status: string) => {
    return statusPedido.find(s => s.value === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE': return Clock;
      case 'ENVIADO': return Truck;
      case 'RECEBIDO': return CheckCircle;
      case 'CANCELADO': return XCircle;
      default: return Package;
    }
  };

  const getFornecedorNome = (fornecedorId: string) => {
    return fornecedores.find(f => f.id === fornecedorId)?.nome || 'Fornecedor não encontrado';
  };

  const getPedidoItens = (pedidoId: string) => {
    return pedidosItens.filter(item => item.pedidoId === pedidoId);
  };

  const getProdutoNome = (produtoId: string) => {
    return produtos.find(p => p.id === produtoId)?.nome || 'Produto não encontrado';
  };

  const handleViewDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setShowDetails(true);
  };

  if (pedidos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Nenhum pedido encontrado</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {pedidos.map((pedido) => {
          const statusConfig = getStatusConfig(pedido.status);
          const StatusIcon = getStatusIcon(pedido.status);
          const itens = getPedidoItens(pedido.id!);

          return (
            <Card key={pedido.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{pedido.numeroPedido}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getFornecedorNome(pedido.fornecedorId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data: </span>
                      {formatDate(pedido.dataPedido)}
                    </div>
                    {pedido.dataPrevistaEntrega && (
                      <div>
                        <span className="text-muted-foreground">Entrega: </span>
                        {formatDate(pedido.dataPrevistaEntrega)}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Itens: </span>
                      {itens.length}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor: </span>
                      <span className="font-semibold">{formatCurrency(pedido.valorTotal)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={statusConfig?.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label}
                    </Badge>
                    {pedido.geradoAutomaticamente && (
                      <Badge variant="outline">Automático</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(pedido)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>

                  {pedido.status === 'PENDENTE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(pedido.id!, 'ENVIADO')}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Enviar
                    </Button>
                  )}

                  {pedido.status === 'ENVIADO' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(pedido.id!, 'RECEBIDO')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Receber
                    </Button>
                  )}

                  {(pedido.status === 'PENDENTE' || pedido.status === 'ENVIADO') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(pedido.id!, 'CANCELADO')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>

          {selectedPedido && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número do Pedido</p>
                  <p className="font-semibold">{selectedPedido.numeroPedido}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedor</p>
                  <p className="font-semibold">{getFornecedorNome(selectedPedido.fornecedorId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data do Pedido</p>
                  <p className="font-semibold">{formatDate(selectedPedido.dataPedido)}</p>
                </div>
                {selectedPedido.dataPrevistaEntrega && (
                  <div>
                    <p className="text-sm text-muted-foreground">Entrega Prevista</p>
                    <p className="font-semibold">{formatDate(selectedPedido.dataPrevistaEntrega)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusConfig(selectedPedido.status)?.color}>
                    {getStatusConfig(selectedPedido.status)?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-semibold">{selectedPedido.tipo === 'AUTOMATICO' ? 'Automático' : 'Manual'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                <div className="space-y-2">
                  {getPedidoItens(selectedPedido.id!).map((item, index) => (
                    <Card key={item.id || index} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{getProdutoNome(item.produtoId)}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {item.quantidade} | Preço unitário: {formatCurrency(item.precoUnitario)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.valorTotal)}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedPedido.valorTotal)}
                  </span>
                </div>
              </div>

              {selectedPedido.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{selectedPedido.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}