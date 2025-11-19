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

export default function EstoqueMovimentacoesPage() {
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

  const currentUser = 'Usuário Atual';

  const handleSubmit = async (data: Movimentacao) => {
    try {
      await addMovimentacao(data);
      toast({ title: 'Sucesso', description: 'Movimentação registrada com sucesso!' });
      setShowForm(false);
    } catch (error) {
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
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesEntrada.length}</div>
            <p className="text-xs text-success">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas)}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesSaida.length}</div>
            <p className="text-xs text-destructive">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaidas)}
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoesAjuste.length}</div>
            <p className="text-xs text-muted-foreground">
              Correções de inventário
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4 flex-1">
          <SearchInput
            placeholder="Buscar por produto ou motivo..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-sm"
          />
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os tipos</SelectItem>
              <SelectItem value="ENTRADA">Entradas</SelectItem>
              <SelectItem value="SAIDA">Saídas</SelectItem>
              <SelectItem value="DEVOLUCAO">Devoluções</SelectItem>
              <SelectItem value="PERDA">Perdas</SelectItem>
              <SelectItem value="AJUSTE">Ajustes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      <Tabs defaultValue="entradas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entradas">
            <TrendingUp className="h-4 w-4 mr-2" />
            Entradas ({movimentacoesEntrada.length})
          </TabsTrigger>
          <TabsTrigger value="saidas">
            <TrendingDown className="h-4 w-4 mr-2" />
            Saídas ({movimentacoesSaida.length})
          </TabsTrigger>
          <TabsTrigger value="ajustes">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Ajustes ({movimentacoesAjuste.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entradas">
          <MovimentacoesList
            movimentacoes={filteredMovimentacoes(movimentacoesEntrada)}
            produtos={produtos}
            fornecedores={fornecedores}
          />
        </TabsContent>

        <TabsContent value="saidas">
          <MovimentacoesList
            movimentacoes={filteredMovimentacoes(movimentacoesSaida)}
            produtos={produtos}
            fornecedores={fornecedores}
          />
        </TabsContent>

        <TabsContent value="ajustes">
          <MovimentacoesList
            movimentacoes={filteredMovimentacoes(movimentacoesAjuste)}
            produtos={produtos}
            fornecedores={fornecedores}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
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
