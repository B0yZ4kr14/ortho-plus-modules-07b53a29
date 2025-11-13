import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface TechnicalIndicatorsProps {
  rates: Array<{ timestamp: string; rate_brl: number }>;
}

// Função para calcular RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period) return 50; // Valor neutro se não houver dados suficientes

  let gains = 0;
  let losses = 0;

  // Calcular ganhos e perdas
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

// Função para calcular Bollinger Bands
function calculateBollingerBands(prices: number[], period: number = 20): {
  upper: number;
  middle: number;
  lower: number;
} {
  if (prices.length < period) {
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { upper: avg, middle: avg, lower: avg };
  }

  const recentPrices = prices.slice(-period);
  const middle = recentPrices.reduce((a, b) => a + b, 0) / period;

  // Calcular desvio padrão
  const squaredDiffs = recentPrices.map(price => Math.pow(price - middle, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: middle + (2 * stdDev),
    middle,
    lower: middle - (2 * stdDev),
  };
}

// Função para calcular MACD (Moving Average Convergence Divergence)
function calculateMACD(prices: number[]): {
  macd: number;
  signal: number;
  histogram: number;
} {
  if (prices.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  // Calcular EMA (Exponential Moving Average)
  const calculateEMA = (data: number[], period: number): number => {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  };

  const ema12 = calculateEMA(prices.slice(-12), 12);
  const ema26 = calculateEMA(prices.slice(-26), 26);
  const macd = ema12 - ema26;

  // Signal line (EMA de 9 períodos do MACD)
  const signal = macd * 0.5; // Simplificado

  const histogram = macd - signal;

  return { macd, signal, histogram };
}

export function TechnicalIndicators({ rates }: TechnicalIndicatorsProps) {
  if (rates.length < 14) {
    return (
      <Card depth="normal">
        <CardHeader>
          <CardTitle>Indicadores Técnicos</CardTitle>
          <CardDescription>Dados insuficientes para análise técnica</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            São necessários pelo menos 14 dias de histórico para calcular os indicadores técnicos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const prices = rates.map(r => r.rate_brl);
  const currentPrice = prices[prices.length - 1];

  const rsi = calculateRSI(prices);
  const bollinger = calculateBollingerBands(prices);
  const macd = calculateMACD(prices);

  // Interpretações
  const rsiSignal = rsi > 70 ? 'SOBRECOMPRADO' : rsi < 30 ? 'SOBREVENDIDO' : 'NEUTRO';
  const rsiVariant = rsi > 70 ? 'destructive' : rsi < 30 ? 'success' : 'secondary';

  const bollingerSignal = currentPrice > bollinger.upper ? 'ACIMA DA BANDA SUPERIOR' :
                          currentPrice < bollinger.lower ? 'ABAIXO DA BANDA INFERIOR' : 
                          'DENTRO DAS BANDAS';
  const bollingerVariant = currentPrice > bollinger.upper ? 'destructive' :
                           currentPrice < bollinger.lower ? 'success' : 
                           'secondary';

  const macdSignal = macd.histogram > 0 ? 'SINAL DE COMPRA' : macd.histogram < 0 ? 'SINAL DE VENDA' : 'NEUTRO';
  const macdVariant = macd.histogram > 0 ? 'success' : macd.histogram < 0 ? 'destructive' : 'secondary';

  return (
    <Card depth="normal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Indicadores Técnicos
        </CardTitle>
        <CardDescription>
          Análise técnica automática baseada em dados históricos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">RSI (14)</h4>
              <p className="text-xs text-muted-foreground">Índice de Força Relativa</p>
            </div>
            <Badge variant={rsiVariant}>{rsiSignal}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  rsi > 70 ? 'bg-destructive' : 
                  rsi < 30 ? 'bg-success' : 
                  'bg-primary'
                }`}
                style={{ width: `${rsi}%` }}
              />
            </div>
            <span className="text-sm font-bold w-12 text-right">{rsi.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {rsi > 70 ? '⚠️ Ativo pode estar sobrecomprado (pode cair)' :
             rsi < 30 ? '✅ Ativo pode estar sobrevendido (oportunidade de compra)' :
             'Sem sinal forte de compra ou venda'}
          </p>
        </div>

        {/* Bollinger Bands */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Bandas de Bollinger</h4>
              <p className="text-xs text-muted-foreground">Volatilidade e Suporte/Resistência</p>
            </div>
            <Badge variant={bollingerVariant}>{bollingerSignal}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">Superior</div>
              <div className="font-semibold">R$ {bollinger.upper.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Média</div>
              <div className="font-semibold">R$ {bollinger.middle.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Inferior</div>
              <div className="font-semibold">R$ {bollinger.lower.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {currentPrice > bollinger.upper ? '⚠️ Preço acima da banda superior (pode cair)' :
             currentPrice < bollinger.lower ? '✅ Preço abaixo da banda inferior (oportunidade)' :
             'Preço dentro das bandas normais'}
          </p>
        </div>

        {/* MACD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">MACD</h4>
              <p className="text-xs text-muted-foreground">Convergência e Divergência de Médias</p>
            </div>
            <Badge variant={macdVariant}>{macdSignal}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">MACD</div>
              <div className="font-semibold">{macd.macd.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Signal</div>
              <div className="font-semibold">{macd.signal.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Histograma</div>
              <div className={`font-semibold ${macd.histogram >= 0 ? 'text-success' : 'text-destructive'}`}>
                {macd.histogram >= 0 ? (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {macd.histogram.toFixed(2)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    {Math.abs(macd.histogram).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {macd.histogram > 0 ? '✅ Momentum positivo (sinal de compra)' :
             macd.histogram < 0 ? '⚠️ Momentum negativo (sinal de venda)' :
             'Sem momentum claro'}
          </p>
        </div>

        {/* Recomendação Geral */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm mb-2">Recomendação Geral</h4>
          <div className="space-y-1 text-xs">
            {rsi < 30 && macd.histogram > 0 && (
              <p className="text-success font-medium">
                ✅ Forte sinal de compra: RSI sobrevendido + MACD positivo
              </p>
            )}
            {rsi > 70 && macd.histogram < 0 && (
              <p className="text-destructive font-medium">
                ⚠️ Sinal de venda: RSI sobrecomprado + MACD negativo
              </p>
            )}
            {currentPrice < bollinger.lower && rsi < 40 && (
              <p className="text-success font-medium">
                ✅ Oportunidade de compra: Preço abaixo da banda inferior
              </p>
            )}
            {currentPrice > bollinger.upper && rsi > 60 && (
              <p className="text-destructive font-medium">
                ⚠️ Considere realizar lucros: Preço acima da banda superior
              </p>
            )}
            {rsi >= 40 && rsi <= 60 && Math.abs(macd.histogram) < 1000 && (
              <p className="text-muted-foreground">
                → Sem sinal forte: Aguarde melhor ponto de entrada
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            * Indicadores técnicos são ferramentas de análise e não garantem resultados futuros.
            Sempre considere múltiplos fatores antes de tomar decisões de investimento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TechnicalIndicators;
