import { CategoryDashboard } from '@/components/dashboard/CategoryDashboard';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { useRealTimeStats } from '@/hooks/useRealTimeStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClinicaDashboard() {
  const totalPatients = useRealTimeStats({ table: 'patients' });
  const activePatients = useRealTimeStats({ 
    table: 'patients',
    where: { status: 'ativo' }
  });
  const todayAppointments = useRealTimeStats({
    table: 'appointments',
    where: { status: 'agendado' }
  });

  const kpis = [
    {
      title: 'Total de Pacientes',
      value: totalPatients.value,
      icon: Users,
      variant: 'primary' as const,
      trend: { value: 12, label: 'vs mês anterior', isPositive: true },
    },
    {
      title: 'Pacientes Ativos',
      value: activePatients.value,
      icon: Activity,
      variant: 'success' as const,
    },
    {
      title: 'Consultas Hoje',
      value: todayAppointments.value,
      icon: Calendar,
      variant: 'default' as const,
    },
    {
      title: 'Taxa de Ocupação',
      value: '76%',
      icon: TrendingUp,
      variant: 'warning' as const,
      trend: { value: 5, label: 'vs semana anterior', isPositive: true },
    },
  ];

  return (
    <CategoryDashboard
      title="Dashboard Clínico"
      description="Visão geral das operações clínicas e atendimento"
      kpis={kpis}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pacientes por Status</CardTitle>
            <CardDescription>Distribuição dos pacientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gráfico de distribuição aqui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultas da Semana</CardTitle>
            <CardDescription>Agendamentos confirmados e realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gráfico de consultas aqui</p>
          </CardContent>
        </Card>
      </div>
    </CategoryDashboard>
  );
}
