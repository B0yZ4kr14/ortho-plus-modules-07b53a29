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
import { toast } from 'sonner';

export default function EstoquePedidos() {
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
        toast.success('Configuração atualizada com sucesso!');
      } else {
        await addPedidoConfig(data);
        toast.success('Configuração criada com sucesso!');
      }
      setShowConfigForm(false);
      setSelectedConfig(undefined);
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleGerarPedidos = async () => {
    setGeneratingOrders(true);
    try {
      await gerarPedidosAutomaticos();
      toast.success('Pedidos automáticos gerados com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar pedidos automáticos');
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
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
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
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Nenhuma configuração de pedido automático encontrada
                    </p>
                    <Button onClick={handleNewConfig}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Configuração
                    </Button>
                  </Card>
                ) : (
                  pedidosConfig.map((config) => {
                    const produto = produtos.find(p => p.id === config.produtoId);
                    return (
                      <Card key={config.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{produto?.nome || 'Produto não encontrado'}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Ponto de pedido: {config.pontoPedido} unidades</p>
                              <p>Quantidade de reposição: {config.quantidadeReposicao} unidades</p>
                              <p>Prazo de entrega: {config.diasEntregaEstimados} dias</p>
                              <p>Status: {config.gerarAutomaticamente ? 'Ativo' : 'Inativo'}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditConfig(config)}
                          >
                            Editar
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <PedidoConfigForm
              produtos={produtos}
              config={selectedConfig}
              onSubmit={handleSubmitConfig}
              onCancel={handleCancelForm}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}