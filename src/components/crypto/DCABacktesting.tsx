import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calculator, DollarSign } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BacktestResult {
  date: string;
  dcaValue: number;
  lumpSumValue: number;
  dcaInvested: number;
  dcaCoin: number;
  lumpSumCoin: number;
}

export function DCABacktesting() {
  const [coinType, setCoinType] = useState('BTC');
  const [monthlyAmount, setMonthlyAmount] = useState(1000);
  const [period, setPeriod] = useState(12);
  const [results, setResults] = useState<BacktestResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    dcaFinalValue: number;
    lumpSumFinalValue: number;
    dcaTotalInvested: number;
    lumpSumTotalInvested: number;
    dcaReturn: number;
    lumpSumReturn: number;
    dcaTotalCoin: number;
    lumpSumTotalCoin: number;
  } | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    
    try {
      const endDate = new Date();
      const startDate = subMonths(endDate, period);
      
      // Buscar dados históricos reais do CoinGecko
      const coinId = coinType === 'BTC' ? 'bitcoin' : coinType === 'ETH' ? 'ethereum' : 'tether';
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=brl&from=${Math.floor(startDate.getTime() / 1000)}&to=${Math.floor(endDate.getTime() / 1000)}`
      );
      
      if (!response.ok) throw new Error('Erro ao buscar dados históricos');
      
      const data = await response.json();
      const prices = data.prices;
      
      // Calcular preços mensais
      const monthlyPrices: { date: Date; price: number }[] = [];
      for (let i = 0; i < period; i++) {
        const targetDate = subMonths(endDate, period - i);
        const dayTimestamp = targetDate.getTime();
        
        // Encontrar preço mais próximo do dia 1 de cada mês
        let closestPrice = prices[0];
        let minDiff = Math.abs(prices[0][0] - dayTimestamp);
        
        for (const [timestamp, price] of prices) {
          const diff = Math.abs(timestamp - dayTimestamp);
          if (diff < minDiff) {
            minDiff = diff;
            closestPrice = [timestamp, price];
          }
        }
        
        monthlyPrices.push({
          date: new Date(closestPrice[0]),
          price: closestPrice[1],
        });
      }
      
      const firstPrice = monthlyPrices[0].price;
      const lastPrice = monthlyPrices[monthlyPrices.length - 1].price;
      
      // Simular DCA
      let dcaTotalInvested = 0;
      let dcaTotalCoin = 0;
      
      // Simular Lump Sum
      const lumpSumTotalInvested = monthlyAmount * period;
      const lumpSumTotalCoin = lumpSumTotalInvested / firstPrice;
      
      const backtestResults: BacktestResult[] = monthlyPrices.map((item, index) => {
        // DCA: compra mensal
        dcaTotalInvested += monthlyAmount;
        const coinsBought = monthlyAmount / item.price;
        dcaTotalCoin += coinsBought;
        
        const dcaCurrentValue = dcaTotalCoin * lastPrice;
        const lumpSumCurrentValue = lumpSumTotalCoin * lastPrice;
        
        return {
          date: format(item.date, 'MMM/yy', { locale: ptBR }),
          dcaValue: dcaCurrentValue,
          lumpSumValue: lumpSumCurrentValue,
          dcaInvested: dcaTotalInvested,
          dcaCoin: dcaTotalCoin,
          lumpSumCoin: lumpSumTotalCoin,
        };
      });
      
      setResults(backtestResults);
      
      const finalResult = backtestResults[backtestResults.length - 1];
      const dcaFinalValue = finalResult.dcaValue;
      const lumpSumFinalValue = finalResult.lumpSumValue;
      
      setSummary({
        dcaFinalValue,
        lumpSumFinalValue,
        dcaTotalInvested,
        lumpSumTotalInvested,
        dcaReturn: ((dcaFinalValue - dcaTotalInvested) / dcaTotalInvested) * 100,
        lumpSumReturn: ((lumpSumFinalValue - lumpSumTotalInvested) / lumpSumTotalInvested) * 100,
        dcaTotalCoin: finalResult.dcaCoin,
        lumpSumTotalCoin: finalResult.lumpSumCoin,
      });
    } catch (error) {
      console.error('Erro no backtesting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Backtesting DCA vs Investimento Único
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Criptomoeda</Label>
              <Select value={coinType} onValueChange={setCoinType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor Mensal (R$)</Label>
              <Input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                min={100}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Período (meses)</Label>
              <Select value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                  <SelectItem value="36">36 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={runBacktest} disabled={loading} className="w-full">
                {loading ? 'Calculando...' : 'Simular'}
              </Button>
            </div>
          </div>

          {summary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Card depth="subtle" className="border-l-4 border-l-primary">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">DCA (Dollar-Cost Averaging)</h3>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Investido:</span>
                        <span className="font-semibold">
                          {summary.dcaTotalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Final:</span>
                        <span className="font-semibold text-primary">
                          {summary.dcaFinalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retorno:</span>
                        <span className={`font-semibold ${summary.dcaReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {summary.dcaReturn >= 0 ? '+' : ''}{summary.dcaReturn.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total {coinType}:</span>
                        <span className="font-semibold">
                          {summary.dcaTotalCoin.toFixed(8)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card depth="subtle" className="border-l-4 border-l-secondary">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Investimento Único (Lump Sum)</h3>
                      <DollarSign className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Investido:</span>
                        <span className="font-semibold">
                          {summary.lumpSumTotalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Final:</span>
                        <span className="font-semibold text-secondary">
                          {summary.lumpSumFinalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retorno:</span>
                        <span className={`font-semibold ${summary.lumpSumReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {summary.lumpSumReturn >= 0 ? '+' : ''}{summary.lumpSumReturn.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total {coinType}:</span>
                        <span className="font-semibold">
                          {summary.lumpSumTotalCoin.toFixed(8)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {results && (
                <div>
                  <h3 className="font-semibold mb-4">Evolução do Patrimônio</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis
                        className="text-xs"
                        tickFormatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })}
                      />
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="dcaValue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="DCA"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="lumpSumValue"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        name="Lump Sum"
                        dot={{ fill: 'hsl(var(--secondary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Análise Comparativa</h4>
                <p className="text-sm text-muted-foreground">
                  {summary.dcaReturn > summary.lumpSumReturn ? (
                    <>
                      <span className="font-semibold text-success">DCA foi {(summary.dcaReturn - summary.lumpSumReturn).toFixed(2)}% melhor</span> que investimento único neste período. 
                      O DCA reduz risco ao distribuir compras ao longo do tempo, evitando timing de mercado.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-secondary">Investimento único foi {(summary.lumpSumReturn - summary.dcaReturn).toFixed(2)}% melhor</span> que DCA neste período. 
                      Em mercados em alta constante, lump sum tende a superar DCA por entrar com capital total no início.
                    </>
                  )}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
