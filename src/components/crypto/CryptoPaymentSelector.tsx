/**
 * Crypto Payment Selector Component
 * Seletor de pagamento crypto para integração em PaymentDialog e PDV
 */

import { useState, useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bitcoin, Loader2, CheckCircle2, QrCode } from 'lucide-react';
import { useCryptoSupabase } from '@/hooks/useCryptoSupabase';
import { BitcoinQRCodeDialog } from './BitcoinQRCodeDialog';
import { toast } from 'sonner';

interface CryptoPaymentSelectorProps {
  amount: number;
  onPaymentConfirmed: (txHash: string, cryptoCurrency: string) => void;
}

export const CryptoPaymentSelector = memo(function CryptoPaymentSelector({ amount, onPaymentConfirmed }: CryptoPaymentSelectorProps) {
  const { wallets, offlineWallets, loading: loadingData } = useCryptoSupabase();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [generatingAddress, setGeneratingAddress] = useState(false);

  // ✅ FASE 2: Memoizar lista combinada de wallets
  const allWallets = useMemo(() => [
    ...wallets.map(w => ({ ...w, type: 'exchange' })),
    ...offlineWallets.map(w => ({ ...w, type: 'offline' })),
  ], [wallets, offlineWallets]);

  const handleGeneratePayment = async () => {
    if (!selectedWallet) {
      toast.error('Selecione uma wallet');
      return;
    }

    setGeneratingAddress(true);
    try {
      // Simular geração de endereço de pagamento
      // Em produção, chamar edge function
      const mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
      const mockQrData = `bitcoin:${mockAddress}?amount=${amount}`;

      setPaymentData({
        address: mockAddress,
        qrData: mockQrData,
        amount,
        coin: selectedCoin,
      });

      setQrDialogOpen(true);
    } catch (error: any) {
      console.error('Error generating payment address:', error);
      toast.error('Erro ao gerar endereço de pagamento');
    } finally {
      setGeneratingAddress(false);
    }
  };

  const handlePaymentGenerated = async (data: any) => {
    // Simular confirmação de pagamento
    // Em produção, implementar polling ou webhook
    toast.success('Pagamento em processamento. Aguardando confirmações blockchain...');
    
    // Mock confirmation após 3 segundos
    setTimeout(() => {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      onPaymentConfirmed(mockTxHash, selectedCoin);
      toast.success('Pagamento confirmado!');
    }, 3000);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allWallets.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Nenhuma wallet configurada. Configure uma exchange ou wallet offline nas Configurações.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Wallet de Recebimento</label>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma wallet" />
              </SelectTrigger>
              <SelectContent>
                {allWallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.wallet_name} 
                    <Badge variant="outline" className="ml-2">
                      {wallet.type === 'exchange' ? 'Exchange' : 'Offline'}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Criptomoeda</label>
            <Select value={selectedCoin} onValueChange={setSelectedCoin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
                <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <Bitcoin className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>Valor a receber:</strong> R$ {amount.toFixed(2)} (~
              {(amount / 350000).toFixed(8)} {selectedCoin})
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleGeneratePayment}
            disabled={!selectedWallet || generatingAddress}
            className="w-full gap-2"
          >
            {generatingAddress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando endereço...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Gerar QR Code de Pagamento
              </>
            )}
          </Button>
        </div>
      </Card>

      {paymentData && (
        <BitcoinQRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          wallets={[{ ...paymentData, wallet_address: paymentData.address }]}
          onGeneratePayment={handlePaymentGenerated}
        />
      )}
    </div>
  );
});
