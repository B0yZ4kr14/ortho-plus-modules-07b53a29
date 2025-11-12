import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface BitcoinQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: any[];
  onGeneratePayment: (data: {
    wallet_id: string;
    amount_crypto: number;
    patient_id?: string;
    conta_receber_id?: string;
  }) => Promise<void>;
}

export function BitcoinQRCodeDialog({
  open,
  onOpenChange,
  wallets,
  onGeneratePayment,
}: BitcoinQRCodeDialogProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [bitcoinUri, setBitcoinUri] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const wallet = wallets.find(w => w.id === selectedWallet);

  useEffect(() => {
    if (wallet && amount && parseFloat(amount) > 0) {
      generateQRCode();
    } else {
      setQrCodeUrl('');
      setBitcoinUri('');
    }
  }, [selectedWallet, amount, wallet]);

  const generateQRCode = async () => {
    if (!wallet || !amount) return;

    // BIP21 URI format: bitcoin:address?amount=X&label=Y
    const uri = `bitcoin:${wallet.wallet_address}?amount=${amount}&label=Clinica%20Odontologica`;
    setBitcoinUri(uri);

    try {
      const url = await QRCode.toDataURL(uri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const handleCopyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.wallet_address);
      toast.success('Endereço copiado!');
    }
  };

  const handleCopyUri = () => {
    if (bitcoinUri) {
      navigator.clipboard.writeText(bitcoinUri);
      toast.success('URI Bitcoin copiado!');
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `bitcoin-payment-${amount}-${wallet?.coin_type}.png`;
      link.click();
      toast.success('QR Code baixado!');
    }
  };

  const handleGeneratePayment = async () => {
    if (!selectedWallet || !amount || parseFloat(amount) <= 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await onGeneratePayment({
        wallet_id: selectedWallet,
        amount_crypto: parseFloat(amount),
      });
      toast.success('Solicitação de pagamento criada! Aguardando confirmação na blockchain...');
      onOpenChange(false);
      setAmount('');
      setSelectedWallet('');
    } catch (error) {
      console.error('Error generating payment:', error);
      toast.error('Erro ao criar solicitação de pagamento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Gerar QR Code de Pagamento Bitcoin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Carteira *</Label>
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a carteira" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.filter(w => w.is_active).map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.wallet_name} ({wallet.coin_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor em {wallet?.coin_type || 'Crypto'} *</Label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {wallet && (
            <div className="space-y-2">
              <Label>Endereço da Carteira</Label>
              <div className="flex gap-2">
                <Input
                  value={wallet.wallet_address}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {qrCodeUrl && (
            <div className="space-y-4">
              <div className="flex justify-center p-6 bg-muted rounded-lg">
                <img src={qrCodeUrl} alt="QR Code Bitcoin" className="rounded" />
              </div>

              <div className="space-y-2">
                <Label>URI Bitcoin (BIP21)</Label>
                <div className="flex gap-2">
                  <Input
                    value={bitcoinUri}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyUri}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR Code
                </Button>
                <Button
                  onClick={handleGeneratePayment}
                  className="flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar Solicitação de Pagamento
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center p-4 bg-muted/50 rounded">
                <p className="font-semibold mb-2">Instruções para o Paciente:</p>
                <p>1. Abra sua carteira Bitcoin (Binance, Coinbase, etc.)</p>
                <p>2. Escaneie o QR Code acima</p>
                <p>3. Confirme o valor de {amount} {wallet?.coin_type}</p>
                <p>4. Envie a transação</p>
                <p className="mt-2 text-amber-600 dark:text-amber-400">
                  ⚠️ Aguarde 3 confirmações na blockchain para confirmação completa
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
