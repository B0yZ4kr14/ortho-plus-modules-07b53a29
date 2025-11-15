import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/StatCard';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Calendar, DollarSign, TrendingUp, Activity, CheckCircle2, BarChart3, FileText, Database, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { DashboardChartsMemo } from '@/components/dashboard/DashboardChartsMemo';
import { DashboardWidgetsMemo } from '@/components/dashboard/DashboardWidgetsMemo';
import { StatCardMemo } from '@/components/dashboard/StatCardMemo';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    pendingTreatments: 0,
    completedTreatments: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar estatísticas reais do banco
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('status', 'agendado');

        const { data: treatments } = await supabase
          .from('pep_tratamentos')
          .select('status, valor_estimado');

        const { count: patientsCount } = await supabase
          .from('prontuarios')
          .select('*', { count: 'exact', head: true });

        // Calcular estatísticas
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments?.filter(a => 
          a.start_time.startsWith(today)
        ).length || 0;

        const pending = treatments?.filter(t => t.status === 'EM_ANDAMENTO').length || 0;
        const completed = treatments?.filter(t => t.status === 'CONCLUIDO').length || 0;

        const revenue = treatments
          ?.filter(t => t.status === 'CONCLUIDO')
          .reduce((sum, t) => sum + (Number(t.valor_estimado) || 0), 0) || 0;

        // Taxa de ocupação (simplificado: compromissos / slots disponíveis)
        const totalSlots = 40; // 8 horas * 5 slots por hora
        const occupancy = todayAppts > 0 ? Math.min((todayAppts / totalSlots) * 100, 100) : 0;

        setStats({
          totalPatients: patientsCount || 0,
          todayAppointments: todayAppts,
          monthlyRevenue: revenue,
          occupancyRate: occupancy,
          pendingTreatments: pending,
          completedTreatments: completed,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dados para os gráficos
  const appointmentsData = [
    { name: 'Seg', agendadas: 12, realizadas: 10 },
    { name: 'Ter', agendadas: 15, realizadas: 13 },
    { name: 'Qua', agendadas: 18, realizadas: 16 },
    { name: 'Qui', agendadas: 14, realizadas: 12 },
    { name: 'Sex', agendadas: 16, realizadas: 15 },
    { name: 'Sáb', agendadas: 8, realizadas: 7 },
  ];

  const revenueData = [
    { name: 'Jan', receita: 45000, despesas: 28000 },
    { name: 'Fev', receita: 52000, despesas: 30000 },
    { name: 'Mar', receita: 48000, despesas: 29000 },
    { name: 'Abr', receita: 61000, despesas: 32000 },
    { name: 'Mai', receita: 55000, despesas: 31000 },
    { name: 'Jun', receita: 67000, despesas: 33000 },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Dashboard Administrativo" 
        icon={LayoutDashboard}
        description="Estatísticas em tempo real da sua clínica"
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="dashboard-stats">
        <StatCard
          label="Pacientes Ativos"
          value={stats.totalPatients.toString()}
          icon={Users}
          trend={`+12%`}
          trendPositive={true}
          iconColor="bg-blue-500"
          borderColor="border-l-blue-500"
        />
        <StatCard
          label="Consultas Hoje"
          value={stats.todayAppointments.toString()}
          icon={Calendar}
          trend={`${stats.todayAppointments} agendadas`}
          trendPositive={true}
          iconColor="bg-purple-500"
          borderColor="border-l-purple-500"
        />
        <StatCard
          label="Receita Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="+15%"
          trendPositive={true}
          iconColor="bg-green-500"
          borderColor="border-l-green-500"
        />
        <StatCard
          label="Taxa de Ocupação"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={stats.occupancyRate > 50 ? "Boa ocupação" : "Baixa ocupação"}
          trendPositive={stats.occupancyRate > 50}
          iconColor="bg-orange-500"
          borderColor="border-l-orange-500"
        />
      </div>

      {/* Gráficos Memoizados */}
      <DashboardChartsMemo 
        appointmentsData={appointmentsData}
        revenueData={revenueData}
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
