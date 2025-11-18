/**
 * DASHBOARD V6.0 - Desacoplado da REST API
 * Usa useDashboard hook ao invés de queries diretas ao Supabase
 */

import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Calendar, DollarSign, TrendingUp, Activity, CheckCircle2, BarChart3, FileText, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardChartsMemo } from '@/components/dashboard/DashboardChartsMemo';
import { DashboardWidgetsMemo } from '@/components/dashboard/DashboardWidgetsMemo';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { stats, appointmentsData, revenueData } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Dashboard Administrativo" 
        icon={LayoutDashboard}
        description="Estatísticas em tempo real da sua clínica odontológica"
      />

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" data-tour="stats-cards">
        <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="Total de Pacientes"
            value={stats.totalPatients.toString()}
            description="Pacientes cadastrados"
            icon={Users}
            variant="primary"
            data-testid="stats-card"
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Consultas Hoje"
            value={stats.todayAppointments.toString()}
            description="Agendamentos para hoje"
            icon={Calendar}
            variant="default"
            data-testid="stats-card"
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <StatsCard
            title="Receita Mensal"
            value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`}
            description="Faturamento do mês"
            icon={DollarSign}
            variant="success"
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <StatsCard
            title="Taxa de Ocupação"
            value={`${Math.round(stats.occupancyRate)}%`}
            description="Ocupação hoje"
            icon={Activity}
            variant="warning"
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <StatsCard
            title="Tratamentos Pendentes"
            value={stats.pendingTreatments.toString()}
            description="Em andamento"
            icon={FileText}
            variant="default"
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <StatsCard
            title="Tratamentos Concluídos"
            value={stats.completedTreatments.toString()}
            description="Finalizados"
            icon={CheckCircle2}
            variant="success"
          />
        </div>
      </div>

      {/* Dashboards de Categoria */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboards Especializados
          </CardTitle>
          <CardDescription>Análises detalhadas por área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/dashboards/clinica')}
            >
              <Activity className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-semibold">Dashboard Clínico</p>
                <p className="text-xs text-muted-foreground">Pacientes e Consultas</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/dashboards/financeiro')}
            >
              <DollarSign className="h-6 w-6 text-success" />
              <div className="text-center">
                <p className="font-semibold">Dashboard Financeiro</p>
                <p className="text-xs text-muted-foreground">Receitas e Despesas</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/dashboards/comercial')}
            >
              <TrendingUp className="h-6 w-6 text-warning" />
              <div className="text-center">
                <p className="font-semibold">Dashboard Comercial</p>
                <p className="text-xs text-muted-foreground">CRM e Marketing</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card depth="normal" className="border-l-4 border-l-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Alertas Críticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div>
                <p className="font-medium">5 consultas não confirmadas hoje</p>
                <p className="text-sm text-muted-foreground">Confirmar presença</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-danger/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="font-medium">3 produtos com estoque baixo</p>
                <p className="text-sm text-muted-foreground">Realizar pedido</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <DashboardChartsMemo 
        appointmentsData={appointmentsData as any}
        revenueData={revenueData as any}
      />

      {/* Widgets */}
      <DashboardWidgetsMemo />

      {/* Ações Rápidas */}
      <Card variant="gradient" depth="intense">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionCard
              title="Novo Paciente"
              subtitle="Cadastrar"
              icon={Users}
              bgColor="bg-[hsl(var(--module-blue))]"
              route="/pacientes"
            />
            <ActionCard
              title="Agendar"
              subtitle="Consulta"
              icon={Calendar}
              bgColor="bg-[hsl(var(--module-purple))]"
              route="/agenda"
            />
            <ActionCard
              title="Prontuário"
              subtitle="PEP"
              icon={FileText}
              bgColor="bg-[hsl(var(--module-yellow))]"
              route="/pep"
            />
            <ActionCard
              title="PDV"
              subtitle="Caixa"
              icon={ShoppingCart}
              bgColor="bg-[hsl(var(--module-green))]"
              route="/pdv"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
