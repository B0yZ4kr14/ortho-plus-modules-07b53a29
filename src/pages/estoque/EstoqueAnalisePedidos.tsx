import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Clock, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { formatCurrency } from '@/lib/utils/validation.utils';
import { formatDate } from '@/lib/utils/date.utils';
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
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function EstoqueAnalisePedidos() {
  const {
    pedidos,
    pedidosItens,
    produtos,
    fornecedores,
    loading,
  } = useEstoqueSupabase();

  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosAutomaticos: 0,
    valorTotal: 0,
    tempoMedioEntrega: 0,
    economiaAutomacao: 0,
  });

  const [historicoFornecedor, setHistoricoFornecedor] = useState<any[]>([]);
  const [produtosMaisPedidos, setProdutosMaisPedidos] = useState<any[]>([]);
  const [evolucaoPedidos, setEvolucaoPedidos] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && pedidos.length > 0) {
      calcularEstatisticas();
      calcularHistoricoFornecedor();
      calcularProdutosMaisPedidos();
      calcularEvolucaoPedidos();
      calcularDistribuicaoStatus();
    }
  }, [pedidos, pedidosItens, produtos, fornecedores, loading]);

  const calcularEstatisticas = () => {
    const totalPedidos = pedidos.length;
    const pedidosAutomaticos = pedidos.filter(p => p.geradoAutomaticamente).length;
    const valorTotal = pedidos.reduce((sum, p) => sum + p.valorTotal, 0);

    // Calcular tempo médio de entrega (pedidos recebidos)
    const pedidosRecebidos = pedidos.filter(p => p.status === 'RECEBIDO' && p.dataPrevistaEntrega && p.dataRecebimento);
    const tempoMedioEntrega = pedidosRecebidos.length > 0
      ? pedidosRecebidos.reduce((sum, p) => {
          const prevista = new Date(p.dataPrevistaEntrega!);
          const recebida = new Date(p.dataRecebimento!);
          const dias = Math.ceil((recebida.getTime() - prevista.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.abs(dias);
        }, 0) / pedidosRecebidos.length
      : 0;

    // Estimar economia com automação (assumindo 15 minutos por pedido manual x salário médio)
    const custoMedioHora = 50; // R$ 50/hora estimado
    const tempoMedioPedidoManual = 0.25; // 15 minutos = 0.25 horas
    const economiaAutomacao = pedidosAutomaticos * custoMedioHora * tempoMedioPedidoManual;

    setStats({
      totalPedidos,
      pedidosAutomaticos,
      valorTotal,
      tempoMedioEntrega,
      economiaAutomacao,
    });
  };

  const calcularHistoricoFornecedor = () => {
    const fornecedorMap = new Map<string, { total: number; quantidade: number; nome: string }>();

    pedidos.forEach(pedido => {
      const fornecedor = fornecedores.find(f => f.id === pedido.fornecedorId);
      if (fornecedor) {
        const current = fornecedorMap.get(pedido.fornecedorId) || { 
          total: 0, 
          quantidade: 0, 
          nome: fornecedor.nome 
        };
        fornecedorMap.set(pedido.fornecedorId, {
          total: current.total + pedido.valorTotal,
          quantidade: current.quantidade + 1,
          nome: fornecedor.nome,
        });
      }
    });

    const historico = Array.from(fornecedorMap.values())
      .map(item => ({
        nome: item.nome,
        total: item.total,
        quantidade: item.quantidade,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    setHistoricoFornecedor(historico);
  };

  const calcularProdutosMaisPedidos = () => {
    const produtoMap = new Map<string, { quantidade: number; nome: string; valor: number }>();

    pedidosItens.forEach(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      if (produto) {
        const current = produtoMap.get(item.produtoId) || { 
          quantidade: 0, 
          nome: produto.nome,
          valor: 0,
        };
        produtoMap.set(item.produtoId, {
          quantidade: current.quantidade + item.quantidade,
          nome: produto.nome,
          valor: current.valor + item.valorTotal,
        });
      }
    });

    const maisPedidos = Array.from(produtoMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    setProdutosMaisPedidos(maisPedidos);
  };

  const calcularEvolucaoPedidos = () => {
    const mesesMap = new Map<string, { manual: number; automatico: number }>();

    pedidos.forEach(pedido => {
      const data = new Date(pedido.dataPedido);
      const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
      
      const current = mesesMap.get(mesAno) || { manual: 0, automatico: 0 };
      if (pedido.geradoAutomaticamente) {
        current.automatico++;
      } else {
        current.manual++;
      }
      mesesMap.set(mesAno, current);
    });

    const evolucao = Array.from(mesesMap.entries())
      .map(([mes, dados]) => ({
        mes,
        manual: dados.manual,
        automatico: dados.automatico,
        total: dados.manual + dados.automatico,
      }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/').map(Number);
        const [mesB, anoB] = b.mes.split('/').map(Number);
        return anoA === anoB ? mesA - mesB : anoA - anoB;
      });

    setEvolucaoPedidos(evolucao);
  };

  const calcularDistribuicaoStatus = () => {
    const statusMap = new Map<string, number>();

    pedidos.forEach(pedido => {
      const current = statusMap.get(pedido.status) || 0;
      statusMap.set(pedido.status, current + 1);
    });

    const distribuicao = Array.from(statusMap.entries()).map(([status, quantidade]) => {
      const labels: Record<string, string> = {
        PENDENTE: 'Pendente',
        ENVIADO: 'Enviado',
        RECEBIDO: 'Recebido',
        CANCELADO: 'Cancelado',
      };
      return {
        name: labels[status] || status,
        value: quantidade,
      };
    });

    setStatusDistribution(distribuicao);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando análise...</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Análise de Pedidos"
          description="Histórico e estatísticas de compras"
          icon={ShoppingCart}
        />
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Nenhum pedido encontrado. Crie seu primeiro pedido para visualizar análises.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Análise de Pedidos"
        description="Histórico e estatísticas de compras"
        icon={ShoppingCart}
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold">{stats.totalPedidos}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Automáticos</p>
              <p className="text-2xl font-bold">{stats.pedidosAutomaticos}</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalPedidos > 0 ? Math.round((stats.pedidosAutomaticos / stats.totalPedidos) * 100) : 0}% do total
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio Entrega</p>
              <p className="text-2xl font-bold">{stats.tempoMedioEntrega.toFixed(1)} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Economia com Automação</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.economiaAutomacao)}</p>
              <p className="text-xs text-muted-foreground">Estimado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Histórico por Fornecedor */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compras por Fornecedor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicoFornecedor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nome" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="total" fill="#0088FE" name="Valor Total" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Produtos Mais Pedidos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Produtos Mais Pedidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produtosMaisPedidos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="nome" 
                type="category" 
                width={120}
                fontSize={12}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#00C49F" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Evolução de Pedidos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Evolução de Pedidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoPedidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="manual" 
                stroke="#FF8042" 
                name="Manual"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="automatico" 
                stroke="#0088FE" 
                name="Automático"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                name="Total"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela de Top Fornecedores */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Fornecedores</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Fornecedor</th>
                <th className="text-right p-3">Qtd. Pedidos</th>
                <th className="text-right p-3">Valor Total</th>
                <th className="text-right p-3">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {historicoFornecedor.map((fornecedor, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{fornecedor.nome}</td>
                  <td className="text-right p-3">{fornecedor.quantidade}</td>
                  <td className="text-right p-3">{formatCurrency(fornecedor.total)}</td>
                  <td className="text-right p-3">
                    {formatCurrency(fornecedor.total / fornecedor.quantidade)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tabela de Top Produtos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Produtos Mais Pedidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Produto</th>
                <th className="text-right p-3">Quantidade Total</th>
                <th className="text-right p-3">Valor Total</th>
                <th className="text-right p-3">Preço Médio</th>
              </tr>
            </thead>
            <tbody>
              {produtosMaisPedidos.map((produto, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{produto.nome}</td>
                  <td className="text-right p-3">{produto.quantidade}</td>
                  <td className="text-right p-3">{formatCurrency(produto.valor)}</td>
                  <td className="text-right p-3">
                    {formatCurrency(produto.valor / produto.quantidade)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}