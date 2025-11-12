import { DollarSign, Clock, ShoppingCart, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { FinancialSummary } from '../types/financeiro.types';

interface FinancialStatsProps {
  summary: FinancialSummary;
}

export function FinancialStats({ summary }: FinancialStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTrend = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}% vs mês anterior`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Receita Total"
        value={formatCurrency(summary.totalRevenue)}
        trend={formatTrend(summary.revenueChange)}
        trendPositive={summary.revenueChange > 0}
        icon={DollarSign}
        iconColor="bg-primary"
        borderColor="border-l-primary"
      />
      <StatCard
        label="Pagamentos Pendentes"
        value={formatCurrency(summary.pendingPayments)}
        trend={formatTrend(summary.paymentsChange)}
        trendPositive={false}
        icon={Clock}
        iconColor="bg-orange-500"
        borderColor="border-l-orange-500"
      />
      <StatCard
        label="Despesas"
        value={formatCurrency(summary.totalExpenses)}
        trend={formatTrend(summary.expensesChange)}
        trendPositive={false}
        icon={ShoppingCart}
        iconColor="bg-red-500"
        borderColor="border-l-red-500"
      />
      <StatCard
        label="Lucro Líquido"
        value={formatCurrency(summary.netProfit)}
        trend={formatTrend(summary.profitChange)}
        trendPositive={summary.profitChange > 0}
        icon={TrendingUp}
        iconColor="bg-green-500"
        borderColor="border-l-green-500"
      />
    </div>
  );
}
