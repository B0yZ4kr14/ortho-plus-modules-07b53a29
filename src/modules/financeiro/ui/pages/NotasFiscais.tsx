import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Filter, Download, Send, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotaFiscal {
  id: string;
  numero: string;
  serie: string;
  tipo: 'NFe' | 'NFSe';
  cliente: string;
  cpfCnpj: string;
  valor: number;
  dataEmissao: Date;
  status: 'emitida' | 'pendente' | 'cancelada' | 'enviada';
  chaveAcesso?: string;
  protocolo?: string;
  servicos: string[];
}

export default function NotasFiscais() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data
  const notasFiscais: NotaFiscal[] = [
    {
      id: '1',
      numero: '000001',
      serie: '1',
      tipo: 'NFSe',
      cliente: 'João Silva',
      cpfCnpj: '123.456.789-00',
      valor: 450.00,
      dataEmissao: new Date('2024-01-10'),
      status: 'emitida',
      chaveAcesso: '35240112345678000190650010000000011234567890',
      protocolo: '135240000000001',
      servicos: ['Consulta Ortodôntica', 'Manutenção Aparelho'],
    },
    {
      id: '2',
      numero: '000002',
      serie: '1',
      tipo: 'NFe',
      cliente: 'Maria Santos',
      cpfCnpj: '987.654.321-00',
      valor: 3500.00,
      dataEmissao: new Date('2024-01-12'),
      status: 'enviada',
      chaveAcesso: '35240112345678000190550010000000021234567891',
      protocolo: '135240000000002',
      servicos: ['Implante Dentário'],
    },
    {
      id: '3',
      numero: '000003',
      serie: '1',
      tipo: 'NFSe',
      cliente: 'Carlos Oliveira',
      cpfCnpj: '111.222.333-44',
      valor: 800.00,
      dataEmissao: new Date('2024-01-15'),
      status: 'pendente',
      servicos: ['Clareamento Dental'],
    },
    {
      id: '4',
      numero: '000004',
      serie: '1',
      tipo: 'NFSe',
      cliente: 'Ana Costa',
      cpfCnpj: '555.666.777-88',
      valor: 1200.00,
      dataEmissao: new Date('2024-01-08'),
      status: 'cancelada',
      chaveAcesso: '35240112345678000190650010000000041234567893',
      servicos: ['Tratamento de Canal'],
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> = {
      emitida: { label: 'Emitida', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      cancelada: { label: 'Cancelada', variant: 'error' },
      enviada: { label: 'Enviada ao Cliente', variant: 'secondary' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      'NFe': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      'NFSe': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    };
    return (
      <Badge variant="outline" className={colors[tipo]}>
        {tipo}
      </Badge>
    );
  };

  const totalEmitido = notasFiscais
    .filter(n => n.status === 'emitida' || n.status === 'enviada')
    .reduce((sum, n) => sum + n.valor, 0);

  const totalPendente = notasFiscais
    .filter(n => n.status === 'pendente')
    .reduce((sum, n) => sum + n.valor, 0);

  return (
    <div className="flex-1 space-y-8 p-8">
      <PageHeader
        icon={FileText}
        title="Notas Fiscais Eletrônicas"
        description="Emita e gerencie NFe e NFSe"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Emitido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEmitido)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {notasFiscais.filter(n => n.status === 'emitida' || n.status === 'enviada').length} notas
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {notasFiscais.filter(n => n.status === 'pendente').length} notas
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              NFSe Emitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {notasFiscais.filter(n => n.tipo === 'NFSe' && n.status === 'emitida').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Este mês</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              NFe Emitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {notasFiscais.filter(n => n.tipo === 'NFe' && n.status === 'emitida').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Este mês</p>
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
                  placeholder="Buscar por cliente, número ou chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="NFe">NFe</SelectItem>
                  <SelectItem value="NFSe">NFSe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="emitida">Emitidas</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="enviada">Enviadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar XML
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="elevated" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Emitir Nota Fiscal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Emitir Nova Nota Fiscal</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para emitir NFe ou NFSe
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Nota</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NFe">NFe - Nota Fiscal Eletrônica</SelectItem>
                          <SelectItem value="NFSe">NFSe - Nota Fiscal de Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serie">Série</Label>
                      <Input id="serie" defaultValue="1" />
                    </div>

                    <div className="col-span-2 border-t pt-4">
                      <h3 className="font-semibold mb-3">Dados do Cliente</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cliente">Cliente/Paciente</Label>
                      <Input id="cliente" placeholder="Nome completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                      <Input id="cpfCnpj" placeholder="000.000.000-00" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" placeholder="Endereço completo" />
                    </div>

                    <div className="col-span-2 border-t pt-4">
                      <h3 className="font-semibold mb-3">Serviços/Produtos</h3>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição dos Serviços</Label>
                      <Input id="descricao" placeholder="Ex: Consulta Ortodôntica, Implante..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor Total</Label>
                      <Input id="valor" type="number" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigoServico">Código do Serviço</Label>
                      <Input id="codigoServico" placeholder="Ex: 4.00.00" />
                    </div>

                    <div className="col-span-2 border-t pt-4">
                      <h3 className="font-semibold mb-3">Informações Fiscais</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aliquota">Alíquota ISS (%)</Label>
                      <Input id="aliquota" type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retencao">Retenção de Impostos</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao">Não Reter</SelectItem>
                          <SelectItem value="iss">Reter ISS</SelectItem>
                          <SelectItem value="todos">Reter Todos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="elevated" onClick={() => setDialogOpen(false)}>
                      Emitir Nota Fiscal
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
          <TabsTrigger value="todas">Todas ({notasFiscais.length})</TabsTrigger>
          <TabsTrigger value="emitidas">
            Emitidas ({notasFiscais.filter(n => n.status === 'emitida').length})
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes ({notasFiscais.filter(n => n.status === 'pendente').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card variant="elevated">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasFiscais.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell className="font-medium">
                      {nota.numero}/{nota.serie}
                    </TableCell>
                    <TableCell>{getTipoBadge(nota.tipo)}</TableCell>
                    <TableCell>{nota.cliente}</TableCell>
                    <TableCell className="text-muted-foreground">{nota.cpfCnpj}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nota.valor)}
                    </TableCell>
                    <TableCell>
                      {format(nota.dataEmissao, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getStatusBadge(nota.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {nota.status === 'emitida' && (
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
