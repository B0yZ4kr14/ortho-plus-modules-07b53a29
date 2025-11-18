/**
 * PSBT BUILDER - Partially Signed Bitcoin Transaction
 * Permite criar transações Bitcoin offline para assinatura com hardware wallets (Krux, Jade, etc.)
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeCanvas } from 'qrcode.react';
import { Shield, Copy, Check, AlertCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export function PSBTBuilder() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [psbtBase64, setPsbtBase64] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePSBT = async () => {
    try {
      // Validações
      if (!recipient || !amount) {
        toast.error('Preencha destinatário e valor');
        return;
      }

      // Chamar backend para criar PSBT
      const response = await fetch('/api/crypto/create-psbt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();
      setPsbtBase64(data.psbt);
      toast.success('PSBT gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PSBT:', error);
      toast.error('Erro ao gerar transação');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(psbtBase64);
    setCopied(true);
    toast.success('PSBT copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Construtor PSBT (Offline Transaction)
        </CardTitle>
        <CardDescription>
          Crie transações Bitcoin parcialmente assinadas para assinatura offline com hardware wallets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Endereço Destinatário</Label>
          <Input
            id="recipient"
            placeholder="bc1q..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (BTC)</Label>
          <Input
            id="amount"
            type="number"
            step="0.00000001"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button onClick={generatePSBT} className="w-full">
          <QrCode className="mr-2 h-4 w-4" />
          Gerar PSBT
        </Button>

        {psbtBase64 && (
          <div className="space-y-4 pt-4 border-t">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Escaneie o QR Code com seu Krux/Jade ou copie o PSBT para assinar offline
              </AlertDescription>
            </Alert>

            <div className="flex justify-center p-4 bg-background rounded-lg">
              <QRCodeCanvas value={psbtBase64} size={256} />
            </div>

            <div className="space-y-2">
              <Label>PSBT Base64</Label>
              <Textarea
                value={psbtBase64}
                readOnly
                rows={4}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar PSBT
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
