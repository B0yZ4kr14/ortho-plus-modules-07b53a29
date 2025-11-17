import { CategoryDashboard } from '@/components/dashboard/CategoryDashboard';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FinanceiroDashboard() {
  const kpis = [
    {
      title: 'Receita Mensal',
      value: 'R$ 67.450',
      icon: DollarSign,
      variant: 'success' as const,
      trend: { value: 18, label: 'vs mês anterior', isPositive: true },
    },
    {
      title: 'Despesas Mensais',
      value: 'R$ 33.200',
      icon: TrendingDown,
      variant: 'danger' as const,
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 34.250',
      icon: TrendingUp,
      variant: 'primary' as const,
      trend: { value: 22, label: 'vs mês anterior', isPositive: true },
    },
    {
      title: 'Margem de Lucro',
      value: '51%',
      icon: PieChart,
      variant: 'default' as const,
    },
  ];

  return (
    <CategoryDashboard
      title="Dashboard Financeiro"
      description="Visão geral das finanças e fluxo de caixa"
      kpis={kpis}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (6 meses)</CardTitle>
            <CardDescription>Receitas vs Despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gráfico de linha aqui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas a Receber</CardTitle>
            <CardDescription>Vencidas e a vencer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gráfico de barras aqui</p>
          </CardContent>
        </Card>
      </div>
    </CategoryDashboard>
  );
}
