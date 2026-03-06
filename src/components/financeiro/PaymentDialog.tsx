import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, QrCode, Loader2, Bitcoin } from "lucide-react";
import { CryptoPaymentSelector } from "@/components/crypto/CryptoPaymentSelector";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/apiClient";
import type { ContaReceber } from "@/modules/financeiro/types/financeiro-completo.types";
import { useConfetti } from "@/hooks/useConfetti";

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  conta: ContaReceber;
  onSuccess: () => void;
}

export function PaymentDialog({
  open,
  onClose,
  conta,
  onSuccess,
}: PaymentDialogProps) {
  const { triggerSuccessConfetti } = useConfetti();
  const [loading, setLoading] = useState(false);
  const [metodo, setMetodo] = useState<
    "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "CRYPTO"
  >("PIX");
  const [valor, setValor] = useState(
    (conta.valor - (conta.valor_pago || 0)).toString(),
  );

  // Campos PIX
  const [pixKey, setPixKey] = useState("");

  // Campos Cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const valorNumerico = parseFloat(valor);

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error("Valor inválido");
      }

      const data = await apiClient.post<any>(
        "/functions/v1/processar-pagamento",
        {
          conta_receber_id: conta.id,
          valor: valorNumerico,
          metodo_pagamento: metodo,
          dados_pagamento:
            metodo === "PIX"
              ? { pix_key: pixKey }
              : {
                  card_number: cardNumber,
                  card_holder: cardHolder,
                  card_expiry: cardExpiry,
                  card_cvv: cardCvv,
                },
        },
      );

      // Trigger confetti celebration for successful payment
      triggerSuccessConfetti();

      toast.success("Pagamento processado com sucesso!", {
        description: `Transação: ${data.transacao_id}`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento", {
        description: error.message || "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Processar Pagamento</DialogTitle>
          <DialogDescription>
            Paciente: {conta.patient_name} | Valor restante: R${" "}
            {(conta.valor - (conta.valor_pago || 0)).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor a Pagar</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <Tabs value={metodo} onValueChange={(v) => setMetodo(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="PIX" className="gap-2">
                <QrCode className="h-4 w-4" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="CARTAO_CREDITO" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Cartão
              </TabsTrigger>
              <TabsTrigger value="CRYPTO" className="gap-2">
                <Bitcoin className="h-4 w-4" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="PIX" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="pix-key">Chave PIX</Label>
                <Input
                  id="pix-key"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, email, telefone ou chave aleatória"
                  required={metodo === "PIX"}
                />
              </div>
            </TabsContent>

            <TabsContent value="CARTAO_CREDITO" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Número do Cartão</Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  required={metodo !== "PIX"}
                  maxLength={19}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-holder">Nome no Cartão</Label>
                <Input
                  id="card-holder"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="NOME COMPLETO"
                  required={metodo !== "PIX"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry">Validade</Label>
                  <Input
                    id="card-expiry"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    required={metodo !== "PIX"}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-cvv">CVV</Label>
                  <Input
                    id="card-cvv"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="000"
                    required={metodo !== "PIX"}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-type">Tipo de Cartão</Label>
                <Select
                  value={metodo}
                  onValueChange={(v) => setMetodo(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARTAO_CREDITO">Crédito</SelectItem>
                    <SelectItem value="CARTAO_DEBITO">Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Pagamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
