import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface MarketRate {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

export function MarketRatesWidget() {
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketRates();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchMarketRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketRates = async () => {
    try {
      // Buscar Bitcoin (BRL)
      const btcResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCBRL');
      const btcData = await btcResponse.json();

      // Buscar USD (BRL) usando API pública
      const usdResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const usdData = await usdResponse.json();
      const usdRate = usdData.rates.BRL;

      setRates([
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          price: parseFloat(btcData.lastPrice),
          change24h: parseFloat(btcData.priceChangePercent),
        },
        {
          name: 'Dólar Americano',
          symbol: 'USD',
          price: usdRate,
          change24h: 0, // Exchange rate API não fornece variação
        },
      ]);
    } catch (error) {
      console.error('Error fetching market rates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cotações do Mercado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Cotações Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rates.map((rate) => (
          <div key={rate.symbol} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {rate.symbol === 'BTC' ? (
                <Bitcoin className="h-5 w-5 text-orange-500" />
              ) : (
                <DollarSign className="h-5 w-5 text-green-500" />
              )}
              <div>
                <div className="font-semibold text-sm">{rate.name}</div>
                <div className="text-xs text-muted-foreground">{rate.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">
                R$ {rate.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {rate.change24h !== 0 && (
                <Badge 
                  variant={rate.change24h >= 0 ? 'success' : 'destructive'}
                  className="text-xs flex items-center gap-1 mt-1"
                >
                  {rate.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(rate.change24h).toFixed(2)}%
                </Badge>
              )}
            </div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Atualizado em tempo real
        </div>
      </CardContent>
    </Card>
  );
}
