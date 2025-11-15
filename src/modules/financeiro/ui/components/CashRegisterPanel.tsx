import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Lock, Unlock } from 'lucide-react';
import { CashRegister } from '../../domain/entities/CashRegister';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashRegisterPanelProps {
  currentRegister: CashRegister | null;
  isOpen: boolean;
  loading: boolean;
  onOpen: (initialAmount: number, notes?: string) => Promise<void>;
  onClose: (finalAmount: number, expectedAmount: number, notes?: string) => Promise<void>;
}

export function CashRegisterPanel({
  currentRegister,
  isOpen,
  loading,
  onOpen,
  onClose,
}: CashRegisterPanelProps) {
  const [openAmount, setOpenAmount] = useState('');
  const [openNotes, setOpenNotes] = useState('');
  const [closeAmount, setCloseAmount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);

  const handleOpen = async () => {
    try {
      await onOpen(parseFloat(openAmount), openNotes || undefined);
      setOpenAmount('');
      setOpenNotes('');
      setShowOpenForm(false);
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
    }
  };

  const handleClose = async () => {
    if (!currentRegister) return;
    try {
      const expectedAmount = currentRegister.initialAmount.toNumber(); // Simplificado
      await onClose(parseFloat(closeAmount), expectedAmount, closeNotes || undefined);
      setCloseAmount('');
      setCloseNotes('');
      setShowCloseForm(false);
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Controle de Caixa
          </CardTitle>
          <Badge variant={isOpen ? 'default' : 'secondary'}>
            {isOpen ? (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Aberto
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Fechado
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-center">Carregando...</p>
        ) : isOpen && currentRegister ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Aberto em: {format(currentRegister.openedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              <p className="text-2xl font-bold text-primary">
                R$ {currentRegister.initialAmount.toNumber().toFixed(2)}
              </p>
              {currentRegister.notes && (
                <p className="text-sm text-muted-foreground">{currentRegister.notes}</p>
              )}
            </div>

            {!showCloseForm ? (
              <Button onClick={() => setShowCloseForm(true)} variant="destructive" className="w-full">
                Fechar Caixa
              </Button>
            ) : (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="closeAmount">Valor Final (R$)</Label>
                  <Input
                    id="closeAmount"
                    type="number"
                    step="0.01"
                    value={closeAmount}
                    onChange={(e) => setCloseAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeNotes">Observações</Label>
                  <Textarea
                    id="closeNotes"
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleClose} variant="destructive" className="flex-1">
                    Confirmar Fechamento
                  </Button>
                  <Button onClick={() => setShowCloseForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {!showOpenForm ? (
              <Button onClick={() => setShowOpenForm(true)} className="w-full">
                Abrir Caixa
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openAmount">Valor Inicial (R$)</Label>
                  <Input
                    id="openAmount"
                    type="number"
                    step="0.01"
                    value={openAmount}
                    onChange={(e) => setOpenAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openNotes">Observações</Label>
                  <Textarea
                    id="openNotes"
                    value={openNotes}
                    onChange={(e) => setOpenNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleOpen} className="flex-1">
                    Confirmar Abertura
                  </Button>
                  <Button onClick={() => setShowOpenForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
