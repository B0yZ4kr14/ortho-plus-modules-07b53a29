// @ts-nocheck
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CaixaMovimento } from '@/hooks/usePDVSupabase';

interface FechamentoCaixaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaAberto: CaixaMovimento;
  valorEsperado: number;
  onConfirm: (valorFinal: number, observacoes: string) => Promise<void>;
}

export function FechamentoCaixaDialog({ 
  open, 
  onOpenChange, 
  caixaAberto, 
  valorEsperado,
  onConfirm 
}: FechamentoCaixaDialogProps) {
  const [valorFinal, setValorFinal] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const diferenca = valorFinal ? parseFloat(valorFinal) - valorEsperado : 0;
  const hasDiferenca = Math.abs(diferenca) > 0.01;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(parseFloat(valorFinal) || 0, observacoes);
      setValorFinal('');
      setObservacoes('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            Fechamento de Caixa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-muted-foreground mb-1">Valor Inicial</p>
              <p className="text-2xl font-bold">
                R$ {caixaAberto.valor_inicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">Valor Esperado</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {valorEsperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {hasDiferenca && (
              <div className={`p-4 rounded-lg border ${
                diferenca > 0 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <p className="text-sm text-muted-foreground mb-1">Diferença</p>
                <p className={`text-2xl font-bold ${diferenca > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diferenca > 0 ? '+' : ''}R$ {Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* Valor contado */}
          <div>
            <Label htmlFor="valorFinal">Valor Contado em Dinheiro (R$) *</Label>
            <Input
              id="valorFinal"
              type="number"
              step="0.01"
              value={valorFinal}
              onChange={(e) => setValorFinal(e.target.value)}
              placeholder="0.00"
              className="text-lg font-semibold"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Conte todo o dinheiro no caixa e informe o valor total
            </p>
          </div>

          {/* Alerta de diferença */}
          {hasDiferenca && valorFinal && (
            <Alert variant={diferenca > 0 ? 'default' : 'destructive'}>
              {diferenca > 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {diferenca > 0 ? (
                  <>
                    <strong>Sobra detectada:</strong> Há R$ {Math.abs(diferenca).toFixed(2)} a mais no caixa.
                    {diferenca > 50 && ' Verifique se não houve erro na contagem.'}
                  </>
                ) : (
                  <>
                    <strong>Falta detectada:</strong> Há R$ {Math.abs(diferenca).toFixed(2)} a menos no caixa.
                    Por favor, revise a contagem e as transações do dia.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="obs">Observações {hasDiferenca && '(obrigatório)'}</Label>
            <Textarea
              id="obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder={hasDiferenca 
                ? "Explique o motivo da diferença encontrada..."
                : "Observações sobre o fechamento (opcional)"
              }
              rows={3}
              required={hasDiferenca}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !valorFinal || (hasDiferenca && !observacoes)}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fechando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Fechar Caixa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}