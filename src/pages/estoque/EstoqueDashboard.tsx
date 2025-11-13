import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { EstoqueRelatorios } from '@/modules/estoque/components/EstoqueRelatorios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

export default function EstoqueDashboard() {
  const { produtos, requisicoes, movimentacoes, alertas, loading } = useEstoqueSupabase();

  // Métricas principais
  const metrics = useMemo(() => {
    const totalProdutos = produtos.length;
    const produtosEstoqueBaixo = produtos.filter(p => p.quantidadeAtual <= p.quantidadeMinima).length;
    const requisiçõesPendentes = requisicoes.filter(r => r.status === 'PENDENTE').length;
    const valorTotalInventario = produtos.reduce((sum, p) => sum + (p.quantidadeAtual * p.precoCompra), 0);

    return {
      totalProdutos,
      produtosEstoqueBaixo,
      requisiçõesPendentes,
      valorTotalInventario,
    };
  }, [produtos, requisicoes]);

  // Top 10 produtos com estoque mais baixo
  const produtosEstoqueBaixo = useMemo(() => {
    return produtos
      .filter(p => p.quantidadeAtual <= p.quantidadeMinima)
      .sort((a, b) => (a.quantidadeAtual / a.quantidadeMinima) - (b.quantidadeAtual / b.quantidadeMinima))
      .slice(0, 10)
      .map(p => ({
        nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
        atual: p.quantidadeAtual,
        minimo: p.quantidadeMinima,
        percentual: Math.round((p.quantidadeAtual / p.quantidadeMinima) * 100),
      }));
  }, [produtos]);

  // Movimentações dos últimos 7 dias
  const movimentacoesRecentes = useMemo(() => {
    const dias = 7;
    const hoje = new Date();
    const dadosPorDia: Record<string, { entradas: number; saidas: number; data: string }> = {};

    for (let i = dias - 1; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      dadosPorDia[dataStr] = { entradas: 0, saidas: 0, data: dataStr };
    }

    movimentacoes.forEach(m => {
      const dataStr = new Date(m.createdAt!).toISOString().split('T')[0];
      if (dadosPorDia[dataStr]) {
        if (m.tipo === 'ENTRADA' || m.tipo === 'DEVOLUCAO') {
          dadosPorDia[dataStr].entradas += m.quantidade;
        } else if (m.tipo === 'SAIDA' || m.tipo === 'PERDA') {
          dadosPorDia[dataStr].saidas += m.quantidade;
        }
      }
    });

    return Object.values(dadosPorDia).map(d => ({
      data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Entradas: d.entradas,
      Saídas: d.saidas,
    }));
  }, [movimentacoes]);

  // Distribuição de requisições por status
  const distribuicaoRequisicoes = useMemo(() => {
    const statusCount = {
      PENDENTE: 0,
      APROVADA: 0,
      REJEITADA: 0,
      ENTREGUE: 0,
    };

    requisicoes.forEach(r => {
      statusCount[r.status]++;
    });

    return [
      { name: 'Pendente', value: statusCount.PENDENTE, color: '#f59e0b' },
      { name: 'Aprovada', value: statusCount.APROVADA, color: '#10b981' },
      { name: 'Rejeitada', value: statusCount.REJEITADA, color: '#ef4444' },
      { name: 'Entregue', value: statusCount.ENTREGUE, color: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [requisicoes]);

  // Alertas ativos
  const alertasAtivos = useMemo(() => {
    return alertas.filter(a => !a.lido).slice(0, 5);
  }, [alertas]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={BarChart3}
          title="Dashboard do Estoque"
          description="Métricas e indicadores do estoque"
        />
        <LoadingState variant="spinner" size="lg" message="Carregando métricas do estoque..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Dashboard do Estoque"
        description="Visão geral das métricas e indicadores do estoque"
      />

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-3xl font-bold mt-2">{metrics.totalProdutos}</p>
            </div>
            <Package className="h-12 w-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              <p className="text-3xl font-bold mt-2 text-orange-500">{metrics.produtosEstoqueBaixo}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Requisições Pendentes</p>
              <p className="text-3xl font-bold mt-2 text-yellow-500">{metrics.requisiçõesPendentes}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card variant="elevated" className="p-6 hover-scale">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-3xl font-bold mt-2 text-green-500">
                R$ {metrics.valorTotalInventario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Produtos com Estoque Baixo */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Produtos com Estoque Baixo
          </h3>
          {produtosEstoqueBaixo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produtosEstoqueBaixo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="atual" fill="#f59e0b" name="Estoque Atual" />
                <Bar dataKey="minimo" fill="#10b981" name="Estoque Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum produto com estoque baixo</p>
            </div>
          )}
        </Card>

        {/* Gráfico de Distribuição de Requisições */}
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Requisições por Status
          </h3>
          {distribuicaoRequisicoes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribuicaoRequisicoes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuicaoRequisicoes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma requisição registrada</p>
            </div>
          )}
        </Card>
      </div>

      {/* Gráfico de Movimentações Recentes */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Movimentações dos Últimos 7 Dias
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={movimentacoesRecentes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Alertas Ativos */}
      {alertasAtivos.length > 0 && (
        <Card variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas Ativos ({alertasAtivos.length})
          </h3>
          <div className="space-y-2">
            {alertasAtivos.map((alerta) => {
              const produto = produtos.find(p => p.id === alerta.produtoId);
              return (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{produto?.nome}</p>
                      <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Atual: {alerta.quantidadeAtual}</p>
                    {alerta.quantidadeSugerida && (
                      <p className="text-xs text-muted-foreground">Sugerido: {alerta.quantidadeSugerida}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Geração de Relatórios */}
      <EstoqueRelatorios />
    </div>
  );
}
