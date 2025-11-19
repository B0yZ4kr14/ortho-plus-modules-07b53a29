import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { ClipboardList, Plus, AlertCircle } from 'lucide-react';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { RequisicaoForm } from '@/modules/estoque/components/RequisicaoForm';
import { RequisicoesList } from '@/modules/estoque/components/RequisicoesList';
import { AlertasEstoque } from '@/modules/estoque/components/AlertasEstoque';
import { useToast } from '@/hooks/use-toast';
import type { Requisicao } from '@/modules/estoque/types/estoque.types';

export default function EstoqueRequisicoesPage() {
  const { toast } = useToast();
  const {
    produtos,
    requisicoes,
    alertas,
    loading,
    addRequisicao,
    aprovarRequisicao,
    rejeitarRequisicao,
    marcarAlertaComoLido,
    limparAlertasLidos,
  } = useEstoqueSupabase();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const currentUser = 'Usuário Atual';
  const isAdmin = true;

  const handleSubmit = async (data: Requisicao) => {
    try {
      await addRequisicao(data);
      toast({ title: 'Sucesso', description: 'Requisição enviada com sucesso!' });
      setShowForm(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar requisição', variant: 'destructive' });
    }
  };

  const handleAprovar = async (id: string) => {
    try {
      await aprovarRequisicao(id, currentUser);
      toast({ title: 'Sucesso', description: 'Requisição aprovada!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao aprovar requisição', variant: 'destructive' });
    }
  };

  const handleRejeitar = async () => {
    if (!rejectDialog.id) return;
    try {
      await rejeitarRequisicao(rejectDialog.id, 'Requisição rejeitada pelo gestor');
      toast({ title: 'Sucesso', description: 'Requisição rejeitada' });
      setRejectDialog({ open: false, id: null });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao rejeitar requisição', variant: 'destructive' });
    }
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
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Alertas de Estoque ({alertasNaoLidos.length})
            </CardTitle>
            <CardDescription>
              Produtos com estoque baixo ou outras notificações importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertasEstoque
              alertas={alertasNaoLidos}
              produtos={produtos}
              onMarcarLido={marcarAlertaComoLido}
              onLimparLidos={limparAlertasLidos}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{requisicoesPendentes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{requisicoesAprovadas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Aprovadas e entregues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{requisicoesRejeitadas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Não aprovadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center gap-4">
        <SearchInput
          placeholder="Buscar por produto ou motivo..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="max-w-sm"
        />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
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
        </TabsList>

        <TabsContent value="pendentes">
          <RequisicoesList
            requisicoes={filteredRequisicoes(requisicoesPendentes)}
            produtos={produtos}
            onAprovar={isAdmin ? handleAprovar : undefined}
            onRejeitar={isAdmin ? (id) => setRejectDialog({ open: true, id }) : undefined}
          />
        </TabsContent>

        <TabsContent value="aprovadas">
          <RequisicoesList
            requisicoes={filteredRequisicoes(requisicoesAprovadas)}
            produtos={produtos}
          />
        </TabsContent>

        <TabsContent value="rejeitadas">
          <RequisicoesList
            requisicoes={filteredRequisicoes(requisicoesRejeitadas)}
            produtos={produtos}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Requisição</DialogTitle>
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
            <AlertDialogTitle>Confirmar rejeição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar esta requisição?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectDialog({ open: false, id: null })}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRejeitar}>
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
