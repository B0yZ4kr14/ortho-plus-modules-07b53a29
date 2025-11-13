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
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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

  useEffect(() => {
    calculateConversion();
  }, [fromCurrency, toCurrency, amount, rates]);

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

  const handleRefreshRates = () => {
    // Simular atualização de cotações com pequena variação
    const newRates = {
      BTC: rates.BTC * (1 + (Math.random() - 0.5) * 0.01),
      ETH: rates.ETH * (1 + (Math.random() - 0.5) * 0.01),
      USDT: rates.USDT * (1 + (Math.random() - 0.5) * 0.005),
      BRL: 1,
    };
    
    setRates(newRates);
    setLastUpdate(new Date());
    toast.success('Cotações atualizadas!');
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

        {/* Cotações em tempo real */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Cotações Atuais</h4>
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
        </div>
      </CardContent>
    </Card>
  );
}
