// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCryptoSupabase } from '@/modules/crypto/hooks/useCryptoSupabase';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bitcoin, 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  RefreshCw,
  Settings,
  Plus,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  exchangeLabels, 
  coinLabels, 
  statusLabels,
  tipoLabels 
} from '@/modules/crypto/types/crypto.types';
import { Skeleton } from '@/components/ui/skeleton';
import { ExchangeConfigForm } from '@/components/crypto/ExchangeConfigForm';
import { WalletForm } from '@/components/crypto/WalletForm';
import { BitcoinQRCodeDialog } from '@/components/crypto/BitcoinQRCodeDialog';
import { BitcoinInfo } from './BitcoinInfo';
import { CryptoAnalysisDashboard } from '@/modules/crypto/components/CryptoAnalysisDashboard';
import { Info } from 'lucide-react';

export default function CryptoPagamentos() {
  const { user } = useAuth();
  const clinicId = user?.user_metadata?.clinic_id;
  
  const { 
    exchanges, 
    wallets, 
    transactions, 
    loading,
    syncWalletBalance,
    convertCryptoToBRL,
    getDashboardData,
    createExchangeConfig,
    createWallet,
    createPaymentRequest,
  } = useCryptoSupabase(clinicId);

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [syncingWallet, setSyncingWallet] = useState<string | null>(null);
  const [convertingTx, setConvertingTx] = useState<string | null>(null);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);

  const dashboardData = getDashboardData();

  const handleSyncWallet = async (walletId: string) => {
    setSyncingWallet(walletId);
    try {
      await syncWalletBalance(walletId);
    } finally {
      setSyncingWallet(null);
    }
  };

  const handleConvert = async (transactionId: string) => {
    setConvertingTx(transactionId);
    try {
      await convertCryptoToBRL(transactionId);
    } finally {
      setConvertingTx(null);
    }
  };

  const handleExchangeSubmit = async (data: any) => {
    await createExchangeConfig(data);
    setExchangeDialogOpen(false);
  };

  const handleWalletSubmit = async (data: any) => {
    await createWallet(data);
    setWalletDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          icon={Bitcoin}
          title="Pagamentos em Criptomoedas"
          description="Receba pagamentos em Bitcoin e outras criptomoedas"
        />
        <LoadingState size="lg" message="Carregando dados de criptomoedas..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon={Bitcoin}
        title="Pagamentos em Criptomoedas"
        description="Receba pagamentos em Bitcoin e outras criptomoedas de forma profissional e segura"
      />

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="metric" depth="normal" className="p-6 border-l-orange-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Total em BTC
              </p>
              <p className="text-2xl font-bold truncate">{dashboardData.totalBTC.toFixed(8)} BTC</p>
            </div>
            <Bitcoin className="h-10 w-10 text-orange-500 opacity-20 shrink-0" />
          </div>
        </Card>

        <Card variant="metric" depth="normal" className="p-6 border-l-green-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Total em BRL
              </p>
              <p className="text-2xl font-bold text-green-500 truncate">
                R$ {dashboardData.totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500 opacity-20 shrink-0" />
          </div>
        </Card>

        <Card variant="metric" depth="normal" className="p-6 border-l-yellow-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Transações Pendentes
              </p>
              <p className="text-2xl font-bold text-yellow-500 truncate">{dashboardData.pendingTransactions}</p>
            </div>
            <ArrowRightLeft className="h-10 w-10 text-yellow-500 opacity-20 shrink-0" />
          </div>
        </Card>

        <Card variant="metric" depth="normal" className="p-6 border-l-blue-500">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Confirmadas Hoje
              </p>
              <p className="text-2xl font-bold truncate">{dashboardData.confirmedToday}</p>
            </div>
            <Wallet className="h-10 w-10 text-blue-500 opacity-20 shrink-0" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="mt-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="wallets">
            <Wallet className="h-4 w-4 mr-2" />
            Carteiras
          </TabsTrigger>
          <TabsTrigger value="exchanges">
            <Settings className="h-4 w-4 mr-2" />
            Exchanges
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <TrendingUp className="h-4 w-4 mr-2" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="info">
            <Info className="h-4 w-4 mr-2" />
            Sobre Bitcoin
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico de Transações</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQrCodeDialogOpen(true)}
              disabled={wallets.filter(w => w.is_active).length === 0}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Gerar QR Code de Pagamento
            </Button>
          </div>

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma transação encontrada.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <Card key={tx.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{coinLabels[tx.coin_type]}</Badge>
                          <Badge 
                            variant={
                              tx.status === 'CONFIRMADO' ? 'default' :
                              tx.status === 'PENDENTE' ? 'secondary' :
                              tx.status === 'CONVERTIDO' ? 'default' : 'destructive'
                            }
                          >
                            {statusLabels[tx.status]}
                          </Badge>
                          <Badge variant="outline">{tipoLabels[tx.tipo]}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Valor Crypto:</span>
                            <p className="font-semibold">{tx.amount_crypto} {tx.coin_type}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor BRL:</span>
                            <p className="font-semibold">
                              R$ {tx.amount_brl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Taxa de Câmbio:</span>
                            <p className="font-semibold">
                              R$ {tx.exchange_rate?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confirmações:</span>
                            <p className="font-semibold">
                              {tx.confirmations}/{tx.required_confirmations}
                            </p>
                          </div>
                        </div>

                        {(tx.processing_fee_brl && tx.processing_fee_brl > 0) && (
                          <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                            <div>
                              <span className="text-muted-foreground">Taxa de Processamento:</span>
                              <p className="font-semibold text-amber-600 dark:text-amber-400">
                                - R$ {tx.processing_fee_brl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                {tx.processing_fee_percentage && ` (${tx.processing_fee_percentage}%)`}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Valor Líquido:</span>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                R$ {tx.net_amount_brl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        )}

                        {tx.patient_name && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Paciente: </span>
                            <span className="font-medium">{tx.patient_name}</span>
                          </div>
                        )}

                        {tx.transaction_hash && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Hash:</span>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {tx.transaction_hash.substring(0, 20)}...
                            </code>
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={`https://blockchain.com/btc/tx/${tx.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {tx.status === 'CONFIRMADO' && !tx.converted_to_brl_at && (
                          <Button
                            size="sm"
                            onClick={() => handleConvert(tx.id)}
                            disabled={convertingTx === tx.id}
                          >
                            {convertingTx === tx.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Convertendo...
                              </>
                            ) : (
                              <>
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Converter
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Carteiras Configuradas</h3>
            <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Carteira
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Carteira</DialogTitle>
                </DialogHeader>
                <WalletForm
                  onSubmit={handleWalletSubmit}
                  onCancel={() => setWalletDialogOpen(false)}
                  exchanges={exchanges}
                />
              </DialogContent>
            </Dialog>
          </div>

          {wallets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma carteira configurada. Configure uma exchange primeiro.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{wallet.wallet_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {coinLabels[wallet.coin_type]}
                        </p>
                      </div>
                      <Badge variant={wallet.is_active ? 'default' : 'secondary'}>
                        {wallet.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Endereço:</span>
                      <code className="block text-xs bg-muted p-2 rounded mt-1 break-all">
                        {wallet.wallet_address}
                      </code>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Saldo Crypto:</span>
                        <p className="font-semibold">{wallet.balance} {wallet.coin_type}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Saldo BRL:</span>
                        <p className="font-semibold">
                          R$ {wallet.balance_brl?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {wallet.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        Última sincronização: {format(new Date(wallet.last_sync_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSyncWallet(wallet.id)}
                      disabled={syncingWallet === wallet.id}
                    >
                      {syncingWallet === wallet.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar Saldo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <BitcoinInfo />
        </TabsContent>

        {/* Exchanges Tab */}
        <TabsContent value="exchanges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Exchanges Configuradas</h3>
            <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Exchange
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configurar Exchange</DialogTitle>
                </DialogHeader>
                <ExchangeConfigForm
                  onSubmit={handleExchangeSubmit}
                  onCancel={() => setExchangeDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {exchanges.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bitcoin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma Exchange Configurada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure uma exchange para começar a receber pagamentos em criptomoedas
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Primeira Exchange
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exchanges.map((exchange) => (
                <Card key={exchange.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {exchangeLabels[exchange.exchange_name]}
                      </CardTitle>
                      <Badge variant={exchange.is_active ? 'default' : 'secondary'}>
                        {exchange.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Moedas Suportadas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exchange.supported_coins?.map((coin) => (
                          <Badge key={coin} variant="outline" className="text-xs">
                            {coin}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {exchange.wallet_address && (
                      <div>
                        <span className="text-sm text-muted-foreground">Carteira Principal:</span>
                        <code className="block text-xs bg-muted p-2 rounded mt-1 break-all">
                          {exchange.wallet_address}
                        </code>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Conversão Automática:</span>
                      <Badge variant={exchange.auto_convert_to_brl ? 'default' : 'outline'}>
                        {exchange.auto_convert_to_brl ? 'Ativada' : 'Desativada'}
                      </Badge>
                    </div>

                    {exchange.processing_fee_percentage && exchange.processing_fee_percentage > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Taxa de Processamento: </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {exchange.processing_fee_percentage}%
                        </span>
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <CryptoAnalysisDashboard clinicId={clinicId} />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <BitcoinInfo />
        </TabsContent>
      </Tabs>

      <BitcoinQRCodeDialog
        open={qrCodeDialogOpen}
        onOpenChange={setQrCodeDialogOpen}
        wallets={wallets}
        onGeneratePayment={createPaymentRequest}
      />
    </div>
  );
}
