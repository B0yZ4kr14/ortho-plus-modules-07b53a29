import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, ArrowRightLeft, Plus } from 'lucide-react';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { MovimentacaoForm } from '@/modules/estoque/components/MovimentacaoForm';
import { MovimentacoesList } from '@/modules/estoque/components/MovimentacoesList';
import { useToast } from '@/hooks/use-toast';
import type { Movimentacao } from '@/modules/estoque/types/estoque.types';

export default function EstoqueMovimentacoes() {
  const { toast } = useToast();
  const {
    produtos,
    fornecedores,
    movimentacoes,
    loading,
    addMovimentacao,
  } = useEstoqueSupabase();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('TODOS');

  const currentUser = 'Usuário Atual'; // TODO: Integrar com sistema de autenticação

  const handleSubmit = async (data: Movimentacao) => {
    try {
      await addMovimentacao(data);
      toast({ title: 'Sucesso', description: 'Movimentação registrada com sucesso!' });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast({ title: 'Erro', description: 'Erro ao registrar movimentação', variant: 'destructive' });
    }
  };

  const movimentacoesEntrada = movimentacoes.filter(m => m.tipo === 'ENTRADA' || m.tipo === 'DEVOLUCAO');
  const movimentacoesSaida = movimentacoes.filter(m => m.tipo === 'SAIDA' || m.tipo === 'PERDA');
  const movimentacoesAjuste = movimentacoes.filter(m => m.tipo === 'AJUSTE');

  const filteredMovimentacoes = (lista: Movimentacao[]) => {
    return lista.filter(m => {
      const produto = produtos.find(p => p.id === m.produtoId);
      const matchSearch = produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchTipo = tipoFiltro === 'TODOS' || m.tipo === tipoFiltro;
      
      return matchSearch && matchTipo;
    });
  };

  const totalEntradas = movimentacoesEntrada.reduce((sum, m) => sum + (m.valorTotal || 0), 0);
  const totalSaidas = movimentacoesSaida.reduce((sum, m) => sum + (m.valorTotal || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={ArrowRightLeft}
          title="Movimentações de Estoque"
          description="Histórico completo de entradas, saídas e ajustes de inventário"
        />
        <LoadingState variant="spinner" size="lg" message="Carregando movimentações..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ArrowRightLeft}
        title="Movimentações de Estoque"
        description="Histórico completo de entradas, saídas e ajustes de inventário"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoes.length}</div>
            <p className="text-xs text-muted-foreground">
              Todas as operações
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesEntrada.length}</div>
            <p className="text-xs text-muted-foreground">
              R$ {totalEntradas.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesSaida.length}</div>
            <p className="text-xs text-muted-foreground">
              R$ {totalSaidas.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesAjuste.length}</div>
            <p className="text-xs text-muted-foreground">
              Correções de inventário
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="todas">
              Todas ({movimentacoes.length})
            </TabsTrigger>
            <TabsTrigger value="entradas">
              Entradas ({movimentacoesEntrada.length})
            </TabsTrigger>
            <TabsTrigger value="saidas">
              Saídas ({movimentacoesSaida.length})
            </TabsTrigger>
            <TabsTrigger value="ajustes">
              Ajustes ({movimentacoesAjuste.length})
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowForm(true)} className="hover-scale">
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>
                  Rastreamento completo de todas as operações de estoque
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Buscar por produto ou motivo..."
                  />
                </div>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os tipos</SelectItem>
                    <SelectItem value="ENTRADA">Entradas</SelectItem>
                    <SelectItem value="SAIDA">Saídas</SelectItem>
                    <SelectItem value="AJUSTE">Ajustes</SelectItem>
                    <SelectItem value="DEVOLUCAO">Devoluções</SelectItem>
                    <SelectItem value="PERDA">Perdas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="todas" className="mt-0">
                <MovimentacoesList
                  movimentacoes={filteredMovimentacoes(movimentacoes)}
                  produtos={produtos}
                  fornecedores={fornecedores}
                />
              </TabsContent>

              <TabsContent value="entradas" className="mt-0">
                <MovimentacoesList
                  movimentacoes={filteredMovimentacoes(movimentacoesEntrada)}
                  produtos={produtos}
                  fornecedores={fornecedores}
                />
              </TabsContent>

              <TabsContent value="saidas" className="mt-0">
                <MovimentacoesList
                  movimentacoes={filteredMovimentacoes(movimentacoesSaida)}
                  produtos={produtos}
                  fornecedores={fornecedores}
                />
              </TabsContent>

              <TabsContent value="ajustes" className="mt-0">
                <MovimentacoesList
                  movimentacoes={filteredMovimentacoes(movimentacoesAjuste)}
                  produtos={produtos}
                  fornecedores={fornecedores}
                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
          </DialogHeader>
          <MovimentacaoForm
            produtos={produtos}
            fornecedores={fornecedores}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
