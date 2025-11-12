import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Requisicao, Produto } from '../types/estoque.types';
import { prioridadesRequisicao, statusRequisicao } from '../types/estoque.types';

interface RequisicoesListProps {
  requisicoes: Requisicao[];
  produtos: Produto[];
  onAprovar?: (id: string) => void;
  onRejeitar?: (id: string) => void;
  canApprove?: boolean;
}

export function RequisicoesList({ 
  requisicoes, 
  produtos, 
  onAprovar, 
  onRejeitar,
  canApprove = false 
}: RequisicoesListProps) {
  if (requisicoes.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma requisição encontrada</p>
      </div>
    );
  }

  const getProdutoNome = (id: string) => 
    produtos.find(p => p.id === id)?.nome || 'N/A';

  const getPrioridadeColor = (prioridade: string) =>
    prioridadesRequisicao.find(p => p.value === prioridade)?.color || 'bg-gray-500';

  const getStatusColor = (status: string) =>
    statusRequisicao.find(s => s.value === status)?.color || 'bg-gray-500';

  return (
    <div className="space-y-4">
      {requisicoes.map((req) => (
        <div
          key={req.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{getProdutoNome(req.produtoId)}</h3>
                <Badge className={getStatusColor(req.status)}>
                  {statusRequisicao.find(s => s.value === req.status)?.label}
                </Badge>
                <Badge className={getPrioridadeColor(req.prioridade)}>
                  {prioridadesRequisicao.find(p => p.value === req.prioridade)?.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Quantidade: <span className="font-medium">{req.quantidade}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {req.motivo}
              </p>
            </div>
            
            {canApprove && req.status === 'PENDENTE' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onAprovar?.(req.id!)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRejeitar?.(req.id!)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-2 md:grid-cols-2 text-sm border-t pt-3">
            <div>
              <span className="text-muted-foreground">Solicitado por:</span>
              <p className="font-medium">{req.solicitadoPor}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data:</span>
              <p className="font-medium">
                {req.createdAt && format(new Date(req.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {req.aprovadoPor && (
              <>
                <div>
                  <span className="text-muted-foreground">Aprovado por:</span>
                  <p className="font-medium">{req.aprovadoPor}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data aprovação:</span>
                  <p className="font-medium">
                    {req.dataAprovacao && format(new Date(req.dataAprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </>
            )}
          </div>

          {req.observacoes && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">Observações:</span>
              <p className="text-sm mt-1">{req.observacoes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
