import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  FileText,
} from 'lucide-react';
import { generateCryptoPerformanceReport } from './CryptoPerformanceReport';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PortfolioData {
  totalBRL: number;
  totalCrypto: { [key: string]: number };
  distribution: { coin: string; value: number; percentage: number; color: string }[];
  gains: number;
  losses: number;
  conversionsHistory: {
    id: string;
    date: Date;
    fromCoin: string;
    toCoin: string;
    amount: number;
    rate: number;
    valueBRL: number;
    type: 'gain' | 'loss';
  }[];
}

interface CryptoPortfolioDashboardProps {
  wallets: any[];
  transactions: any[];
}

const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  BNB: '#F3BA2F',
  USDC: '#2775CA',
};

export function CryptoPortfolioDashboard({ wallets, transactions }: CryptoPortfolioDashboardProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    calculatePortfolio();
  }, [wallets, transactions]);

  const calculatePortfolio = async () => {
    setLoading(true);
    
    try {
      // Buscar cotações reais
      const realRates = await fetchRealRates();
      setRates(realRates);

      // Calcular total por moeda
      const totalCrypto: Record<string, number> = {};
      wallets.forEach(wallet => {
        if (wallet.is_active) {
          totalCrypto[wallet.coin_type] = (totalCrypto[wallet.coin_type] || 0) + wallet.balance;
        }
      });

      // Calcular valor total em BRL
      let totalBRL = 0;
      const distribution = Object.entries(totalCrypto).map(([coin, amount]) => {
        const rate = realRates[coin] || 0;
        const valueBRL = amount * rate;
        totalBRL += valueBRL;
        
        return {
          coin,
          value: valueBRL,
          percentage: 0, // Será calculado depois
          color: COIN_COLORS[coin] || '#666',
        };
      });

      // Calcular percentuais
      distribution.forEach(item => {
        item.percentage = totalBRL > 0 ? (item.value / totalBRL) * 100 : 0;
      });

      // Calcular ganhos e perdas
      let gains = 0;
      let losses = 0;
      const conversionsHistory = transactions
        .filter(tx => tx.status === 'CONVERTIDO')
        .map(tx => {
          const isGain = tx.net_amount_brl > tx.amount_brl;
          const diff = tx.net_amount_brl - tx.amount_brl;
          
          if (isGain) gains += diff;
          else losses += Math.abs(diff);

          return {
            id: tx.id,
            date: new Date(tx.created_at),
            fromCoin: tx.coin_type,
            toCoin: 'BRL',
            amount: tx.amount_crypto,
            rate: tx.exchange_rate,
            valueBRL: tx.net_amount_brl,
            type: isGain ? 'gain' : 'loss' as 'gain' | 'loss',
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);

      setPortfolioData({
        totalBRL,
        totalCrypto,
        distribution,
        gains,
        losses,
        conversionsHistory,
      });
    } catch (error) {
      logger.error('Erro ao calcular portfolio', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealRates = async (): Promise<Record<string, number>> => {
    try {
      // Usar CoinGecko API para cotações reais
      const coins = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'usd-coin'];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=brl`
      );
      
      if (!response.ok) throw new Error('Erro ao buscar cotações');
      
      const data = await response.json();
      
      return {
        BTC: data.bitcoin?.brl || 350000,
        ETH: data.ethereum?.brl || 18000,
        USDT: data.tether?.brl || 5.5,
        BNB: data.binancecoin?.brl || 1500,
        USDC: data['usd-coin']?.brl || 5.5,
      };
    } catch (error) {
      logger.error('Erro ao buscar cotações', error);
      // Fallback para valores simulados
      return {
        BTC: 350000,
        ETH: 18000,
        USDT: 5.5,
        BNB: 1500,
        USDC: 5.5,
      };
    }
  };

  const exportPortfolio = () => {
    if (!portfolioData) return;

    const csvContent = [
      ['Portfólio de Criptomoedas'],
      ['Data:', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['Resumo'],
      ['Valor Total (BRL):', portfolioData.totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Ganhos:', portfolioData.gains.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Perdas:', portfolioData.losses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      [''],
      ['Distribuição por Moeda'],
      ['Moeda', 'Valor (BRL)', 'Percentual'],
      ...portfolioData.distribution.map(item => [
        item.coin,
        item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        `${item.percentage.toFixed(2)}%`,
      ]),
      [''],
      ['Histórico de Conversões'],
      ['Data', 'De', 'Para', 'Quantidade', 'Taxa', 'Valor BRL', 'Tipo'],
      ...portfolioData.conversionsHistory.map(conv => [
        format(conv.date, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        conv.fromCoin,
        conv.toCoin,
        conv.amount.toFixed(8),
        conv.rate.toFixed(2),
        conv.valueBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        conv.type === 'gain' ? 'Ganho' : 'Perda',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-crypto-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handleGeneratePDFReport = async () => {
    if (!portfolioData) return;

    toast.loading('Gerando relatório PDF...');
    
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await generateCryptoPerformanceReport(
        portfolioData,
        'Clínica',
        startDate,
        endDate
      );

      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      logger.error('Erro ao gerar relatório', error);
      toast.error('Erro ao gerar relatório PDF');
    }
  };

  if (loading || !portfolioData) {
    return (
      <Card depth="normal">
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Calculando portfolio...</p>
        </CardContent>
      </Card>
    );
  }

  const netResult = portfolioData.gains - portfolioData.losses;
  const isProfit = netResult >= 0;

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card depth="normal" className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold">
                  {portfolioData.totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card depth="normal" className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ganhos Realizados</p>
                <p className="text-2xl font-bold text-success">
                  +{portfolioData.gains.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card depth="normal" className="border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Perdas Realizadas</p>
                <p className="text-2xl font-bold text-destructive">
                  -{portfolioData.losses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card depth="normal" className={`border-l-4 ${isProfit ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Resultado Líquido</p>
                <p className={`text-2xl font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                  {isProfit ? '+' : ''}{netResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 opacity-20 ${isProfit ? 'text-success' : 'text-destructive'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Distribuição */}
        <Card depth="normal">
          <CardHeader>
            <CardTitle>Distribuição do Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ coin, percentage }) => `${coin} (${percentage.toFixed(1)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {portfolioData.distribution.map(item => (
                <div key={item.coin} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold">{item.coin}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {portfolioData.totalCrypto[item.coin]?.toFixed(8)} {item.coin}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Conversões */}
        <Card depth="normal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Conversões</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePDFReport}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Relatório PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPortfolio}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {portfolioData.conversionsHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma conversão realizada ainda
                </p>
              ) : (
                portfolioData.conversionsHistory.map(conv => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{conv.fromCoin}</Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="outline">{conv.toCoin}</Badge>
                      </div>
                      <Badge variant={conv.type === 'gain' ? 'success' : 'destructive'}>
                        {conv.type === 'gain' ? 'Ganho' : 'Perda'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantidade</p>
                        <p className="font-semibold">{conv.amount.toFixed(8)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor BRL</p>
                        <p className="font-semibold">
                          {conv.valueBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(conv.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cotações Atuais */}
      <Card depth="normal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cotações em Tempo Real</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={calculatePortfolio}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(rates).map(([coin, rate]) => (
              <div
                key={coin}
                className="p-4 rounded-lg border text-center"
                style={{ borderColor: COIN_COLORS[coin] }}
              >
                <p className="text-xs text-muted-foreground mb-1">{coin}</p>
                <p className="text-lg font-bold" style={{ color: COIN_COLORS[coin] }}>
                  {rate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
