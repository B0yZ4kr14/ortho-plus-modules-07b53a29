import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CryptoCalculator() {
  const [fromCurrency, setFromCurrency] = useState<'BTC' | 'ETH' | 'USDT' | 'BRL'>('BTC');
  const [toCurrency, setToCurrency] = useState<'BTC' | 'ETH' | 'USDT' | 'BRL'>('BRL');
  const [amount, setAmount] = useState<string>('1');
  const [result, setResult] = useState<string>('0');
  const [rates, setRates] = useState<Record<string, number>>({
    BTC: 350000,
    ETH: 18000,
    USDT: 5.5,
    BRL: 1,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [history24h, setHistory24h] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    calculateConversion();
  }, [fromCurrency, toCurrency, amount, rates]);

  useEffect(() => {
    fetchHistory24h();
    // Atualizar cotações a cada 60 segundos
    const interval = setInterval(() => {
      handleRefreshRates();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const calculateConversion = () => {
    const amountNum = parseFloat(amount) || 0;
    
    if (fromCurrency === toCurrency) {
      setResult(amount);
      return;
    }

    // Converter para BRL primeiro
    const amountInBRL = amountNum * rates[fromCurrency];
    
    // Depois converter de BRL para moeda de destino
    const finalAmount = amountInBRL / rates[toCurrency];
    
    setResult(finalAmount.toFixed(fromCurrency === 'BRL' || toCurrency === 'BRL' ? 2 : 8));
  };

  const fetchHistory24h = async () => {
    setLoadingHistory(true);
    try {
      // Gerar dados históricos das últimas 24h (dados sintéticos por enquanto)
      const historyData = [];
      const now = new Date();
      
      for (let i = 24; i >= 0; i--) {
        const timestamp = subHours(now, i);
        const variation = (Math.random() - 0.5) * 0.02; // ±2% de variação
        
        historyData.push({
          timestamp,
          BTC: 350000 * (1 + variation),
          ETH: 18000 * (1 + variation),
          USDT: 5.5 * (1 + variation * 0.1),
        });
      }
      
      setHistory24h(historyData);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefreshRates = async () => {
    try {
      // Buscar cotações reais da CoinGecko
      const coins = ['bitcoin', 'ethereum', 'tether'];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=brl`
      );
      
      if (response.ok) {
        const data = await response.json();
        const newRates = {
          BTC: data.bitcoin?.brl || rates.BTC,
          ETH: data.ethereum?.brl || rates.ETH,
          USDT: data.tether?.brl || rates.USDT,
          BRL: 1,
        };
        
        setRates(newRates);
        setLastUpdate(new Date());
        await fetchHistory24h(); // Atualizar histórico também
        toast.success('Cotações atualizadas com sucesso!');
      } else {
        throw new Error('Erro ao buscar cotações');
      }
    } catch (error) {
      console.error('Erro ao atualizar cotações:', error);
      toast.error('Erro ao atualizar cotações. Usando valores em cache.');
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(result);
  };

  const getCurrencyLabel = (currency: string) => {
    const labels: Record<string, string> = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      USDT: 'Tether',
      BRL: 'Real Brasileiro',
    };
    return labels[currency] || currency;
  };

  return (
    <Card depth="normal" className="border-l-4 border-l-primary" data-tour="calculator">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Calculadora de Conversão Cripto ↔ BRL
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshRates}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* De */}
          <div className="md:col-span-2 space-y-2">
            <Label>De</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={fromCurrency} onValueChange={(value: any) => setFromCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.00000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-right"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{getCurrencyLabel(fromCurrency)}</span>
              {fromCurrency !== 'BRL' && (
                <Badge variant="outline" className="text-xs">
                  1 {fromCurrency} = R$ {rates[fromCurrency].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCurrencies}
              className="rounded-full hover:rotate-180 transition-transform duration-300"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Para */}
          <div className="md:col-span-2 space-y-2">
            <Label>Para</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={toCurrency} onValueChange={(value: any) => setToCurrency(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                value={result}
                readOnly
                className="text-right font-bold bg-muted"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{getCurrencyLabel(toCurrency)}</span>
              {toCurrency !== 'BRL' && (
                <Badge variant="outline" className="text-xs">
                  1 {toCurrency} = R$ {rates[toCurrency].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Tendência 24h */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Tendência das Últimas 24h</h4>
            {!loadingHistory && history24h.length > 0 && (
              <Badge variant="outline" className="gap-1">
                {history24h[history24h.length - 1][fromCurrency !== 'BRL' ? fromCurrency : 'BTC'] > 
                 history24h[0][fromCurrency !== 'BRL' ? fromCurrency : 'BTC'] ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-success">Alta</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">Baixa</span>
                  </>
                )}
              </Badge>
            )}
          </div>
          
          {loadingHistory ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Carregando histórico...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history24h}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), 'HH:mm', { locale: ptBR })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(new Date(payload[0].payload.timestamp), "HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-sm font-semibold">
                          R$ {(payload[0].value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={fromCurrency !== 'BRL' ? fromCurrency : 'BTC'}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cotações em tempo real */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Cotações em Tempo Real</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-muted-foreground mb-1">Bitcoin</p>
              <p className="text-lg font-bold text-orange-500">
                R$ {rates.BTC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-1">Ethereum</p>
              <p className="text-lg font-bold text-blue-500">
                R$ {rates.ETH.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-1">Tether</p>
              <p className="text-lg font-bold text-green-500">
                R$ {rates.USDT.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Cotações via CoinGecko API • Atualização automática a cada 60s
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
