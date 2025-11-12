import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Plus, Search, Filter, Download, Calendar, AlertCircle, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinanceiroSupabase } from '@/modules/financeiro/hooks/useFinanceiroSupabase';
import { PaymentDialog } from '@/components/financeiro/PaymentDialog';
import type { ContaReceber } from '@/modules/financeiro/types/financeiro-completo.types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function ContasReceber() {
  const { contasReceber, loading, addContaReceber } = useFinanceiroSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    patient_name: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    parcelas: '1',
    observacoes: '',
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> = {
      pago: { label: 'Pago', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      atrasado: { label: 'Atrasado', variant: 'error' },
      parcial: { label: 'Pagamento Parcial', variant: 'secondary' },
      cancelado: { label: 'Cancelado', variant: 'secondary' },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Filtros
  const filteredContas = useMemo(() => {
    return contasReceber.filter((conta) => {
      const matchesSearch =
        conta.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conta.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'todas' || conta.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [contasReceber, searchTerm, filterStatus]);

  // KPIs
  const totalReceber = contasReceber
    .filter((c) => c.status !== 'pago' && c.status !== 'cancelado')
    .reduce((sum, c) => sum + (c.valor - (c.valor_pago || 0)), 0);

  const totalAtrasado = contasReceber
    .filter((c) => c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalRecebido = contasReceber
    .filter((c) => c.status === 'pago')
    .reduce((sum, c) => sum + (c.valor_pago || c.valor), 0);

  // Dados do gráfico (Recebido x Aberto)
  const chartData = [
    { name: 'Recebido', value: totalRecebido, color: 'hsl(var(--success))' },
    { name: 'Em Aberto', value: totalReceber, color: 'hsl(var(--warning))' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addContaReceber({
        patient_name: formData.patient_name,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data_vencimento: formData.data_vencimento,
        status: 'pendente',
        parcelas: parseInt(formData.parcelas),
        parcela_atual: 1,
        observacoes: formData.observacoes,
      } as any);
      setDialogOpen(false);
      setFormData({
        patient_name: '',
        descricao: '',
        valor: '',
        data_vencimento: '',
        parcelas: '1',
        observacoes: '',
      });
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    }
  };

  const handleOpenPayment = (conta: ContaReceber) => {
    setSelectedConta(conta);
    setPaymentDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando contas a receber...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader icon={DollarSign} title="Contas a Receber" description="Gerencie pagamentos de pacientes e cobranças" />

      {/* KPIs + Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total a Receber
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceber)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasReceber.filter((c) => c.status !== 'pago' && c.status !== 'cancelado').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Atrasados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAtrasado)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasReceber.filter((c) => c.status === 'atrasado').length} contas vencidas
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Recebido (Mês)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecebido)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{contasReceber.filter((c) => c.status === 'pago').length} contas quitadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Recebido x Aberto */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Recebido vs Em Aberto</CardTitle>
          <CardDescription>Visão geral do status de recebimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por cliente ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="atrasado">Atrasadas</SelectItem>
                  <SelectItem value="pago">Pagas</SelectItem>
                  <SelectItem value="parcial">Pagamento Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="elevated" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Conta a Receber
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Receber</DialogTitle>
                    <DialogDescription>Registre um novo recebimento de paciente</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient_name">Cliente/Paciente *</Label>
                        <Input
                          id="patient_name"
                          placeholder="Nome do paciente"
                          value={formData.patient_name}
                          onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor Total *</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.valor}
                          onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Input
                          id="descricao"
                          placeholder="Descrição do serviço"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                        <Input
                          id="data_vencimento"
                          type="date"
                          value={formData.data_vencimento}
                          onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parcelas">Parcelas</Label>
                        <Input
                          id="parcelas"
                          type="number"
                          placeholder="1"
                          value={formData.parcelas}
                          onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Input
                          id="observacoes"
                          placeholder="Informações adicionais"
                          value={formData.observacoes}
                          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" variant="elevated">
                        Salvar
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Contas */}
      <Card variant="elevated">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhuma conta encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredContas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.patient_name}</TableCell>
                  <TableCell>{conta.descricao}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                    {conta.valor_pago && conta.valor_pago > 0 && conta.valor_pago < conta.valor && (
                      <div className="text-xs text-muted-foreground">
                        Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor_pago)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(conta.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell className="text-right">
                    {conta.status !== 'pago' && conta.status !== 'cancelado' && (
                      <Button variant="elevated" size="sm" className="gap-2" onClick={() => handleOpenPayment(conta)}>
                        <CreditCard className="h-4 w-4" />
                        Receber
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Payment Dialog */}
      {selectedConta && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setSelectedConta(null);
          }}
          conta={selectedConta}
          onSuccess={() => {
            setPaymentDialogOpen(false);
            setSelectedConta(null);
          }}
        />
      )}
    </div>
  );
}
