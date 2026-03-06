import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Bitcoin,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useCrypto } from "@/hooks/useCrypto";
import { BitcoinQRCodeDialog } from "@/components/crypto/BitcoinQRCodeDialog";
import { toast } from "sonner";
import QRCode from "qrcode";

interface CryptoPaymentPDVProps {
  vendaId: string;
  valorTotal: number;
  onSuccess?: (txHash: string, cryptoCurrency: string) => void;
  onCancel?: () => void;
}

interface PaymentData {
  address: string;
  qrData: string;
  amount: number;
  coin: string;
  invoiceId?: string;
}

export default function CryptoPaymentPDV({
  vendaId,
  valorTotal,
  onSuccess,
  onCancel,
}: CryptoPaymentPDVProps) {
  const { wallets, offlineWallets, loading: loadingData } = useCrypto();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [generatingAddress, setGeneratingAddress] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "confirmed" | "failed"
  >("pending");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const allWallets = [
    ...wallets.map((w) => ({ ...w, type: "exchange", id: w.id.toString() })),
    ...offlineWallets.map((w) => ({
      ...w,
      type: "offline",
      id: w.id.toString(),
    })),
  ];

  // Mock exchange rates (em produção, buscar de API)
  const exchangeRates: Record<string, number> = {
    BTC: 350000, // 1 BTC = R$ 350.000
    ETH: 15000, // 1 ETH = R$ 15.000
    USDT: 5.5, // 1 USDT = R$ 5,50
    BNB: 2000, // 1 BNB = R$ 2.000
  };

  const cryptoAmount = (valorTotal / exchangeRates[selectedCoin]).toFixed(8);

  const handleGeneratePayment = async () => {
    if (!selectedWallet) {
      toast.error("Selecione uma wallet ou exchange");
      return;
    }

    setGeneratingAddress(true);
    try {
      // Em produção, chamar edge function 'generate-payment-address'
      // Aqui, simulando geração de endereço

      const wallet = allWallets.find((w) => w.id === selectedWallet);
      let mockAddress: string;
      let qrData: string;

      if (wallet?.type === "exchange") {
        // Exchange: usar endereço da config
        mockAddress =
          (wallet as any).wallet_address ||
          `bc1q${Math.random().toString(36).substring(2, 42)}`;
      } else {
        // Offline wallet: derivar do xPub (em produção)
        // Aqui, mock de endereço derivado
        mockAddress = `bc1q${Math.random().toString(36).substring(2, 42)}`;
      }

      // BIP21 URI format
      qrData = `${selectedCoin.toLowerCase()}:${mockAddress}?amount=${cryptoAmount}&label=PDV-${vendaId}`;

      const payment: PaymentData = {
        address: mockAddress,
        qrData,
        amount: parseFloat(cryptoAmount),
        coin: selectedCoin,
        invoiceId: `inv-${Date.now()}`,
      };

      setPaymentData(payment);

      // Gerar QR Code como Data URL
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);

      setQrDialogOpen(true);

      // Iniciar monitoramento de pagamento (polling)
      startPaymentMonitoring(payment.address);

      toast.success("Endereço de pagamento gerado!");
    } catch (error: any) {
      console.error("Error generating payment address:", error);
      toast.error("Erro ao gerar endereço de pagamento");
    } finally {
      setGeneratingAddress(false);
    }
  };

  const startPaymentMonitoring = (address: string) => {
    setPaymentStatus("processing");

    // Mock: simular confirmação após 5 segundos
    // Em produção, implementar polling real ou webhook subscription
    setTimeout(() => {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      setPaymentStatus("confirmed");

      toast.success("Pagamento confirmado na blockchain!", {
        description: `TxHash: ${mockTxHash.substring(0, 10)}...`,
      });

      if (onSuccess) {
        onSuccess(mockTxHash, selectedCoin);
      }

      // Fechar dialog após 2 segundos
      setTimeout(() => {
        setQrDialogOpen(false);
      }, 2000);
    }, 5000);
  };

  const handleCancel = () => {
    setPaymentStatus("pending");
    setPaymentData(null);
    setQrDialogOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  if (loadingData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (allWallets.length === 0) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma wallet ou exchange configurada. Configure em{" "}
            <a href="/settings/crypto" className="font-medium underline">
              Configurações → Crypto
            </a>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-primary" />
            <CardTitle>Pagamento em Criptomoeda</CardTitle>
          </div>
          <CardDescription>
            Aceite pagamentos em BTC, ETH, USDT e outras criptomoedas
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Seleção de Wallet */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Wallet de Recebimento
            </label>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma wallet ou exchange" />
              </SelectTrigger>
              <SelectContent>
                {allWallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center gap-2">
                      <span>{wallet.wallet_name || "Unnamed Wallet"}</span>
                      <Badge variant="outline" className="text-xs">
                        {wallet.type === "exchange" ? "Exchange" : "Offline"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Criptomoeda */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Criptomoeda
            </label>
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

          {/* Info do Pagamento */}
          <Alert className="bg-primary/5 border-primary/20">
            <Bitcoin className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-1">
                <p>
                  <strong>Valor em BRL:</strong> R$ {valorTotal.toFixed(2)}
                </p>
                <p>
                  <strong>Valor em {selectedCoin}:</strong> {cryptoAmount}{" "}
                  {selectedCoin}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Taxa de câmbio: 1 {selectedCoin} = R${" "}
                  {exchangeRates[selectedCoin].toLocaleString("pt-BR")}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGeneratePayment}
              disabled={!selectedWallet || generatingAddress}
              className="flex-1"
            >
              {generatingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Bitcoin className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </>
              )}
            </Button>

            {onCancel && (
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>

          {/* Status do Pagamento */}
          {paymentStatus !== "pending" && (
            <Alert
              variant={paymentStatus === "confirmed" ? "default" : "default"}
            >
              {paymentStatus === "processing" && (
                <>
                  <Clock className="h-4 w-4 text-warning" />
                  <AlertDescription>
                    Aguardando confirmação na blockchain...
                  </AlertDescription>
                </>
              )}
              {paymentStatus === "confirmed" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription>Pagamento confirmado! ✅</AlertDescription>
                </>
              )}
              {paymentStatus === "failed" && (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription>
                    Erro no pagamento. Tente novamente.
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dialog com QR Code */}
      {paymentData && (
        <BitcoinQRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          wallets={[
            {
              id: paymentData.invoiceId || "1",
              wallet_address: paymentData.address,
              coin_type: paymentData.coin,
              wallet_name: `Pagamento ${paymentData.coin}`,
            },
          ]}
          onGeneratePayment={async (data) => {
            console.log("Payment generated:", data);
          }}
        />
      )}
    </>
  );
}
