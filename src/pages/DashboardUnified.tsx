/**
 * DASHBOARD UNIFICADO V5.0 - Ortho+
 * Consolida 4 dashboards em 1 com abas
 * 18 KPIs críticos organizados por domínio
 */

import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  AlertTriangle,
  HeartPulse,
  Package,
  Target,
  Megaphone
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardUnified() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const { stats, appointmentsData, revenueData } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Dashboard Unificado" 
        icon={LayoutDashboard}
        description="Visão consolidada de toda a operação da clínica"
      />

      {/* Tabs de Domínios */}
      <Tabs defaultValue="executivo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executivo">
            <BarChart3 className="h-4 w-4 mr-2" />
            Executivo
          </TabsTrigger>
          <TabsTrigger value="clinico">
            <HeartPulse className="h-4 w-4 mr-2" />
            Clínico
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="comercial">
            <Target className="h-4 w-4 mr-2" />
            Comercial
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: EXECUTIVO */}
        <TabsContent value="executivo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total de Pacientes"
              value={stats.totalPatients.toString()}
              description="Pacientes cadastrados"
              icon={Users}
              variant="primary"
            />
            <StatsCard
              title="Consultas Hoje"
              value={stats.todayAppointments.toString()}
              description="Agendamentos para hoje"
              icon={Calendar}
              variant="default"
            />
            <StatsCard
              title="Receita Mensal"
              value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`}
              description="Faturamento do mês"
              icon={DollarSign}
              variant="success"
            />
            <StatsCard
              title="Taxa de Ocupação"
              value={`${Math.round(stats.occupancyRate)}%`}
              description="Ocupação hoje"
              icon={Activity}
              variant="warning"
            />
          </div>
        </TabsContent>

        {/* ABA 2: CLÍNICO */}
        <TabsContent value="clinico" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Consultas de Hoje"
              value={stats.todayAppointments.toString()}
              description="Agendamentos confirmados"
              icon={Calendar}
              variant="default"
            />
            <StatsCard
              title="Tratamentos Ativos"
              value={stats.pendingTreatments.toString()}
              description="Em andamento"
              icon={FileText}
              variant="warning"
            />
            <StatsCard
              title="Tratamentos Concluídos"
              value={stats.completedTreatments.toString()}
              description="Finalizados este mês"
              icon={CheckCircle2}
              variant="success"
            />
            <StatsCard
              title="Taxa de Comparecimento"
              value={`${Math.round(stats.occupancyRate)}%`}
              description="Pacientes compareceram"
              icon={Activity}
              variant="primary"
            />
            <StatsCard
              title="Novos Pacientes"
              value="47"
              description="Este mês"
              icon={Users}
              variant="success"
            />
            <StatsCard
              title="Procedimentos/Dia"
              value="12"
              description="Média diária"
              icon={Activity}
              variant="default"
            />
          </div>
        </TabsContent>

        {/* ABA 3: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Receita Mensal"
              value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`}
              description="Faturamento do mês"
              icon={DollarSign}
              variant="success"
            />
            <StatsCard
              title="Contas a Receber"
              value="R$ 45.300"
              description="A vencer este mês"
              icon={FileText}
              variant="warning"
            />
            <StatsCard
              title="Inadimplência"
              value="R$ 8.200"
              description="Pagamentos atrasados"
              icon={AlertTriangle}
              variant="danger"
            />
            <StatsCard
              title="Ticket Médio"
              value="R$ 850"
              description="Por paciente"
              icon={TrendingUp}
              variant="primary"
            />
            <StatsCard
              title="Vendas PDV"
              value="R$ 12.400"
              description="Vendas do mês"
              icon={ShoppingCart}
              variant="success"
            />
            <StatsCard
              title="Formas de Pagamento"
              value="6 ativas"
              description="PIX, Cartão, Cripto"
              icon={DollarSign}
              variant="default"
            />
            <StatsCard
              title="Taxa de Conversão"
              value="68%"
              description="Orçamentos aprovados"
              icon={CheckCircle2}
              variant="success"
            />
            <StatsCard
              title="Valor em Estoque"
              value="R$ 23.500"
              description="Materiais disponíveis"
              icon={Package}
              variant="default"
            />
          </div>
        </TabsContent>

        {/* ABA 4: COMERCIAL */}
        <TabsContent value="comercial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Leads Ativos"
              value="124"
              description="Prospects no funil"
              icon={Target}
              variant="primary"
            />
            <StatsCard
              title="Taxa de Conversão"
              value="68%"
              description="Leads → Pacientes"
              icon={TrendingUp}
              variant="success"
            />
            <StatsCard
              title="CAC (Custo Aquisição)"
              value="R$ 180"
              description="Por novo paciente"
              icon={DollarSign}
              variant="warning"
            />
            <StatsCard
              title="ROI de Marketing"
              value="340%"
              description="Retorno sobre investimento"
              icon={Megaphone}
              variant="success"
            />
            <StatsCard
              title="Campanhas Ativas"
              value="7"
              description="Em execução"
              icon={Megaphone}
              variant="default"
            />
            <StatsCard
              title="Taxa de Abertura"
              value="42%"
              description="E-mails de campanha"
              icon={Activity}
              variant="primary"
            />
            <StatsCard
              title="Recalls Pendentes"
              value="89"
              description="Pacientes para contato"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatsCard
              title="NPS (Satisfação)"
              value="8.7"
              description="De 10.0"
              icon={CheckCircle2}
              variant="success"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
