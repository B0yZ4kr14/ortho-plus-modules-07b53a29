import { CategoryDashboard } from '@/components/dashboard/CategoryDashboard';
import { Users, Target, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComercialDashboard() {
  const kpis = [
    {
      title: 'Leads Ativos',
      value: 48,
      icon: Users,
      variant: 'primary' as const,
      trend: { value: 25, label: 'vs mês anterior', isPositive: true },
    },
    {
      title: 'Taxa de Conversão',
      value: '34%',
      icon: Target,
      variant: 'success' as const,
      trend: { value: 8, label: 'vs mês anterior', isPositive: true },
    },
    {
      title: 'Novos Pacientes',
      value: 16,
      icon: TrendingUp,
      variant: 'default' as const,
    },
    {
      title: 'Taxa de Retenção',
      value: '89%',
      icon: Award,
      variant: 'warning' as const,
    },
  ];

  return (
    <CategoryDashboard
      title="Dashboard Comercial"
      description="Visão geral de CRM, marketing e captação"
      kpis={kpis}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funil de Captação</CardTitle>
            <CardDescription>Leads por estágio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Funil de vendas aqui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campanhas Ativas</CardTitle>
            <CardDescription>Performance de marketing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tabela de campanhas aqui</p>
          </CardContent>
        </Card>
      </div>
    </CategoryDashboard>
  );
}
