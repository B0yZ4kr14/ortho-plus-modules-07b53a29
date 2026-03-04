import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react';
import { useInventarioSupabase } from '@/modules/estoque/hooks/useInventarioSupabase';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EstoqueInventarioDashboard() {
  const { inventarios, inventarioItems, loading } = useInventarioSupabase();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calcular KPIs
  const calcularKPIs = () => {
    const now = new Date();
    const periodDays = parseInt(selectedPeriod);
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const inventariosPeriodo = inventarios.filter(inv => 
      new Date(inv.createdAt) >= periodStart
    );

    const totalInventarios = inventariosPeriodo.length;
    const totalDivergencias = inventariosPeriodo.reduce((sum, inv) => sum + inv.divergenciasEncontradas, 0);
    const totalPerdas = inventariosPeriodo.reduce((sum, inv) => sum + inv.valorDivergencias, 0);
    const totalItensAnalisados = inventariosPeriodo.reduce((sum, inv) => sum + inv.totalItens, 0);
    const acuracidadeMedia = totalItensAnalisados > 0 
      ? ((totalItensAnalisados - totalDivergencias) / totalItensAnalisados) * 100 
      : 100;

    // Comparação com período anterior
    const prevPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const inventariosPeriodoAnterior = inventarios.filter(inv => {
      const data = new Date(inv.createdAt);
      return data >= prevPeriodStart && data < periodStart;
    });

    const perdasPeriodoAnterior = inventariosPeriodoAnterior.reduce((sum, inv) => sum + inv.valorDivergencias, 0);
    const variacaoPerdas = perdasPeriodoAnterior > 0 
      ? ((totalPerdas - perdasPeriodoAnterior) / perdasPeriodoAnterior) * 100 
      : 0;

    return {
      totalInventarios,
      totalDivergencias,
      totalPerdas,
      acuracidadeMedia,
      variacaoPerdas,
      totalItensAnalisados
    };
  };

  // Dados para gráfico de tendência de acuracidade
  const getTendenciaAcuracidade = () => {
    const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        mesNum: date.getMonth(),
        anoNum: date.getFullYear()
      };
    });

    return ultimos6Meses.map(({ mes, mesNum, anoNum }) => {
      const inventariosMes = inventarios.filter(inv => {
        const data = new Date(inv.createdAt);
        return data.getMonth() === mesNum && data.getFullYear() === anoNum;
      });

      const totalItens = inventariosMes.reduce((sum, inv) => sum + inv.totalItens, 0);
      const totalDiverg = inventariosMes.reduce((sum, inv) => sum + inv.divergenciasEncontradas, 0);
      const acuracidade = totalItens > 0 ? ((totalItens - totalDiverg) / totalItens) * 100 : 100;

      return {
        mes,
        acuracidade: parseFloat(acuracidade.toFixed(2)),
        divergencias: totalDiverg
      };
    });
  };

  // Dados para gráfico de perdas mensais
  const getPerdasMensais = () => {
    const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        mesNum: date.getMonth(),
        anoNum: date.getFullYear()
      };
    });

    return ultimos6Meses.map(({ mes, mesNum, anoNum }) => {
      const inventariosMes = inventarios.filter(inv => {
        const data = new Date(inv.createdAt);
        return data.getMonth() === mesNum && data.getFullYear() === anoNum;
      });

      const perdas = inventariosMes.reduce((sum, inv) => sum + inv.valorDivergencias, 0);

      return {
        mes,
        perdas: parseFloat(perdas.toFixed(2))
      };
    });
  };

  // Ranking de produtos com maiores perdas
  const getRankingProdutos = () => {
    const produtoPerdas = new Map<string, { nome: string; perda: number; quantidade: number }>();

    inventarioItems.forEach(item => {
      if (item.valorDivergencia && item.valorDivergencia > 0) {
        const existing = produtoPerdas.get(item.produtoId);
        if (existing) {
          existing.perda += item.valorDivergencia;
          existing.quantidade += Math.abs(item.divergencia || 0);
        } else {
          produtoPerdas.set(item.produtoId, {
            nome: item.produtoNome,
            perda: item.valorDivergencia,
            quantidade: Math.abs(item.divergencia || 0)
          });
        }
      }
    });

    return Array.from(produtoPerdas.values())
      .sort((a, b) => b.perda - a.perda)
      .slice(0, 10);
  };

  // Distribuição de criticidade
  const getDistribuicaoCriticidade = () => {
    const criticidade = { baixa: 0, media: 0, alta: 0, critica: 0 };

    inventarioItems.forEach(item => {
      const percentual = item.percentualDivergencia || 0;
      if (percentual < 5) criticidade.baixa++;
      else if (percentual < 10) criticidade.media++;
      else if (percentual < 20) criticidade.alta++;
      else criticidade.critica++;
    });

    return [
      { name: 'Baixa (< 5%)', value: criticidade.baixa, color: '#10b981' },
      { name: 'Média (5-10%)', value: criticidade.media, color: '#f59e0b' },
      { name: 'Alta (10-20%)', value: criticidade.alta, color: '#ef4444' },
      { name: 'Crítica (> 20%)', value: criticidade.critica, color: '#7c3aed' }
    ];
  };

  const kpis = calcularKPIs();
  const tendenciaAcuracidade = getTendenciaAcuracidade();
  const perdasMensais = getPerdasMensais();
  const rankingProdutos = getRankingProdutos();
  const distribuicaoCriticidade = getDistribuicaoCriticidade();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Dashboard Executivo - Inventário"
          description="Análise consolidada e KPIs em tempo real"
          icon={BarChart3}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard Executivo - Inventário"
        description="Análise consolidada e KPIs em tempo real"
        icon={BarChart3}
      />

      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="180">Últimos 6 meses</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inventários Realizados</p>
              <p className="text-3xl font-bold mt-2">{kpis.totalInventarios}</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acuracidade Média</p>
              <p className="text-3xl font-bold mt-2">{kpis.acuracidadeMedia.toFixed(1)}%</p>
              {kpis.acuracidadeMedia >= 95 ? (
                <Badge variant="success" className="mt-2">Excelente</Badge>
              ) : kpis.acuracidadeMedia >= 90 ? (
                <Badge variant="default" className="mt-2">Bom</Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">Precisa Melhorar</Badge>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Total de Perdas</p>
              <p className="text-3xl font-bold mt-2">
                R$ {kpis.totalPerdas.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {kpis.variacaoPerdas > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">+{kpis.variacaoPerdas.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">{kpis.variacaoPerdas.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-1">vs período anterior</span>
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
        </Card>

        <Card className="p-6" depth="normal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Divergências</p>
              <p className="text-3xl font-bold mt-2">{kpis.totalDivergencias}</p>
              <p className="text-xs text-muted-foreground mt-2">
                de {kpis.totalItensAnalisados} itens analisados
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="tendencia" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tendencia">Tendência de Acuracidade</TabsTrigger>
          <TabsTrigger value="perdas">Perdas Mensais</TabsTrigger>
          <TabsTrigger value="ranking">Ranking de Produtos</TabsTrigger>
          <TabsTrigger value="criticidade">Criticidade</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencia">
          <Card className="p-6" depth="normal">
            <h3 className="text-lg font-semibold mb-4">Evolução da Acuracidade (Últimos 6 Meses)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={tendenciaAcuracidade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="acuracidade" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Acuracidade (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="divergencias" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Divergências"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="perdas">
          <Card className="p-6" depth="normal">
            <h3 className="text-lg font-semibold mb-4">Valor de Perdas Mensais (R$)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={perdasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="perdas" fill="hsl(var(--destructive))" name="Perdas (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <Card className="p-6" depth="normal">
            <h3 className="text-lg font-semibold mb-4">Top 10 Produtos com Maiores Perdas</h3>
            <div className="space-y-4">
              {rankingProdutos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma divergência registrada</p>
              ) : (
                rankingProdutos.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">{produto.quantidade} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">
                        R$ {produto.perda.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="criticidade">
          <Card className="p-6" depth="normal">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Divergências por Criticidade</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={distribuicaoCriticidade}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoCriticidade.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {distribuicaoCriticidade.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value} itens</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
