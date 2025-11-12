import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Webhook, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Send,
  RefreshCw
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date.utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function EstoqueIntegracoes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalPedidos: 0,
    pedidosEnviados: 0,
    pedidosConfirmados: 0,
    pedidosFalhos: 0,
    taxaSucesso: 0,
    tempoMedioResposta: 0,
  });
  const [testingAPI, setTestingAPI] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar fornecedores com API habilitada
      const fornecedoresResult = await (supabase as any)
        .from('estoque_fornecedores')
        .select('*')
        .eq('api_enabled', true)
        .order('nome');

      if (fornecedoresResult.error) throw fornecedoresResult.error;

      // Buscar pedidos automáticos  
      const pedidosResult = await (supabase as any)
        .from('estoque_pedidos')
        .select('*')
        .eq('tipo', 'AUTOMATICO')
        .order('created_at', { ascending: false })
        .limit(100);

      if (pedidosResult.error) throw pedidosResult.error;

      setFornecedores(fornecedoresResult.data || []);
      setPedidos(pedidosResult.data || []);

      // Calcular métricas
      const total = pedidosResult.data?.length || 0;
      const enviados = pedidosResult.data?.filter((p: any) => p.status === 'enviado' || p.status === 'confirmado').length || 0;
      const confirmados = pedidosResult.data?.filter((p: any) => p.status === 'confirmado').length || 0;
      const falhos = pedidosResult.data?.filter((p: any) => p.status === 'cancelado').length || 0;
      const taxaSucesso = total > 0 ? (confirmados / total) * 100 : 0;

      // Calcular tempo médio de resposta (mock - deveria vir dos logs)
      const tempoMedio = 2.5; // segundos

      setMetrics({
        totalPedidos: total,
        pedidosEnviados: enviados,
        pedidosConfirmados: confirmados,
        pedidosFalhos: falhos,
        taxaSucesso,
        tempoMedioResposta: tempoMedio,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as informações de integração',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestarAPI = async (fornecedorId: string) => {
    try {
      setTestingAPI(fornecedorId);
      
      const { data, error } = await supabase.functions.invoke('enviar-pedido-automatico-api', {
        body: { fornecedor_id: fornecedorId }
      });

      if (error) throw error;

      toast({
        title: 'Teste concluído',
        description: data.message || 'Pedido de teste enviado com sucesso',
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao testar API:', error);
      toast({
        title: 'Erro no teste',
        description: error.message || 'Não foi possível testar a API',
        variant: 'destructive',
      });
    } finally {
      setTestingAPI(null);
    }
  };

  const handleDisparaPedidosAutomaticos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('enviar-pedido-automatico-api');

      if (error) throw error;

      toast({
        title: 'Pedidos enviados',
        description: data.message || 'Pedidos automáticos processados com sucesso',
      });

      loadData();
    } catch (error: any) {
      console.error('Erro ao disparar pedidos:', error);
      toast({
        title: 'Erro ao disparar pedidos',
        description: error.message || 'Não foi possível processar os pedidos automáticos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráficos
  const statusData = [
    { name: 'Enviados', value: metrics.pedidosEnviados, color: '#3b82f6' },
    { name: 'Confirmados', value: metrics.pedidosConfirmados, color: '#10b981' },
    { name: 'Falhos', value: metrics.pedidosFalhos, color: '#ef4444' },
  ];

  const historicoData = pedidos.slice(0, 10).map(p => ({
    data: formatDate(p.created_at, 'dd/MM'),
    enviados: p.status === 'enviado' || p.status === 'confirmado' ? 1 : 0,
    falhos: p.status === 'cancelado' ? 1 : 0,
  })).reverse();

  if (loading && fornecedores.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando integrações...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={Webhook}
        title="Monitoramento de Integrações"
        description="Acompanhe o status das integrações com APIs de fornecedores e pedidos automáticos"
      />

      {/* Ações rápidas */}
      <div className="flex gap-3">
        <Button onClick={handleDisparaPedidosAutomaticos} disabled={loading}>
          <Send className="mr-2 h-4 w-4" />
          Disparar Pedidos Automáticos
        </Button>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPedidos}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos automáticos enviados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            {metrics.taxaSucesso >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.taxaSucesso.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.pedidosConfirmados} de {metrics.totalPedidos} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tempoMedioResposta}s</div>
            <p className="text-xs text-muted-foreground mt-1">Tempo de resposta da API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Falhos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.pedidosFalhos}</div>
            <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Status dos pedidos automáticos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Envios</CardTitle>
            <CardDescription>Últimos 10 pedidos processados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enviados" fill="#10b981" name="Enviados" />
                <Bar dataKey="falhos" fill="#ef4444" name="Falhos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de fornecedores com API */}
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores com API Integrada</CardTitle>
          <CardDescription>
            Status das integrações configuradas ({fornecedores.length} fornecedores)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fornecedores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum fornecedor com API configurada</p>
                <p className="text-sm mt-2">Configure APIs de fornecedores em Cadastros</p>
              </div>
            ) : (
              fornecedores.map((fornecedor) => {
                const pedidosFornecedor = pedidos.filter(
                  p => p.estoque_fornecedores?.id === fornecedor.id
                );
                const sucessoFornecedor = pedidosFornecedor.filter(
                  p => p.status === 'confirmado'
                ).length;
                const taxaSucessoFornecedor = pedidosFornecedor.length > 0
                  ? (sucessoFornecedor / pedidosFornecedor.length) * 100
                  : 0;

                return (
                  <div
                    key={fornecedor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{fornecedor.nome}</h3>
                        {fornecedor.api_enabled && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            API Ativa
                          </Badge>
                        )}
                        {fornecedor.auto_order_enabled && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                            Pedidos Automáticos
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Endpoint:</span>{' '}
                          <span className="text-xs">{fornecedor.api_endpoint || 'Não configurado'}</span>
                        </div>
                        <div>
                          <span className="font-medium">Auth:</span> {fornecedor.api_auth_type || 'none'}
                        </div>
                        <div>
                          <span className="font-medium">Taxa Sucesso:</span>{' '}
                          <span className={taxaSucessoFornecedor >= 80 ? 'text-green-600' : 'text-red-600'}>
                            {taxaSucessoFornecedor.toFixed(1)}%
                          </span>{' '}
                          ({sucessoFornecedor}/{pedidosFornecedor.length})
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestarAPI(fornecedor.id)}
                      disabled={testingAPI === fornecedor.id}
                    >
                      {testingAPI === fornecedor.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Testar API
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de pedidos recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos Recentes</CardTitle>
          <CardDescription>Últimos pedidos automáticos processados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pedidos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido automático encontrado</p>
              </div>
            ) : (
              pedidos.slice(0, 10).map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {pedido.status === 'confirmado' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : pedido.status === 'enviado' ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{pedido.numero_pedido}</p>
                      <p className="text-sm text-muted-foreground">
                        {pedido.estoque_fornecedores?.nome} • {formatDate(pedido.created_at, 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        pedido.status === 'confirmado'
                          ? 'default'
                          : pedido.status === 'enviado'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {pedido.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {Number(pedido.valor_total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
