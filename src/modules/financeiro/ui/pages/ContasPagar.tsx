import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Plus, Search, Filter, Download, TrendingDown, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContaPagar {
  id: string;
  fornecedor: string;
  categoria: string;
  descricao: string;
  valor: number;
  vencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'agendado';
  formaPagamento?: string;
  dataPagamento?: Date;
  documento?: string;
  observacoes?: string;
}

export default function ContasPagar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data
  const contasPagar: ContaPagar[] = [
    {
      id: '1',
      fornecedor: 'Dental Supply Co.',
      categoria: 'Materiais Odontológicos',
      descricao: 'Compra de materiais ortodônticos',
      valor: 2500.00,
      vencimento: new Date('2024-01-25'),
      status: 'pendente',
      documento: 'NF-001234',
    },
    {
      id: '2',
      fornecedor: 'CEMIG',
      categoria: 'Contas Fixas',
      descricao: 'Conta de energia elétrica',
      valor: 850.00,
      vencimento: new Date('2024-01-15'),
      status: 'pago',
      formaPagamento: 'Débito Automático',
      dataPagamento: new Date('2024-01-15'),
      documento: 'Conta-202401',
    },
    {
      id: '3',
      fornecedor: 'Lab Próteses XYZ',
      categoria: 'Laboratório',
      descricao: 'Próteses paciente João Silva',
      valor: 1800.00,
      vencimento: new Date('2024-01-12'),
      status: 'atrasado',
      documento: 'OS-5678',
    },
    {
      id: '4',
      fornecedor: 'Conselho Regional de Odontologia',
      categoria: 'Taxas e Impostos',
      descricao: 'Anuidade CRO 2024',
      valor: 750.00,
      vencimento: new Date('2024-02-28'),
      status: 'agendado',
    },
    {
      id: '5',
      fornecedor: 'Receita Federal',
      categoria: 'Taxas e Impostos',
      descricao: 'DAS - Simples Nacional',
      valor: 1350.00,
      vencimento: new Date('2024-01-20'),
      status: 'pendente',
      documento: 'DAS-202401',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> = {
      pago: { label: 'Pago', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      atrasado: { label: 'Atrasado', variant: 'error' },
      agendado: { label: 'Agendado', variant: 'secondary' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (categoria: string) => {
    const colors: Record<string, string> = {
      'Materiais Odontológicos': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      'Contas Fixas': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      'Laboratório': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
      'Taxas e Impostos': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    };
    return (
      <Badge variant="outline" className={colors[categoria] || ''}>
        {categoria}
      </Badge>
    );
  };

  const totalPagar = contasPagar
    .filter(c => c.status !== 'pago')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalAtrasado = contasPagar
    .filter(c => c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalPago = contasPagar
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + c.valor, 0);

  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader
        icon={CreditCard}
        title="Contas a Pagar"
        description="Gerencie fornecedores, despesas e pagamentos"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total a Pagar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPagar)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasPagar.filter(c => c.status !== 'pago').length} contas pendentes
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Atrasadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAtrasado)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasPagar.filter(c => c.status === 'atrasado').length} contas vencidas
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Pago (Mês)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {contasPagar.filter(c => c.status === 'pago').length} contas quitadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por fornecedor ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                  <SelectItem value="agendado">Agendadas</SelectItem>
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
                    Nova Conta a Pagar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Pagar</DialogTitle>
                    <DialogDescription>
                      Registre uma nova despesa ou pagamento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fornecedor">Fornecedor</Label>
                      <Input id="fornecedor" placeholder="Nome do fornecedor" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="materiais">Materiais Odontológicos</SelectItem>
                          <SelectItem value="contas">Contas Fixas</SelectItem>
                          <SelectItem value="laboratorio">Laboratório</SelectItem>
                          <SelectItem value="impostos">Taxas e Impostos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input id="valor" type="number" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vencimento">Data de Vencimento</Label>
                      <Input id="vencimento" type="date" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input id="descricao" placeholder="Descrição da despesa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documento">Número do Documento</Label>
                      <Input id="documento" placeholder="NF, OS, Boleto..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="debito">Débito Automático</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="elevated" onClick={() => setDialogOpen(false)}>
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Lista */}
      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas ({contasPagar.length})</TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes ({contasPagar.filter(c => c.status === 'pendente').length})
          </TabsTrigger>
          <TabsTrigger value="atrasadas">
            Atrasadas ({contasPagar.filter(c => c.status === 'atrasado').length})
          </TabsTrigger>
          <TabsTrigger value="pagas">
            Pagas ({contasPagar.filter(c => c.status === 'pago').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card variant="elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasPagar.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                    <TableCell>{getCategoryBadge(conta.categoria)}</TableCell>
                    <TableCell>
                      {conta.descricao}
                      {conta.documento && (
                        <div className="text-xs text-muted-foreground">Doc: {conta.documento}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(conta.vencimento, 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
