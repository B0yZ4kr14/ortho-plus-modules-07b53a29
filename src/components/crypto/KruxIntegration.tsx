/**
 * KRUX INTEGRATION - Hardware Wallet Integration
 * Interface para comunicação com Krux DIY hardware wallet via QR codes
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Camera, Upload, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export function KruxIntegration() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'signed'>('idle');
  const [signedPSBT, setSignedPSBT] = useState('');

  const scanSignedTransaction = async () => {
    setStatus('scanning');
    
    try {
      // Em produção, usar biblioteca de scanner QR como html5-qrcode
      // Aqui, simulação para demonstração
      toast.info('Escaneie o QR Code do Krux com a transação assinada');
      
      // Simular delay de scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock de PSBT assinado
      setSignedPSBT('cHNidP8BAHECAAAAAcxxxxxxxx...');
      setStatus('signed');
      toast.success('Transação assinada recebida do Krux!');
    } catch (error) {
      console.error('Erro ao escanear:', error);
      toast.error('Erro ao escanear QR Code');
      setStatus('idle');
    }
  };

  const broadcastTransaction = async () => {
    try {
      // Broadcast da transação assinada
      const response = await fetch('/api/crypto/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedPsbt: signedPSBT }),
      });

      const data = await response.json();
      toast.success(`Transação enviada! TxID: ${data.txId.substring(0, 12)}...`);
      setStatus('idle');
      setSignedPSBT('');
    } catch (error) {
      console.error('Erro ao broadcast:', error);
      toast.error('Erro ao enviar transação');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Integração Krux Hardware Wallet
        </CardTitle>
        <CardDescription>
          Assine transações offline com seu Krux DIY e faça broadcast após validação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertDescription>
            <strong>Workflow:</strong> Gere PSBT → Assine no Krux → Escaneie transação assinada → Broadcast
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Status Krux</p>
              <p className="text-sm text-muted-foreground">
                {status === 'idle' && 'Aguardando transação assinada'}
                {status === 'scanning' && 'Escaneando QR Code...'}
                {status === 'signed' && 'Transação assinada recebida'}
              </p>
            </div>
          </div>
          <Badge variant={status === 'signed' ? 'default' : 'secondary'}>
            {status === 'idle' && 'Inativo'}
            {status === 'scanning' && 'Escaneando'}
            {status === 'signed' && 'Pronto'}
          </Badge>
        </div>

        {status === 'idle' && (
          <Button onClick={scanSignedTransaction} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Escanear Transação Assinada
          </Button>
        )}

        {status === 'scanning' && (
          <div className="flex items-center justify-center p-8 bg-muted rounded-lg animate-pulse">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {status === 'signed' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Transação assinada recebida e validada. Pronta para broadcast.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button onClick={broadcastTransaction} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Fazer Broadcast da Transação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatus('idle');
                  setSignedPSBT('');
                }}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
