import { useState } from 'react';
import { useOrcamentos } from '../../presentation/hooks/useOrcamentos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function OrcamentosPage() {
  const {
    orcamentos,
    loading,
    enviarOrcamento,
    aprovarOrcamento,
    orcamentosRascunho,
    orcamentosPendentes,
    orcamentosAprovados,
    totalOrcamentos,
    totalValor,
  } = useOrcamentos();

  const handleEnviar = async (id: string) => {
    try {
      await enviarOrcamento(id);
      toast.success('Orçamento enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar orçamento');
    }
  };

  const handleAprovar = async (id: string) => {
    try {
      await aprovarOrcamento(id);
      toast.success('Orçamento aprovado!');
    } catch (error) {
      toast.error('Erro ao aprovar orçamento');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      RASCUNHO: { variant: 'secondary', icon: FileText },
      PENDENTE: { variant: 'default', icon: Clock },
      APROVADO: { variant: 'default', icon: CheckCircle },
      REJEITADO: { variant: 'destructive', icon: XCircle },
      EXPIRADO: { variant: 'destructive', icon: XCircle },
    };
    const { variant, icon: Icon } = variants[status] || variants.RASCUNHO;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie orçamentos e propostas para seus pacientes
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrcamentos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{orcamentosPendentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{orcamentosAprovados.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValor)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="rascunho">Rascunhos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {orcamentos.map((orcamento) => (
            <Card key={orcamento.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{orcamento.titulo}</CardTitle>
                    <CardDescription>{orcamento.numeroOrcamento}</CardDescription>
                  </div>
                  {getStatusBadge(orcamento.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(orcamento.valorTotal)}</p>
                  </div>
                  <div className="space-x-2">
                    {orcamento.isDraft() && (
                      <Button onClick={() => handleEnviar(orcamento.id)}>Enviar</Button>
                    )}
                    {orcamento.isPending() && (
                      <Button onClick={() => handleAprovar(orcamento.id)}>Aprovar</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rascunho" className="space-y-4">
          {orcamentosRascunho.map((orcamento) => (
            <Card key={orcamento.id}>
              <CardHeader>
                <CardTitle>{orcamento.titulo}</CardTitle>
                <CardDescription>{orcamento.numeroOrcamento}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{formatCurrency(orcamento.valorTotal)}</p>
                  <Button onClick={() => handleEnviar(orcamento.id)}>Enviar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pendente" className="space-y-4">
          {orcamentosPendentes.map((orcamento) => (
            <Card key={orcamento.id}>
              <CardHeader>
                <CardTitle>{orcamento.titulo}</CardTitle>
                <CardDescription>{orcamento.numeroOrcamento}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{formatCurrency(orcamento.valorTotal)}</p>
                  <Button onClick={() => handleAprovar(orcamento.id)}>Aprovar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="aprovado" className="space-y-4">
          {orcamentosAprovados.map((orcamento) => (
            <Card key={orcamento.id}>
              <CardHeader>
                <CardTitle>{orcamento.titulo}</CardTitle>
                <CardDescription>{orcamento.numeroOrcamento}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(orcamento.valorTotal)}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
