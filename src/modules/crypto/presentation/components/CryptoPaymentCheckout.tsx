import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QrCode, Copy, ExternalLink, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface CryptoPaymentCheckoutProps {
  paymentId: string;
  invoiceId: string;
  checkoutLink: string;
  qrCodeData: string;
  amountBRL: number;
  expiresAt: string;
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'EXPIRED' | 'FAILED';
  onStatusChange?: (newStatus: string) => void;
}

export function CryptoPaymentCheckout({
  paymentId,
  invoiceId,
  checkoutLink,
  qrCodeData,
  amountBRL,
  expiresAt,
  status,
  onStatusChange,
}: CryptoPaymentCheckoutProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Gerar QR Code
  useState(() => {
    QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }).then(setQrCodeImage);
  });

  // Calcular tempo restante
  useState(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(qrCodeData);
    toast.success('Endereço copiado!');
  };

  const handleOpenCheckout = () => {
    window.open(checkoutLink, '_blank');
  };

  const getStatusBadge = () => {
    const statusConfig = {
      PENDING: { label: 'Aguardando Pagamento', variant: 'secondary' as const, icon: Clock },
      PROCESSING: { label: 'Processando', variant: 'default' as const, icon: Loader2 },
      CONFIRMED: { label: 'Confirmado', variant: 'default' as const, icon: CheckCircle2 },
      EXPIRED: { label: 'Expirado', variant: 'destructive' as const, icon: XCircle },
      FAILED: { label: 'Falhou', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Pagamento em Criptomoeda</CardTitle>
            <CardDescription>
              Escaneie o QR Code ou copie o endereço para pagar
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Valor */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Valor Total</p>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(amountBRL)}
          </p>
        </div>

        <Separator />

        {/* QR Code */}
        {qrCodeImage && status === 'PENDING' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCodeImage} alt="QR Code de Pagamento" className="w-64 h-64" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Escaneie este QR Code com sua carteira de criptomoedas
            </p>
          </div>
        )}

        {/* Endereço de Pagamento */}
        {status === 'PENDING' && (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Endereço de Pagamento</p>
              <div className="flex gap-2">
                <code className="flex-1 p-3 bg-muted rounded-md text-xs break-all">
                  {qrCodeData}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleOpenCheckout} className="w-full" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Checkout BTCPay
            </Button>
          </>
        )}

        {/* Tempo Restante */}
        {status === 'PENDING' && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tempo restante:</span>
            </div>
            <span className="font-mono font-bold">{timeRemaining}</span>
          </div>
        )}

        {/* Moedas Aceitas */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Criptomoedas Aceitas</p>
          <div className="flex flex-wrap gap-2">
            {['BTC', 'ETH', 'USDT', 'LTC', 'DAI', 'Lightning'].map((coin) => (
              <Badge key={coin} variant="outline">
                {coin}
              </Badge>
            ))}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>ID do Pagamento:</span>
            <span className="font-mono">{paymentId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice ID:</span>
            <span className="font-mono">{invoiceId}</span>
          </div>
          <div className="flex justify-between">
            <span>Expira em:</span>
            <span>
              {new Date(expiresAt).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {status === 'PROCESSING' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ⏳ Processando pagamento... Aguarde a confirmação na blockchain.
            </p>
          </div>
        )}

        {status === 'CONFIRMED' && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✅ Pagamento confirmado com sucesso!
            </p>
          </div>
        )}

        {status === 'EXPIRED' && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <p className="text-sm text-orange-900 dark:text-orange-100">
              ⏱️ Este pagamento expirou. Por favor, gere um novo.
            </p>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-100">
              ❌ Pagamento falhou. Entre em contato com o suporte.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
