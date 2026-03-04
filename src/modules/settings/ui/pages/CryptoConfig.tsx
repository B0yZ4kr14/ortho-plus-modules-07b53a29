/**
 * Crypto Configuration Page
 * Página centralizada para configurações de criptomoedas
 * /settings/crypto
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Bitcoin, Wallet, Server } from 'lucide-react';
import { ExchangeConfigForm } from '@/components/crypto/ExchangeConfigForm';
import { WalletForm } from '@/components/crypto/WalletForm';
import { XPubConfigForm } from '@/components/crypto/XPubConfigForm';
import { useCryptoSupabase } from '@/hooks/useCryptoSupabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function CryptoConfig() {
  const { exchanges, wallets, offlineWallets, reloadData } = useCryptoSupabase();
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showXPubDialog, setShowXPubDialog] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Configurações de Criptomoedas"
        description="Configure exchanges, wallets e BTCPay Server para receber pagamentos em crypto"
        icon={Bitcoin}
      />

      <Tabs defaultValue="exchanges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchanges" className="gap-2">
            <Server className="h-4 w-4" />
            Exchanges
          </TabsTrigger>
          <TabsTrigger value="wallets" className="gap-2">
            <Wallet className="h-4 w-4" />
            Wallets Offline
          </TabsTrigger>
          <TabsTrigger value="btcpay" className="gap-2">
            <Bitcoin className="h-4 w-4" />
            BTCPay Server
          </TabsTrigger>
        </TabsList>

        {/* TAB: Exchanges */}
        <TabsContent value="exchanges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Exchanges Configuradas</h3>
            <Button onClick={() => setShowExchangeDialog(true)}>
              Adicionar Exchange
            </Button>
          </div>

          {exchanges.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Nenhuma exchange configurada. Clique em "Adicionar Exchange" para começar.
            </Card>
          ) : (
            <div className="grid gap-4">
              {exchanges.map((exchange) => (
                <Card key={exchange.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exchange.exchange_name}</h4>
                      <div className="flex gap-2 mt-2">
                        {exchange.supported_coins?.map((coin: string) => (
                          <Badge key={coin} variant="secondary">
                            {coin}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={exchange.is_active ? 'success' : 'secondary'}>
                      {exchange.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={showExchangeDialog} onOpenChange={setShowExchangeDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ExchangeConfigForm
                onSubmit={async (data) => {
                  await reloadData();
                  setShowExchangeDialog(false);
                }}
                onCancel={() => setShowExchangeDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB: Wallets Offline (xPub) */}
        <TabsContent value="wallets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Wallets Não-Custodiais (xPub)</h3>
            <Button onClick={() => setShowXPubDialog(true)}>
              Configurar Hardware Wallet
            </Button>
          </div>

          {offlineWallets.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Nenhuma wallet offline configurada. Use sua Hardware Wallet (Trezor, Coldcard, KRUX).
            </Card>
          ) : (
            <div className="grid gap-4">
              {offlineWallets.map((wallet) => (
                <Card key={wallet.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{wallet.wallet_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {wallet.hardware_type} • {wallet.derivation_path}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último índice usado: {wallet.last_used_index}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={wallet.is_active ? 'success' : 'secondary'}>
                        {wallet.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      {wallet.is_verified && (
                        <Badge variant="outline">Verificada ✓</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={showXPubDialog} onOpenChange={setShowXPubDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <XPubConfigForm
                onSuccess={() => {
                  reloadData();
                  setShowXPubDialog(false);
                }}
                onCancel={() => setShowXPubDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB: BTCPay Server */}
        <TabsContent value="btcpay" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">BTCPay Server (Self-Hosted)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              BTCPay Server é uma solução self-hosted para pagamentos Bitcoin não-custodiais.
              Requer infraestrutura própria (Docker, Bitcoin Node).
            </p>
            <Button variant="outline" disabled>
              Configurar BTCPay (Em desenvolvimento)
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
