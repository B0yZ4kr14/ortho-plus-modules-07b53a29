import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Wallet, TrendingUp, Bell, Key, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Exchange {
  id: string;
  name: string;
  api_key: string;
  status: string;
}

interface Portfolio {
  total_value_usd: number;
  total_btc: number;
  assets: Array<{
    symbol: string;
    amount: number;
    value_usd: number;
  }>;
}

export default function CryptoConfigPage() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [newExchange, setNewExchange] = useState({ name: '', api_key: '', api_secret: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exchangesData, portfolioData] = await Promise.all([
        apiClient.get<Exchange[]>('/crypto-config/exchanges'),
        apiClient.get<Portfolio>('/crypto-config/portfolio'),
      ]);
      setExchanges(exchangesData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error fetching crypto config:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const addExchange = async () => {
    try {
      await apiClient.post('/crypto-config/exchanges', newExchange);
      toast.success('Exchange adicionada com sucesso');
      setNewExchange({ name: '', api_key: '', api_secret: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding exchange:', error);
      toast.error('Erro ao adicionar exchange');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crypto Config</h1>
        <p className="text-muted-foreground">
          Gerencie exchanges, carteiras e estratégias de criptomoedas
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Total</CardTitle>
                <Bitcoin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {portfolio ? formatCurrency(portfolio.total_value_usd) : '$0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolio?.total_btc.toFixed(8)} BTC
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exchanges</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exchanges.length}</div>
                <p className="text-xs text-muted-foreground">Conectadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {portfolio?.assets.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Diferentes</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="exchanges" className="w-full">
            <TabsList>
              <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="dca">DCA Strategies</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="exchanges" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Exchange</CardTitle>
                  <CardDescription>Configure uma nova exchange de criptomoedas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Nome da Exchange</Label>
                      <Input
                        placeholder="Binance, Coinbase, etc"
                        value={newExchange.name}
                        onChange={(e) => setNewExchange({ ...newExchange, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="Sua API Key"
                        value={newExchange.api_key}
                        onChange={(e) => setNewExchange({ ...newExchange, api_key: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>API Secret</Label>
                      <Input
                        type="password"
                        placeholder="Seu API Secret"
                        value={newExchange.api_secret}
                        onChange={(e) => setNewExchange({ ...newExchange, api_secret: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addExchange}>
                    <Key className="mr-2 h-4 w-4" />
                    Adicionar Exchange
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exchanges Configuradas</CardTitle>
                  <CardDescription>Lista de exchanges conectadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {exchanges.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma exchange configurada
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exchanges.map((exchange) => (
                        <div
                          key={exchange.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Bitcoin className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">{exchange.name}</div>
                              <div className="text-sm text-muted-foreground">
                                API Key: {exchange.api_key.substring(0, 10)}...
                              </div>
                            </div>
                          </div>
                          <Badge variant={exchange.status === 'active' ? 'default' : 'secondary'}>
                            {exchange.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Portfolio</CardTitle>
                  <CardDescription>Visualize seus ativos em criptomoedas</CardDescription>
                </CardHeader>
                <CardContent>
                  {!portfolio || portfolio.assets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum ativo encontrado
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {portfolio.assets.map((asset, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Bitcoin className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">{asset.symbol}</div>
                              <div className="text-sm text-muted-foreground">
                                {asset.amount.toFixed(8)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(asset.value_usd)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dca">
              <Card>
                <CardHeader>
                  <CardTitle>Estratégias DCA</CardTitle>
                  <CardDescription>Configure compras automáticas recorrentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Funcionalidade em desenvolvimento
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Preço</CardTitle>
                  <CardDescription>Configure notificações de variação de preço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Funcionalidade em desenvolvimento
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
