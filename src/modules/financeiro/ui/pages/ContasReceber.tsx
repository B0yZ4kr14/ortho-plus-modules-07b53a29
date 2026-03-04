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
import { DollarSign, Plus, Search, Filter, Download, Calendar, AlertCircle, CheckCircle2, Clock, CreditCard, Mail, Send } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinanceiroSupabase } from '@/modules/financeiro/application/hooks/useFinanceiroSupabase';
import { PaymentDialog } from '@/components/financeiro/PaymentDialog';
import type { ContaReceber } from '@/modules/financeiro/types/financeiro-completo.types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ContasReceber() {
  const { contasReceber, loading, addContaReceber } = useFinanceiroSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [filterPeriodo, setFilterPeriodo] = useState('mes-atual');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [sendingCobranca, setSendingCobranca] = useState<string | null>(null);

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
      
      // Filtro de período
      const dataVencimento = new Date(conta.data_vencimento);
      let matchesPeriodo = true;
      
      if (filterPeriodo === 'mes-atual') {
        const inicio = startOfMonth(new Date());
        const fim = endOfMonth(new Date());
        matchesPeriodo = dataVencimento >= inicio && dataVencimento <= fim;
      } else if (filterPeriodo === '30-dias') {
        const inicio = subDays(new Date(), 30);
        matchesPeriodo = dataVencimento >= inicio;
      } else if (filterPeriodo === 'trimestre') {
        const inicio = subMonths(new Date(), 3);
        matchesPeriodo = dataVencimento >= inicio;
      }
      
      return matchesSearch && matchesStatus && matchesPeriodo;
    });
  }, [contasReceber, searchTerm, filterStatus, filterPeriodo]);

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

  const handleEnviarCobranca = async (contaId: string, tipo: 'EMAIL' | 'WHATSAPP') => {
    try {
      setSendingCobranca(contaId);
      const { error } = await supabase.functions.invoke('enviar-cobranca', {
        body: { cobrancaId: contaId, tipo },
      });

      if (error) throw error;

      toast.success(`Cobrança enviada via ${tipo} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao enviar cobrança:', error);
      toast.error(error.message || 'Erro ao enviar cobrança');
    } finally {
      setSendingCobranca(null);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Contas a Receber', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Período: ${filterPeriodo}`, 14, 32);
    doc.text(`Total a Receber: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceber)}`, 14, 40);
    
    let y = 50;
    filteredContas.forEach((conta, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(
        `${index + 1}. ${conta.patient_name} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)} - ${conta.status}`,
        14,
        y
      );
      y += 10;
    });
    
    doc.save(`contas-receber-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const exportarExcel = () => {
    const data = filteredContas.map(conta => ({
      'Cliente': conta.patient_name,
      'Descrição': conta.descricao,
      'Valor': conta.valor,
      'Vencimento': format(new Date(conta.data_vencimento), 'dd/MM/yyyy'),
      'Status': conta.status,
      'Valor Pago': conta.valor_pago || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contas a Receber');
    
    XLSX.writeFile(wb, `contas-receber-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel exportado com sucesso!');
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
              
              <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-atual">Mês Atual</SelectItem>
                  <SelectItem value="30-dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Select onValueChange={(value) => value === 'pdf' ? exportarPDF() : exportarExcel()}>
                <SelectTrigger className="w-[150px]">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Exportar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">Exportar PDF</SelectItem>
                  <SelectItem value="excel">Exportar Excel</SelectItem>
                </SelectContent>
              </Select>
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
                    <div className="flex gap-2 justify-end">
                      {conta.status === 'atrasado' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEnviarCobranca(conta.id, 'EMAIL')}
                            disabled={sendingCobranca === conta.id}
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleEnviarCobranca(conta.id, 'WHATSAPP')}
                            disabled={sendingCobranca === conta.id}
                          >
                            <Send className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        </>
                      )}
                      {conta.status !== 'pago' && conta.status !== 'cancelado' && (
                        <Button variant="elevated" size="sm" className="gap-2" onClick={() => handleOpenPayment(conta)}>
                          <CreditCard className="h-4 w-4" />
                          Receber
                        </Button>
                      )}
                    </div>
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
