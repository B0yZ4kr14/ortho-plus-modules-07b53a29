// @ts-nocheck
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, DollarSign } from 'lucide-react';

interface AberturaCaixaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (valorInicial: number, observacoes: string) => Promise<void>;
}

export function AberturaCaixaDialog({ open, onOpenChange, onConfirm }: AberturaCaixaDialogProps) {
  const [valorInicial, setValorInicial] = useState('0');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(parseFloat(valorInicial) || 0, observacoes);
      setValorInicial('0');
      setObservacoes('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Abertura de Caixa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="valor">Valor Inicial em Dinheiro (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
              placeholder="0.00"
              className="text-lg font-semibold"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Informe o valor em dinheiro disponível no início do expediente
            </p>
          </div>

          <div>
            <Label htmlFor="obs">Observações (opcional)</Label>
            <Textarea
              id="obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Troco para o dia, notas de R$ 50 e R$ 20"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Abrindo...
                </>
              ) : (
                'Abrir Caixa'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}