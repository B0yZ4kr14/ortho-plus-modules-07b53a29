import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Clock, TrendingUp, Check, X } from 'lucide-react';
import type { Alerta, Produto } from '../types/estoque.types';

interface AlertasEstoqueProps {
  alertas: Alerta[];
  produtos: Produto[];
  onMarcarLido: (id: string) => void;
  onLimparLidos: () => void;
}

export function AlertasEstoque({ alertas, produtos, onMarcarLido, onLimparLidos }: AlertasEstoqueProps) {
  const alertasNaoLidos = alertas.filter(a => !a.lido);
  const alertasLidos = alertas.filter(a => a.lido);

  const getProdutoNome = (id: string) => 
    produtos.find(p => p.id === id)?.nome || 'N/A';

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ESTOQUE_CRITICO':
        return <AlertTriangle className="h-5 w-5" />;
      case 'ESTOQUE_MINIMO':
        return <AlertCircle className="h-5 w-5" />;
      case 'VALIDADE_PROXIMA':
        return <Clock className="h-5 w-5" />;
      case 'SUGESTAO_REPOSICAO':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getTipoVariant = (tipo: string): 'default' | 'destructive' => {
    switch (tipo) {
      case 'ESTOQUE_CRITICO':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (alertas.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <p className="text-muted-foreground">Nenhum alerta no momento</p>
        <p className="text-sm text-muted-foreground">Todos os produtos estão com estoque adequado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alertasNaoLidos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Alertas Ativos ({alertasNaoLidos.length})</h3>
            <Button variant="outline" size="sm" onClick={onLimparLidos}>
              <X className="h-4 w-4 mr-2" />
              Limpar Lidos
            </Button>
          </div>
          {alertasNaoLidos.map((alerta) => (
            <Alert key={alerta.id} variant={getTipoVariant(alerta.tipo)}>
              <div className="flex items-start gap-3">
                {getTipoIcon(alerta.tipo)}
                <div className="flex-1">
                  <AlertTitle className="mb-2">
                    {getProdutoNome(alerta.produtoId)}
                  </AlertTitle>
                  <AlertDescription className="mb-3">
                    {alerta.mensagem}
                  </AlertDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estoque atual: </span>
                      <span className="font-medium">{alerta.quantidadeAtual}</span>
                    </div>
                    {alerta.quantidadeSugerida && (
                      <div>
                        <span className="text-muted-foreground">Sugestão de compra: </span>
                        <Badge variant="secondary">{alerta.quantidadeSugerida}</Badge>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarcarLido(alerta.id!)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {alertasLidos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Alertas Resolvidos ({alertasLidos.length})
          </h3>
          {alertasLidos.map((alerta) => (
            <Alert key={alerta.id} className="opacity-60">
              <div className="flex items-start gap-3">
                {getTipoIcon(alerta.tipo)}
                <div className="flex-1">
                  <AlertTitle className="mb-2">
                    {getProdutoNome(alerta.produtoId)}
                  </AlertTitle>
                  <AlertDescription>
                    {alerta.mensagem}
                  </AlertDescription>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
