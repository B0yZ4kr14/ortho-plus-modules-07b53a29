/**
 * DASHBOARD V6.0 - Desacoplado da REST API
 * Usa useDashboard hook ao invés de queries diretas ao Supabase
 */

import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Calendar, DollarSign, TrendingUp, Activity, CheckCircle2, BarChart3, FileText, Database, ShoppingCart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Dashboard Administrativo" 
        icon={LayoutDashboard}
        description="Estatísticas em tempo real da sua clínica"
      />

      {/* TOP 6 KPIs Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-tour="dashboard-stats">
        <StatsCard
          title="Pacientes Ativos"
          value={stats.totalPatients}
          icon={Users}
          variant="primary"
          trend={{ value: 12, label: 'vs mês anterior', isPositive: true }}
        />
        <StatsCard
          title="Consultas Hoje"
          value={stats.todayAppointments}
          icon={Calendar}
          variant="default"
        />
        <StatsCard
          title="Receita Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          variant="success"
          trend={{ value: 15, label: 'vs mês anterior', isPositive: true }}
        />
        <StatsCard
          title="Taxa de Ocupação"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={TrendingUp}
          variant={stats.occupancyRate > 50 ? 'success' : 'warning'}
        />
        <StatsCard
          title="Tratamentos Pendentes"
          value={stats.pendingTreatments}
          icon={Activity}
          variant="warning"
        />
        <StatsCard
          title="Tratamentos Concluídos"
          value={stats.completedTreatments}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Dashboards de Categoria - Links Rápidos */}
      <Card depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboards por Categoria
          </CardTitle>
          <CardDescription>Acesse análises detalhadas por área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:shadow-lg transition-all"
              onClick={() => navigate('/dashboards/clinica')}
            >
              <Activity className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="font-semibold">Dashboard Clínico</p>
                <p className="text-xs text-muted-foreground">Pacientes, Consultas, Ocupação</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:shadow-lg transition-all"
              onClick={() => navigate('/dashboards/financeiro')}
            >
              <DollarSign className="h-6 w-6 text-success" />
              <div className="text-center">
                <p className="font-semibold">Dashboard Financeiro</p>
                <p className="text-xs text-muted-foreground">Receitas, Despesas, Fluxo</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:shadow-lg transition-all"
              onClick={() => navigate('/dashboards/comercial')}
            >
              <TrendingUp className="h-6 w-6 text-warning" />
              <div className="text-center">
                <p className="font-semibold">Dashboard Comercial</p>
                <p className="text-xs text-muted-foreground">CRM, Leads, Marketing</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticos */}
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
                <p className="font-medium">5 consultas não confirmadas para hoje</p>
                <p className="text-sm text-muted-foreground">Ligue para confirmar presença</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-danger/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="font-medium">3 produtos com estoque baixo</p>
                <p className="text-sm text-muted-foreground">Realize pedido de reposição</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Memoizados */}
      <DashboardChartsMemo 
        appointmentsData={data.appointmentsData}
        revenueData={data.revenueData}
      />

      {/* Widgets de Cotações Memoizados */}
      <DashboardWidgetsMemo />

      {/* Action Cards - Ações Rápidas */}
      <Card variant="gradient" depth="intense" data-tour="action-cards">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
              <ActionCard
                title="Novo Paciente"
                subtitle="Cadastrar"
                icon={Users}
                bgColor="bg-[hsl(var(--module-blue))]"
                route="/pacientes"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <ActionCard
                title="Agendar Consulta"
                subtitle="Agenda"
                icon={Calendar}
                bgColor="bg-[hsl(var(--module-purple))]"
                route="/agenda-clinica"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <ActionCard
                title="Prontuário"
                subtitle="Abrir PEP"
                icon={FileText}
                bgColor="bg-[hsl(var(--module-yellow))]"
                route="/pep"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <ActionCard
                title="Contas a Receber"
                subtitle="Financeiro"
                icon={DollarSign}
                bgColor="bg-[hsl(var(--module-green))]"
                route="/financeiro/contas-receber"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <ActionCard
                title="Estoque"
                subtitle="Gerenciar"
                icon={Activity}
                bgColor="bg-[hsl(var(--module-orange))]"
                route="/estoque"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
              <ActionCard
                title="Relatórios"
                subtitle="Business Intelligence"
                icon={BarChart3}
                bgColor="bg-[hsl(var(--module-cyan))]"
                route="/business-intelligence"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
              <ActionCard
                title="Backups"
                subtitle="Gerenciar Backups"
                icon={Database}
                bgColor="bg-[hsl(var(--module-purple))]"
                route="/configuracoes?tab=backups"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '700ms' }}>
              <ActionCard
                title="PDV"
                subtitle="Ponto de Venda"
                icon={ShoppingCart}
                bgColor="bg-[hsl(var(--module-green))]"
                route="/pdv"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tratamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" depth="normal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Tratamentos em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{stats.pendingTreatments}</div>
            <p className="text-sm text-muted-foreground mt-2">Tratamentos pendentes</p>
          </CardContent>
        </Card>

        <Card variant="elevated" depth="normal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Tratamentos Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{stats.completedTreatments}</div>
            <p className="text-sm text-muted-foreground mt-2">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Consultas */}
        <Card variant="gradient" depth="intense">
          <CardHeader>
            <CardTitle>Consultas da Semana</CardTitle>
            <CardDescription>Comparação entre agendadas e realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Bar dataKey="agendadas" fill="hsl(var(--primary))" name="Agendadas" />
                <Bar dataKey="realizadas" fill="hsl(var(--chart-2))" name="Realizadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Receita */}
        <Card variant="gradient" depth="intense">
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => 
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="Receita" 
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={2}
                  name="Despesas" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Consultas */}
      <Card variant="elevated" depth="normal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Consultas Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.todayAppointments > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Você tem {stats.todayAppointments} consulta(s) agendada(s) para hoje
              </p>
              <Button variant="outline" className="w-full">
                Ver Agenda Completa
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma consulta agendada para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
