import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { ClipboardList, Plus, AlertCircle } from 'lucide-react';
import { useEstoqueStore } from '@/modules/estoque/hooks/useEstoqueStore';
import { RequisicaoForm } from '@/modules/estoque/components/RequisicaoForm';
import { RequisicoesList } from '@/modules/estoque/components/RequisicoesList';
import { AlertasEstoque } from '@/modules/estoque/components/AlertasEstoque';
import { toast } from 'sonner';
import type { Requisicao } from '@/modules/estoque/types/estoque.types';

export default function EstoqueRequisicoes() {
  const {
    produtos,
    requisicoes,
    alertas,
    addRequisicao,
    aprovarRequisicao,
    rejeitarRequisicao,
    marcarAlertaComoLido,
    limparAlertasLidos,
  } = useEstoqueStore();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const currentUser = 'Usuário Atual'; // TODO: Integrar com sistema de autenticação
  const isAdmin = true; // TODO: Integrar com sistema de roles

  const handleSubmit = (data: Requisicao) => {
    addRequisicao(data);
    toast.success('Requisição enviada com sucesso!');
    setShowForm(false);
  };

  const handleAprovar = (id: string) => {
    aprovarRequisicao(id, currentUser);
    toast.success('Requisição aprovada!');
  };

  const handleRejeitar = () => {
    if (!rejectDialog.id) return;
    rejeitarRequisicao(rejectDialog.id, 'Requisição rejeitada pelo gestor');
    toast.success('Requisição rejeitada');
    setRejectDialog({ open: false, id: null });
  };

  const requisicoesPendentes = requisicoes.filter(r => r.status === 'PENDENTE');
  const requisicoesAprovadas = requisicoes.filter(r => r.status === 'APROVADA' || r.status === 'ENTREGUE');
  const requisicoesRejeitadas = requisicoes.filter(r => r.status === 'REJEITADA');

  const filteredRequisicoes = (lista: Requisicao[]) => 
    lista.filter(r => {
      const produto = produtos.find(p => p.id === r.produtoId);
      return produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
             r.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const alertasNaoLidos = alertas.filter(a => !a.lido);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Requisições de Estoque"
        description="Gerencie solicitações e aprovações de produtos"
      />

      {alertasNaoLidos.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-orange-900">
                {alertasNaoLidos.length} Alerta{alertasNaoLidos.length !== 1 ? 's' : ''} de Estoque
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições Pendentes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requisicoesPendentes.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requisicoesAprovadas.length}</div>
            <p className="text-xs text-muted-foreground">
              Aprovadas e entregues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertasNaoLidos.length}</div>
            <p className="text-xs text-muted-foreground">
              Produtos em alerta
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pendentes">
              Pendentes ({requisicoesPendentes.length})
            </TabsTrigger>
            <TabsTrigger value="aprovadas">
              Aprovadas ({requisicoesAprovadas.length})
            </TabsTrigger>
            <TabsTrigger value="rejeitadas">
              Rejeitadas ({requisicoesRejeitadas.length})
            </TabsTrigger>
            <TabsTrigger value="alertas">
              Alertas ({alertasNaoLidos.length})
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Requisição
          </Button>
        </div>

        <TabsContent value="pendentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisições Pendentes</CardTitle>
              <CardDescription>
                Requisições aguardando aprovação do gestor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar requisições..."
                />
                <RequisicoesList
                  requisicoes={filteredRequisicoes(requisicoesPendentes)}
                  produtos={produtos}
                  canApprove={isAdmin}
                  onAprovar={handleAprovar}
                  onRejeitar={(id) => setRejectDialog({ open: true, id })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprovadas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisições Aprovadas</CardTitle>
              <CardDescription>
                Histórico de requisições aprovadas e entregues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar requisições..."
                />
                <RequisicoesList
                  requisicoes={filteredRequisicoes(requisicoesAprovadas)}
                  produtos={produtos}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejeitadas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisições Rejeitadas</CardTitle>
              <CardDescription>
                Histórico de requisições rejeitadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar requisições..."
                />
                <RequisicoesList
                  requisicoes={filteredRequisicoes(requisicoesRejeitadas)}
                  produtos={produtos}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Estoque</CardTitle>
              <CardDescription>
                Produtos com estoque mínimo e sugestões de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertasEstoque
                alertas={alertas}
                produtos={produtos}
                onMarcarLido={marcarAlertaComoLido}
                onLimparLidos={limparAlertasLidos}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Requisição de Estoque</DialogTitle>
          </DialogHeader>
          <RequisicaoForm
            produtos={produtos}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Requisição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar esta requisição? O solicitante será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejeitar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
