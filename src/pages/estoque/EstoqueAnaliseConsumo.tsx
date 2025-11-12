import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, Calendar, AlertTriangle } from 'lucide-react';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/shared/PageHeader';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function EstoqueAnaliseConsumo() {
  const [periodoAnalise, setPeriodoAnalise] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const { produtos, movimentacoes, loading } = useEstoqueSupabase();

  // Calcular produtos mais consumidos
  const produtosMaisConsumidos = useMemo(() => {
    const consumoPorProduto = movimentacoes
      .filter(m => m.tipo === 'SAIDA')
      .reduce((acc, mov) => {
        const produto = produtos.find(p => p.id === mov.produtoId);
        if (produto) {
          if (!acc[mov.produtoId!]) {
            acc[mov.produtoId!] = {
              nome: produto.nome || '',
              quantidade: 0,
              valor: 0,
            };
          }
          acc[mov.produtoId!].quantidade += mov.quantidade || 0;
          acc[mov.produtoId!].valor += mov.valorTotal || 0;
        }
        return acc;
      }, {} as Record<string, { nome: string; quantidade: number; valor: number }>);

    return Object.entries(consumoPorProduto)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [movimentacoes, produtos]);

  // Calcular tendências de uso ao longo do tempo
  const tendenciasUso = useMemo(() => {
    const dataInicio = periodoAnalise === '12m' 
      ? subMonths(new Date(), 12)
      : periodoAnalise === '90d'
      ? subDays(new Date(), 90)
      : periodoAnalise === '30d'
      ? subDays(new Date(), 30)
      : subDays(new Date(), 7);

    const movimentacoesFiltradas = movimentacoes.filter(
      m => m.tipo === 'SAIDA' && m.createdAt && new Date(m.createdAt) >= dataInicio
    );

    if (periodoAnalise === '12m') {
      const meses = eachMonthOfInterval({ start: dataInicio, end: new Date() });
      return meses.map(mes => {
        const inicio = startOfMonth(mes);
        const fim = endOfMonth(mes);
        const consumoMes = movimentacoesFiltradas
          .filter(m => {
            const data = m.createdAt ? new Date(m.createdAt) : null;
            return data && data >= inicio && data <= fim;
          })
          .reduce((sum, m) => sum + (m.quantidade || 0), 0);
        
        return {
          periodo: format(mes, 'MMM/yy', { locale: ptBR }),
          consumo: consumoMes,
        };
      });
    } else {
      const dias = eachDayOfInterval({ start: dataInicio, end: new Date() });
      const agrupamento = periodoAnalise === '90d' ? 7 : 1; // Agrupar por semana se 90d
      
      if (agrupamento === 7) {
        const semanas: { periodo: string; consumo: number }[] = [];
        for (let i = 0; i < dias.length; i += 7) {
          const semana = dias.slice(i, i + 7);
          const consumoSemana = movimentacoesFiltradas
            .filter(m => {
              const data = m.createdAt ? new Date(m.createdAt) : null;
              return data && data >= semana[0] && data <= semana[semana.length - 1];
            })
            .reduce((sum, m) => sum + (m.quantidade || 0), 0);
          
          semanas.push({
            periodo: `${format(semana[0], 'dd/MM', { locale: ptBR })}`,
            consumo: consumoSemana,
          });
        }
        return semanas;
      }

      return dias.map(dia => {
        const consumoDia = movimentacoesFiltradas
          .filter(m => m.createdAt && format(new Date(m.createdAt), 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd'))
          .reduce((sum, m) => sum + (m.quantidade || 0), 0);
        
        return {
          periodo: format(dia, 'dd/MM', { locale: ptBR }),
          consumo: consumoDia,
        };
      });
    }
  }, [movimentacoes, periodoAnalise]);

  // Previsão de reposição
  const previsaoReposicao = useMemo(() => {
    const diasAnalise = periodoAnalise === '12m' ? 365 
      : periodoAnalise === '90d' ? 90 
      : periodoAnalise === '30d' ? 30 
      : 7;

    return produtos
      .map(produto => {
        const consumoTotal = movimentacoes
          .filter(m => 
            m.tipo === 'SAIDA' && 
            m.produtoId === produto.id &&
            m.createdAt && new Date(m.createdAt) >= subDays(new Date(), diasAnalise)
          )
          .reduce((sum, m) => sum + (m.quantidade || 0), 0);

        const consumoMedioDiario = consumoTotal / diasAnalise;
        const diasRestantes = consumoMedioDiario > 0 
          ? Math.floor((produto.quantidadeAtual || 0) / consumoMedioDiario)
          : Infinity;

        return {
          id: produto.id,
          nome: produto.nome || '',
          quantidadeAtual: produto.quantidadeAtual || 0,
          quantidadeMinima: produto.quantidadeMinima || 0,
          consumoMedioDiario: Math.round(consumoMedioDiario * 10) / 10,
          diasRestantes,
          dataReposicao: diasRestantes !== Infinity 
            ? format(new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: ptBR })
            : 'N/A',
          urgencia: diasRestantes < 7 ? 'critica' : diasRestantes < 15 ? 'alta' : diasRestantes < 30 ? 'media' : 'baixa',
        };
      })
      .filter(p => p.diasRestantes !== Infinity && p.diasRestantes < 60)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 15);
  }, [produtos, movimentacoes, periodoAnalise]);

  // Distribuição de consumo por categoria
  const consumoPorCategoria = useMemo(() => {
    const categorias = movimentacoes
      .filter(m => m.tipo === 'SAIDA')
      .reduce((acc, mov) => {
        const produto = produtos.find(p => p.id === mov.produtoId);
        if (produto) {
          const categoriaId = produto.categoriaId || 'sem-categoria';
          if (!acc[categoriaId]) {
            acc[categoriaId] = {
              nome: produto.categoriaId ? 'Categoria' : 'Sem Categoria',
              valor: 0,
            };
          }
          acc[categoriaId].valor += mov.quantidade || 0;
        }
        return acc;
      }, {} as Record<string, { nome: string; valor: number }>);

    return Object.values(categorias);
  }, [movimentacoes, produtos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando análise de consumo...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Análise de Consumo de Estoque"
        description="Análise preditiva e tendências de uso de materiais"
        icon={TrendingUp}
      />

      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={periodoAnalise} onValueChange={(v: any) => setPeriodoAnalise(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Consumido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movimentacoes.filter(m => m.tipo === 'SAIDA').reduce((sum, m) => sum + m.quantidade, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">unidades no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Monitorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {previsaoReposicao.length}
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">com previsão de reposição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgência Crítica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2 text-destructive">
              {previsaoReposicao.filter(p => p.urgencia === 'critica').length}
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">produtos em menos de 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tendência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {tendenciasUso[tendenciasUso.length - 1]?.consumo > tendenciasUso[0]?.consumo ? (
                <>
                  <TrendingUp className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Alta</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Baixa</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">comparado ao início do período</p>
          </CardContent>
        </Card>
      </div>

      {/* Tendências de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências de Consumo</CardTitle>
          <CardDescription>Evolução do consumo ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendenciasUso}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="consumo" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Consumo (unidades)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Consumidos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos Mais Consumidos</CardTitle>
            <CardDescription>Ranking de produtos por quantidade consumida</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={produtosMaisConsumidos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nome" width={150} />
                <Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Consumo por Categoria</CardTitle>
            <CardDescription>Distribuição do consumo entre categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={consumoPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.nome}
                  outerRadius={120}
                  fill="hsl(var(--primary))"
                  dataKey="valor"
                >
                  {consumoPorCategoria.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Previsão de Reposição */}
      <Card>
        <CardHeader>
          <CardTitle>Previsão de Reposição</CardTitle>
          <CardDescription>
            Produtos que precisarão de reposição nos próximos 60 dias (baseado em consumo médio)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previsaoReposicao.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum produto necessita reposição nos próximos 60 dias
              </p>
            ) : (
              previsaoReposicao.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      Estoque: {item.quantidadeAtual} un. | Consumo médio: {item.consumoMedioDiario} un/dia
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.diasRestantes} dias
                      </p>
                      <p className="text-xs text-muted-foreground">
                        até {item.dataReposicao}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.urgencia === 'critica'
                          ? 'bg-destructive/10 text-destructive'
                          : item.urgencia === 'alta'
                          ? 'bg-orange-500/10 text-orange-600'
                          : item.urgencia === 'media'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {item.urgencia === 'critica'
                        ? 'Crítico'
                        : item.urgencia === 'alta'
                        ? 'Alta'
                        : item.urgencia === 'media'
                        ? 'Média'
                        : 'Baixa'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
