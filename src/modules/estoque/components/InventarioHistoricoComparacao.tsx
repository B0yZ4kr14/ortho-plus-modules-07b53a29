import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { useInventarioSupabase } from '../hooks/useInventarioSupabase';
import { Inventario } from '../types/estoque.types';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981'];

export function InventarioHistoricoComparacao() {
  const { inventarios, inventarioItems } = useInventarioSupabase();
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('6m');
  const [inventariosFiltrados, setInventariosFiltrados] = useState<Inventario[]>([]);

  useEffect(() => {
    filtrarInventariosPorPeriodo();
  }, [periodoSelecionado, inventarios]);

  const filtrarInventariosPorPeriodo = () => {
    const now = new Date();
    let dataInicio = new Date();

    switch (periodoSelecionado) {
      case '1m':
        dataInicio.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        dataInicio.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        dataInicio.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        dataInicio.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        dataInicio = new Date(0);
        break;
    }

    const filtrados = inventarios
      .filter(inv => new Date(inv.data) >= dataInicio && inv.status === 'CONCLUIDO')
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    setInventariosFiltrados(filtrados);
  };

  // Dados para gráfico de evolução de divergências
  const dadosEvolucaoDivergencias = inventariosFiltrados.map(inv => ({
    data: new Date(inv.data).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    divergencias: inv.divergenciasEncontradas || 0,
    valor: inv.valorDivergencias || 0,
    acuracidade: inv.totalItens ? ((1 - ((inv.divergenciasEncontradas || 0) / inv.totalItens)) * 100) : 0,
  }));

  // Calcular produtos com maiores perdas
  const produtosComPerdas = inventarioItems
    .filter(item => item.divergencia && item.divergencia < 0)
    .reduce((acc, item) => {
      const existing = acc.find(p => p.produtoNome === item.produtoNome);
      if (existing) {
        existing.totalDivergencia += Math.abs(item.divergencia!);
        existing.valorTotal += Math.abs(item.valorDivergencia || 0);
        existing.ocorrencias += 1;
      } else {
        acc.push({
          produtoNome: item.produtoNome,
          totalDivergencia: Math.abs(item.divergencia!),
          valorTotal: Math.abs(item.valorDivergencia || 0),
          ocorrencias: 1,
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10);

  // Dados de distribuição de criticidade
  const distribuicaoCriticidade = inventariosFiltrados.reduce(
    (acc, inv) => {
      const items = inventarioItems.filter(item => item.inventarioId === inv.id);
      items.forEach(item => {
        const perc = Math.abs(item.percentualDivergencia || 0);
        if (perc >= 20) acc.alta++;
        else if (perc >= 10) acc.media++;
        else if (perc > 0) acc.baixa++;
      });
      return acc;
    },
    { alta: 0, media: 0, baixa: 0, semDivergencia: 0 }
  );

  const dadosCriticidade = [
    { name: 'Alta (≥20%)', value: distribuicaoCriticidade.alta, color: '#ef4444' },
    { name: 'Média (10-20%)', value: distribuicaoCriticidade.media, color: '#f97316' },
    { name: 'Baixa (<10%)', value: distribuicaoCriticidade.baixa, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Estatísticas gerais
  const totalDivergencias = inventariosFiltrados.reduce((sum, inv) => sum + (inv.divergenciasEncontradas || 0), 0);
  const totalValorDivergencias = inventariosFiltrados.reduce((sum, inv) => sum + (inv.valorDivergencias || 0), 0);
  const acuracidadeMedia =
    inventariosFiltrados.length > 0
      ? inventariosFiltrados.reduce((sum, inv) => {
          const acuracidade = inv.totalItens ? ((1 - ((inv.divergenciasEncontradas || 0) / inv.totalItens)) * 100) : 100;
          return sum + acuracidade;
        }, 0) / inventariosFiltrados.length
      : 0;

  // Tendência
  const ultimosTres = inventariosFiltrados.slice(-3);
  const tendencia =
    ultimosTres.length >= 2
      ? ((ultimosTres[ultimosTres.length - 1].divergenciasEncontradas || 0) -
          (ultimosTres[0].divergenciasEncontradas || 0)) /
        Math.max(1, ultimosTres[0].divergenciasEncontradas || 1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Análise Histórica de Inventários</h2>
          <p className="text-muted-foreground">
            Evolução de divergências e acuracidade ao longo do tempo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inventários</p>
              <p className="text-2xl font-bold">{inventariosFiltrados.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Divergências Totais</p>
              <p className="text-2xl font-bold">{totalDivergencias}</p>
              {tendencia !== 0 && (
                <div className={`flex items-center gap-1 text-xs ${tendencia < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tendencia < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(tendencia * 100).toFixed(1)}%
                </div>
              )}
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Divergências</p>
              <p className="text-2xl font-bold">R$ {totalValorDivergencias.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Acuracidade Média</p>
              <p className="text-2xl font-bold">{acuracidadeMedia.toFixed(1)}%</p>
            </div>
            <div className={`text-2xl ${acuracidadeMedia >= 95 ? 'text-green-600' : acuracidadeMedia >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
              {acuracidadeMedia >= 95 ? '✓' : acuracidadeMedia >= 90 ? '⚠' : '✗'}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Evolução de Divergências */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolução de Divergências e Acuracidade</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosEvolucaoDivergencias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="divergencias"
              stroke="#ef4444"
              name="Divergências"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="acuracidade"
              stroke="#10b981"
              name="Acuracidade (%)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Produtos com Maiores Perdas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Produtos com Maiores Perdas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={produtosComPerdas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="produtoNome" type="category" width={150} />
              <Tooltip
                formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
              />
              <Bar dataKey="valorTotal" fill="#ef4444" name="Valor Total (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição de Criticidade */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Criticidade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosCriticidade}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosCriticidade.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detalhamento de Produtos com Perdas */}
      {produtosComPerdas.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhamento de Produtos com Perdas Recorrentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Produto</th>
                  <th className="text-center py-2">Ocorrências</th>
                  <th className="text-right py-2">Quantidade Total Perdida</th>
                  <th className="text-right py-2">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {produtosComPerdas.map((produto, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3">{produto.produtoNome}</td>
                    <td className="text-center py-3">{produto.ocorrencias}</td>
                    <td className="text-right py-3">{produto.totalDivergencia.toFixed(2)}</td>
                    <td className="text-right py-3 font-semibold text-red-600">
                      R$ {produto.valorTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
