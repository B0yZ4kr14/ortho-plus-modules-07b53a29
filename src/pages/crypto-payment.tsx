import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CryptoPaymentCheckout } from '@/modules/crypto/presentation/components/CryptoPaymentCheckout';
import { CryptoPaymentStatus } from '@/modules/crypto/presentation/components/CryptoPaymentStatus';
import { CryptoPaymentHistory } from '@/modules/crypto/presentation/components/CryptoPaymentHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Bitcoin, Shield, Zap } from 'lucide-react';

export default function CryptoPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountBRL = parseFloat(amount);
    if (isNaN(amountBRL) || amountBRL <= 0) {
      toast.error('Valor inválido', { description: 'Digite um valor maior que zero' });
      return;
    }

    if (!orderId.trim()) {
      toast.error('ID do Pedido obrigatório');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-invoice', {
        body: {
          amountBRL,
          orderId: orderId.trim(),
          patientEmail: 'paciente@example.com', // TODO: Get from patient context
          metadata: {
            description: 'Pagamento de tratamento odontológico',
          },
        },
      });

      if (error) throw error;

      setPaymentData(data);
      setActivePaymentId(data.paymentId);
      toast.success('Invoice criada!', {
        description: 'Escaneie o QR Code para pagar',
      });
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      if (error.message?.includes('Rate limit')) {
        toast.error('Rate limit excedido', {
          description: 'Aguarde alguns minutos e tente novamente',
        });
      } else if (error.message?.includes('Payment required')) {
        toast.error('Créditos insuficientes', {
          description: 'Adicione créditos ao workspace Lovable',
        });
      } else {
        toast.error('Erro ao criar invoice', {
          description: error.message || 'Tente novamente',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (paymentData) {
      setPaymentData({ ...paymentData, status: newStatus });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Pagamentos em Criptomoeda</h1>
        <p className="text-muted-foreground mt-2">
          Aceite pagamentos em Bitcoin, Ethereum, USDT e outras criptomoedas
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <Bitcoin className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Múltiplas Moedas</CardTitle>
            <CardDescription>
              Aceite BTC, ETH, USDT, LTC, DAI e Lightning Network
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-green-500" />
            <CardTitle>Seguro e Confiável</CardTitle>
            <CardDescription>
              Integração com BTCPay Server - Auto-custódia total
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-yellow-500" />
            <CardTitle>Confirmação Rápida</CardTitle>
            <CardDescription>
              Acompanhe confirmações em tempo real via blockchain
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Criar Pagamento</TabsTrigger>
          <TabsTrigger value="status" disabled={!activePaymentId}>
            Acompanhar Status
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Novo Pagamento</CardTitle>
                <CardDescription>
                  Crie uma invoice para receber pagamento em criptomoeda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (BRL)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="150.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderId">ID do Pedido / Tratamento</Label>
                    <Input
                      id="orderId"
                      type="text"
                      placeholder="TRAT-2025-001"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando Invoice...
                      </>
                    ) : (
                      'Criar Invoice de Pagamento'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Checkout */}
            {paymentData && (
              <CryptoPaymentCheckout
                paymentId={paymentData.paymentId}
                invoiceId={paymentData.invoiceId}
                checkoutLink={paymentData.checkoutLink}
                qrCodeData={paymentData.qrCodeData}
                amountBRL={parseFloat(amount)}
                expiresAt={paymentData.expiresAt}
                status={paymentData.status}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="status">
          {activePaymentId && (
            <CryptoPaymentStatus
              paymentId={activePaymentId}
              onStatusChange={handleStatusChange}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <CryptoPaymentHistory />
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">1. Criar Invoice</h3>
              <p className="text-sm text-muted-foreground">
                Digite o valor em BRL e crie uma invoice de pagamento. Um QR Code será gerado
                automaticamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Escanear QR Code</h3>
              <p className="text-sm text-muted-foreground">
                O paciente escaneia o QR Code com sua carteira de criptomoedas e realiza o
                pagamento na moeda de sua preferência.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Aguardar Confirmações</h3>
              <p className="text-sm text-muted-foreground">
                O sistema acompanha as confirmações na blockchain em tempo real. Geralmente
                são necessárias 3 confirmações.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. Pagamento Confirmado</h3>
              <p className="text-sm text-muted-foreground">
                Após as confirmações, o pagamento é automaticamente registrado no sistema e
                a conta a receber é atualizada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
