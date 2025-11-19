import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Settings, Play } from 'lucide-react';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { PedidosList } from '@/modules/estoque/components/PedidosList';
import { PedidoConfigForm } from '@/modules/estoque/components/PedidoConfigForm';
import type { PedidoConfig } from '@/modules/estoque/types/estoque.types';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';

export default function EstoquePedidosPage() {
  const { toast } = useToast();
  const {
    produtos,
    fornecedores,
    pedidos,
    pedidosItens,
    pedidosConfig,
    addPedidoConfig,
    updatePedidoConfig,
    updatePedidoStatus,
    gerarPedidosAutomaticos,
    loading,
  } = useEstoqueSupabase();

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PedidoConfig | undefined>();
  const [generatingOrders, setGeneratingOrders] = useState(false);

  const handleSubmitConfig = async (data: PedidoConfig) => {
    try {
      if (selectedConfig?.id) {
        await updatePedidoConfig(selectedConfig.id, data);
        toast({ title: 'Sucesso', description: 'Configuração atualizada com sucesso!' });
      } else {
        await addPedidoConfig(data);
        toast({ title: 'Sucesso', description: 'Configuração criada com sucesso!' });
      }
      setShowConfigForm(false);
      setSelectedConfig(undefined);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar configuração', variant: 'destructive' });
    }
  };

  const handleGerarPedidos = async () => {
    setGeneratingOrders(true);
    try {
      await gerarPedidosAutomaticos();
      toast({ title: 'Sucesso', description: 'Pedidos automáticos gerados com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao gerar pedidos automáticos', variant: 'destructive' });
    } finally {
      setGeneratingOrders(false);
    }
  };

  const handleEditConfig = (config: PedidoConfig) => {
    setSelectedConfig(config);
    setShowConfigForm(true);
  };

  const handleNewConfig = () => {
    setSelectedConfig(undefined);
    setShowConfigForm(true);
  };

  const handleCancelForm = () => {
    setShowConfigForm(false);
    setSelectedConfig(undefined);
  };

  if (loading) {
    return <LoadingState variant="spinner" size="lg" message="Carregando pedidos..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Compra"
        description="Gerenciamento de pedidos e configurações de reposição automática"
        icon={Package}
      />

      <Tabs defaultValue="pedidos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pedidos">
            <Package className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configurações Automáticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleGerarPedidos} disabled={generatingOrders}>
              <Play className="h-4 w-4 mr-2" />
              {generatingOrders ? 'Gerando...' : 'Gerar Pedidos Automáticos'}
            </Button>
          </div>

          <PedidosList
            pedidos={pedidos}
            fornecedores={fornecedores}
            produtos={produtos}
            pedidosItens={pedidosItens}
            onUpdateStatus={updatePedidoStatus}
          />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {!showConfigForm ? (
            <>
              <div className="flex justify-end">
                <Button onClick={handleNewConfig}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Configuração
                </Button>
              </div>

              <div className="grid gap-4">
                {pedidosConfig.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma configuração automática</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure pedidos automáticos para reposição de estoque
                    </p>
                    <Button onClick={handleNewConfig}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Configuração
                    </Button>
                  </Card>
                ) : (
                  pedidosConfig.map(config => (
                    <Card key={config.id} className="p-6">
                      <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Configuração #{config.id}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Produto ID: {config.produtoId}
                        </p>
                      </div>
                        <Button variant="outline" size="sm" onClick={() => handleEditConfig(config)}>
                          Editar
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <Card className="p-6">
              <PedidoConfigForm
                config={selectedConfig}
                produtos={produtos}
                onSubmit={handleSubmitConfig}
                onCancel={handleCancelForm}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
