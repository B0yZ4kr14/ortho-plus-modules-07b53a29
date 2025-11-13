import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import TechnicalIndicators from "./TechnicalIndicators";

interface ExchangeRate {
  id: number;
  coin_type: string;
  rate_brl: number;
  rate_usd: number;
  source: string;
  timestamp: string;
}

interface Transaction {
  id: number;
  amount_crypto: number;
  amount_brl: number;
  exchange_rate_at_transaction: number;
  status: string;
  confirmed_at: string;
  coin_type: string;
}

interface CryptoAnalysisDashboardProps {
  clinicId: string;
}

export function CryptoAnalysisDashboard({ clinicId }: CryptoAnalysisDashboardProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, [clinicId]);

  const fetchAnalysisData = async () => {
    try {
      // Buscar histórico de taxas de câmbio (últimos 30 dias)
      const { data: rates } = await supabase
        .from('crypto_exchange_rates' as any)
        .select('*')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true });

      // Buscar transações confirmadas
      const { data: txs } = await supabase
        .from('crypto_transactions' as any)
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'confirmed')
        .order('confirmed_at', { ascending: false })
        .limit(50);

      if (rates) setExchangeRates(rates as unknown as ExchangeRate[]);
      if (txs) setTransactions(txs as unknown as Transaction[]);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const currentRate = exchangeRates[exchangeRates.length - 1]?.rate_brl || 0;
  const previousRate = exchangeRates[exchangeRates.length - 7]?.rate_brl || currentRate;
  const rateChange = ((currentRate - previousRate) / previousRate) * 100;

  const totalTransactions = transactions.length;
  const totalVolumeBRL = transactions.reduce((sum, tx) => sum + tx.amount_brl, 0);
  const totalVolumeCrypto = transactions.reduce((sum, tx) => sum + tx.amount_crypto, 0);

  // Calcular economia comparado a taxas tradicionais (PIX/Cartão cobram ~2-5%)
  const traditionalFees = totalVolumeBRL * 0.035; // 3.5% média
  const cryptoFees = totalVolumeBRL * 0.005; // 0.5% taxa cripto
  const savings = traditionalFees - cryptoFees;
  const savingsPercent = ((savings / traditionalFees) * 100).toFixed(1);

  // Preparar dados para gráficos
  const rateHistoryData = exchangeRates.map(rate => ({
    date: new Date(rate.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    BTC: rate.coin_type === 'BTC' ? rate.rate_brl : null,
    ETH: rate.coin_type === 'ETH' ? rate.rate_brl : null,
    USDT: rate.coin_type === 'USDT' ? rate.rate_brl : null,
  }));

  const volumeByDay = transactions.reduce((acc, tx) => {
    const date = new Date(tx.confirmed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (!acc[date]) {
      acc[date] = { date, volume: 0, count: 0 };
    }
    acc[date].volume += tx.amount_brl;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; volume: number; count: number }>);

  const volumeData = Object.values(volumeByDay).reverse();

  // Identificar melhor momento para converter (quando taxa está mais baixa)
  const lowestRate = Math.min(...exchangeRates.map(r => r.rate_brl));
  const highestRate = Math.max(...exchangeRates.map(r => r.rate_brl));
  const optimalConversionRate = lowestRate + (highestRate - lowestRate) * 0.25; // 25% acima do mínimo

  if (loading) {
    return (
      <Card depth="normal">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando análise...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs de Economia */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {savingsPercent}% menos que métodos tradicionais
            </p>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Atual BTC</CardTitle>
            {rateChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs mt-1 ${rateChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {rateChange >= 0 ? '+' : ''}{rateChange.toFixed(2)}% (7 dias)
            </p>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalVolumeBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalTransactions} transações confirmadas
            </p>
          </CardContent>
        </Card>

        <Card depth="normal">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Conversão</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {currentRate <= optimalConversionRate ? (
              <>
                <Badge variant="success" className="mb-2">Momento Ideal</Badge>
                <p className="text-xs text-muted-foreground">
                  Taxa favorável para converter
                </p>
              </>
            ) : (
              <>
                <Badge variant="warning" className="mb-2">Aguardar</Badge>
                <p className="text-xs text-muted-foreground">
                  Melhor aguardar queda na taxa
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análise */}
      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rates">Histórico de Taxas</TabsTrigger>
          <TabsTrigger value="volume">Volume de Transações</TabsTrigger>
          <TabsTrigger value="savings">Economia Acumulada</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card depth="normal">
              <CardHeader>
                <CardTitle>Histórico de Taxas de Câmbio (30 dias)</CardTitle>
                <CardDescription>
                  Acompanhe a variação das taxas de câmbio para identificar melhores momentos de conversão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={rateHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="BTC" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="ETH" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="USDT" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <TechnicalIndicators rates={exchangeRates} />
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card depth="normal">
            <CardHeader>
              <CardTitle>Volume de Transações por Dia</CardTitle>
              <CardDescription>
                Visualize o volume de pagamentos em criptomoedas ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" name="Volume (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card depth="normal">
            <CardHeader>
              <CardTitle>Economia vs Métodos Tradicionais</CardTitle>
              <CardDescription>
                Compare as taxas de pagamento em criptomoedas com métodos tradicionais (PIX, Cartão)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Métodos Tradicionais</span>
                      <Badge variant="outline">~3.5% taxa média</Badge>
                    </div>
                    <div className="text-3xl font-bold text-destructive">
                      R$ {traditionalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Taxa total em PIX/Cartão
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Criptomoedas</span>
                      <Badge variant="success">~0.5% taxa</Badge>
                    </div>
                    <div className="text-3xl font-bold text-success">
                      R$ {cryptoFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Taxa total em Crypto
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">Economia de {savingsPercent}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Você economizou <span className="font-bold text-success">R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> usando
                    pagamentos em criptomoedas ao invés de métodos tradicionais.
                  </p>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={[
                      { método: 'Tradicional', taxa: 3.5, custo: traditionalFees },
                      { método: 'Cripto', taxa: 0.5, custo: cryptoFees },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="método" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="custo"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      name="Custo Total (R$)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
