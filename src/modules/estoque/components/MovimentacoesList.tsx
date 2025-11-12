import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, RotateCcw, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Movimentacao, Produto, Fornecedor } from '../types/estoque.types';
import { tiposMovimentacao } from '../types/estoque.types';

interface MovimentacoesListProps {
  movimentacoes: Movimentacao[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
}

export function MovimentacoesList({ movimentacoes, produtos, fornecedores }: MovimentacoesListProps) {
  if (movimentacoes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
      </div>
    );
  }

  const getProdutoNome = (id: string) => 
    produtos.find(p => p.id === id)?.nome || 'N/A';

  const getFornecedorNome = (id?: string) => 
    id ? (fornecedores.find(f => f.id === id)?.nome || '-') : '-';

  const getTipoColor = (tipo: string) =>
    tiposMovimentacao.find(t => t.value === tipo)?.color || 'bg-gray-500';

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
        return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
      case 'SAIDA':
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
      case 'AJUSTE':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'DEVOLUCAO':
        return <RotateCcw className="h-5 w-5 text-yellow-500" />;
      case 'PERDA':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {movimentacoes.map((mov) => (
        <div
          key={mov.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-muted">
              {getTipoIcon(mov.tipo)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{getProdutoNome(mov.produtoId)}</h3>
                <Badge className={getTipoColor(mov.tipo)}>
                  {tiposMovimentacao.find(t => t.value === mov.tipo)?.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Quantidade: <span className="font-medium">{mov.quantidade}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {mov.motivo}
              </p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3 text-sm border-t pt-3">
            <div>
              <span className="text-muted-foreground">Realizado por:</span>
              <p className="font-medium">{mov.realizadoPor}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data:</span>
              <p className="font-medium">
                {mov.createdAt && format(new Date(mov.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {mov.lote && (
              <div>
                <span className="text-muted-foreground">Lote:</span>
                <p className="font-medium">{mov.lote}</p>
              </div>
            )}
            {mov.fornecedorId && (
              <div>
                <span className="text-muted-foreground">Fornecedor:</span>
                <p className="font-medium">{getFornecedorNome(mov.fornecedorId)}</p>
              </div>
            )}
            {mov.notaFiscal && (
              <div>
                <span className="text-muted-foreground">Nota Fiscal:</span>
                <p className="font-medium">{mov.notaFiscal}</p>
              </div>
            )}
            {mov.valorTotal && (
              <div>
                <span className="text-muted-foreground">Valor Total:</span>
                <p className="font-medium">R$ {mov.valorTotal.toFixed(2)}</p>
              </div>
            )}
          </div>

          {mov.observacoes && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">Observações:</span>
              <p className="text-sm mt-1">{mov.observacoes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
