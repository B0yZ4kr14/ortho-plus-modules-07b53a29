import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, Filter, Download, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Mock data de transações
const mockTransacoes = [
  {
    id: '1',
    data: new Date('2025-01-15'),
    paciente: 'Maria Silva',
    metodo: 'PIX',
    valor: 450.00,
    status: 'aprovado',
    tipo: 'receita',
  },
  {
    id: '2',
    data: new Date('2025-01-14'),
    paciente: 'João Santos',
    metodo: 'Cartão de Crédito',
    valor: 1200.00,
    status: 'aprovado',
    tipo: 'receita',
  },
  {
    id: '3',
    data: new Date('2025-01-13'),
    paciente: 'Ana Costa',
    metodo: 'PIX',
    valor: 350.00,
    status: 'aprovado',
    tipo: 'receita',
  },
  {
    id: '4',
    data: new Date('2025-01-12'),
    paciente: 'Pedro Lima',
    metodo: 'Dinheiro',
    valor: 280.00,
    status: 'aprovado',
    tipo: 'receita',
  },
  {
    id: '5',
    data: new Date('2025-01-11'),
    paciente: 'Carla Souza',
    metodo: 'Cartão de Débito',
    valor: 580.00,
    status: 'aprovado',
    tipo: 'receita',
  },
];

export default function Transacoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('todos');

  // Cálculos de KPIs
  const totalTransacoes = mockTransacoes.length;
  const valorTotal = mockTransacoes.reduce((sum, t) => sum + t.valor, 0);
  const taxaAprovacao = (mockTransacoes.filter(t => t.status === 'aprovado').length / totalTransacoes) * 100;

  // Métodos mais usados
  const metodosCount = mockTransacoes.reduce((acc, t) => {
    acc[t.metodo] = (acc[t.metodo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const metodoMaisUsado = Object.entries(metodosCount).sort((a, b) => b[1] - a[1])[0][0];

  // Dados para gráfico de métodos
  const metodosChartData = Object.entries(metodosCount).map(([name, value]) => ({
    name,
    value,
    color: name === 'PIX' ? 'hsl(var(--chart-1))' : name === 'Cartão de Crédito' ? 'hsl(var(--chart-2))' : name === 'Cartão de Débito' ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-4))',
  }));

  // Dados para gráfico de volume por dia
  const volumeData = mockTransacoes.reduce((acc, t) => {
    const day = format(t.data, 'dd/MM');
    const existing = acc.find(item => item.dia === day);
    if (existing) {
      existing.valor += t.valor;
    } else {
      acc.push({ dia: day, valor: t.valor });
    }
    return acc;
  }, [] as Array<{ dia: string; valor: number }>);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'success' | 'error' | 'warning' }> = {
      aprovado: { label: 'Aprovado', variant: 'success' },
      recusado: { label: 'Recusado', variant: 'error' },
      pendente: { label: 'Pendente', variant: 'warning' },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredTransacoes = mockTransacoes.filter((t) => {
    const matchesSearch = t.paciente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMetodo = filterMetodo === 'todos' || t.metodo === filterMetodo;
    return matchesSearch && matchesMetodo;
  });

  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader 
        icon={Activity} 
        title="Dashboard de Transações" 
        description="Histórico completo de pagamentos processados"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total de Transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalTransacoes}</div>
            <p className="text-xs text-muted-foreground mt-2">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Volume Total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Processado este mês</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Método Mais Usado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metodoMaisUsado}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {metodosCount[metodoMaisUsado]} transações
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{taxaAprovacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockTransacoes.filter(t => t.status === 'aprovado').length} aprovadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
            <CardDescription>Distribuição por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={metodosChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {metodosChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Volume de Pagamentos</CardTitle>
            <CardDescription>Por dia (últimos 7 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                  }
                />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Exportação */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por paciente..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <Select value={filterMetodo} onValueChange={setFilterMetodo}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Métodos</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Todas as transações processadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransacoes.map((transacao) => (
                  <TableRow key={transacao.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(transacao.data, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{transacao.paciente}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transacao.metodo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transacao.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
