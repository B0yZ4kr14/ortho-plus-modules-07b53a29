import { useState, useEffect } from 'react';
import { Bitcoin, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface CryptoRate {
  symbol: string;
  name: string;
  price_brl: number;
  price_usd: number;
  change_24h: number;
  volume_24h: number;
  last_updated: string;
}

export function CryptoRatesWidget() {
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-crypto-rates');

      if (error) throw error;

      setRates(data.rates.slice(0, 4)); // Top 4 cryptos
      setLastUpdate(new Date());
    } catch (error) {
      logger.error('Error fetching crypto rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              Crypto Rates
            </CardTitle>
            <CardDescription>
              Cotações em tempo real
              {lastUpdate && (
                <span className="ml-2 text-xs">
                  • Atualizado {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRates}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rates.map((rate) => (
            <div
              key={rate.symbol}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-sm">{rate.symbol}</span>
                </div>
                <div>
                  <p className="font-medium">{rate.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(rate.price_brl)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {formatChange(rate.change_24h)}
                <Badge variant="outline" className="mt-1">
                  24h
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {rates.length === 0 && !loading && (
          <div className="text-center py-6 text-muted-foreground">
            <p>Carregando cotações...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
