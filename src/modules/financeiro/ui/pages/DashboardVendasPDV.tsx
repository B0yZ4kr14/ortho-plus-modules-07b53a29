import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  CreditCard,
  Users,
  Award,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--info))',
  'hsl(var(--muted))'
];

export default function DashboardVendasPDV() {
  const { clinicId } = useAuth();
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');

  // Query de vendas
  const { data: vendas, isLoading } = useQuery({
    queryKey: ['pdv-vendas-analytics', clinicId, periodo],
    queryFn: async () => {
      const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      const { data, error } = await supabase
        .from('pdv_vendas')
        .select(`
          *,
          pdv_venda_itens(*),
          pdv_pagamentos(*)
        `)
        .eq('clinic_id', clinicId)
        .gte('created_at', dataInicio.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });

  // Calcular KPIs
  const stats = {
    totalVendas: vendas?.length || 0,
    valorTotal: vendas?.reduce((sum, v) => sum + Number(v.valor_total), 0) || 0,
    ticketMedio: vendas?.length ? (vendas.reduce((sum, v) => sum + Number(v.valor_total), 0) / vendas.length) : 0,
    itensVendidos: vendas?.reduce((sum, v) => sum + (v.pdv_venda_itens?.length || 0), 0) || 0,
  };

  // Vendas por vendedor
  const vendasPorVendedor = vendas?.reduce((acc, venda) => {
    const vendedorId = venda.created_by;
    if (!acc[vendedorId]) {
      acc[vendedorId] = { vendedor: vendedorId.slice(0, 8), total: 0, quantidade: 0 };
    }
    acc[vendedorId].total += Number(venda.valor_total);
    acc[vendedorId].quantidade += 1;
    return acc;
  }, {} as Record<string, { vendedor: string; total: number; quantidade: number }>) || {};

  const vendedoresData = Object.values(vendasPorVendedor)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Produtos mais vendidos
  const produtosMaisVendidos = vendas?.reduce((acc, venda) => {
    venda.pdv_venda_itens?.forEach((item: any) => {
      const descricao = item.descricao || 'Sem descrição';
      if (!acc[descricao]) {
        acc[descricao] = { produto: descricao, quantidade: 0, valor: 0 };
      }
      acc[descricao].quantidade += Number(item.quantidade);
      acc[descricao].valor += Number(item.valor_total);
    });
    return acc;
  }, {} as Record<string, { produto: string; quantidade: number; valor: number }>) || {};

  const produtosData = Object.values(produtosMaisVendidos)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  // Vendas por hora
  const vendasPorHora = vendas?.reduce((acc, venda) => {
    const hora = new Date(venda.created_at).getHours();
    if (!acc[hora]) {
      acc[hora] = { hora: `${hora}:00`, vendas: 0, valor: 0 };
    }
    acc[hora].vendas += 1;
    acc[hora].valor += Number(venda.valor_total);
    return acc;
  }, {} as Record<number, { hora: string; vendas: number; valor: number }>) || {};

  const horariosData = Object.values(vendasPorHora).sort((a, b) => {
    const horaA = parseInt(a.hora.split(':')[0]);
    const horaB = parseInt(b.hora.split(':')[0]);
    return horaA - horaB;
  });

  // Formas de pagamento
  const formasPagamento = vendas?.reduce((acc, venda) => {
    venda.pdv_pagamentos?.forEach((pag: any) => {
      const forma = pag.forma_pagamento;
      if (!acc[forma]) {
        acc[forma] = { name: forma, value: 0 };
      }
      acc[forma].value += Number(pag.valor);
    });
    return acc;
  }, {} as Record<string, { name: string; value: number }>) || {};

  const pagamentosData = Object.values(formasPagamento);

  // Vendas ao longo do tempo
  const vendasTempo = vendas?.reduce((acc, venda) => {
    const data = new Date(venda.created_at).toLocaleDateString('pt-BR');
    if (!acc[data]) {
      acc[data] = { data, vendas: 0, valor: 0 };
    }
    acc[data].vendas += 1;
    acc[data].valor += Number(venda.valor_total);
    return acc;
  }, {} as Record<string, { data: string; vendas: number; valor: number }>) || {};

  const tempoData = Object.values(vendasTempo).slice(-30);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de Vendas PDV"
        description="Analytics completo de performance de vendas e operação do PDV"
        icon={<BarChart3 />}
      />

      {/* Filtros de Período */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((p) => (
          <Badge
            key={p}
            variant={periodo === p ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPeriodo(p)}
          >
            {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
          </Badge>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold">{stats.totalVendas}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.valorTotal)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(stats.ticketMedio)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-info/10">
              <BarChart3 className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Itens Vendidos</p>
              <p className="text-2xl font-bold">{stats.itensVendidos}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="vendedores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vendedores">
            <Users className="h-4 w-4 mr-2" />
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Award className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="horarios">
            <Clock className="h-4 w-4 mr-2" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="pagamentos">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendedores" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance por Vendedor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendedoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendedor" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Valor Total" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quantidade de Vendas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendedoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vendedor" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="hsl(var(--success))" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Produtos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={produtosData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="produto" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Horários de Pico de Vendas</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={horariosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="vendas"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  name="Vendas"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success))"
                  fillOpacity={0.3}
                  name="Valor (R$)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Formas de Pagamento</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pagamentosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pagamentosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Evolução de Vendas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tempoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Valor"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
