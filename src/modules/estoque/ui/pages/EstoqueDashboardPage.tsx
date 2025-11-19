import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { EstoqueRelatorios } from '@/modules/estoque/components/EstoqueRelatorios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

export default function EstoqueDashboardPage() {
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
          description="Visão geral completa do inventário e movimentações"
        />
        <LoadingState variant="spinner" size="lg" message="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Dashboard do Estoque"
        description="Visão geral completa do inventário e movimentações"
      />

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
                <h3 className="text-2xl font-bold mt-2">{metrics.totalProdutos}</h3>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <h3 className="text-2xl font-bold mt-2 text-destructive">{metrics.produtosEstoqueBaixo}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requisições Pendentes</p>
                <h3 className="text-2xl font-bold mt-2">{metrics.requisiçõesPendentes}</h3>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <h3 className="text-2xl font-bold mt-2">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.valorTotalInventario)}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Produtos com Estoque Baixo */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Produtos com Estoque Baixo</h3>
            {produtosEstoqueBaixo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={produtosEstoqueBaixo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="atual" fill="#ef4444" name="Quantidade Atual" />
                  <Bar dataKey="minimo" fill="#f59e0b" name="Quantidade Mínima" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mr-2 text-success" />
                <span>Todos os produtos estão com estoque adequado</span>
              </div>
            )}
          </div>
        </Card>

        {/* Movimentações dos Últimos 7 Dias */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Movimentações (Últimos 7 Dias)</h3>
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
          </div>
        </Card>

        {/* Distribuição de Requisições */}
        {distribuicaoRequisicoes.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status das Requisições</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribuicaoRequisicoes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: ${entry.value}`}
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
            </div>
          </Card>
        )}

        {/* Alertas Ativos */}
        {alertasAtivos.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Alertas Ativos
              </h3>
              <div className="space-y-3">
                {alertasAtivos.map(alerta => (
                  <div key={alerta.id} className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                    <p className="text-sm font-medium">{alerta.tipo}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alerta.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Relatórios */}
      <EstoqueRelatorios />
    </div>
  );
}
