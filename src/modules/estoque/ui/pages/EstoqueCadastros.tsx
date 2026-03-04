import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchInput } from '@/components/shared/SearchInput';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { Package, Users, Building2, Plus, Scan } from 'lucide-react';
import { useEstoqueSupabase } from '@/modules/estoque/hooks/useEstoqueSupabase';
import { ProdutoForm } from '@/modules/estoque/components/ProdutoForm';
import { ProdutosList } from '@/modules/estoque/components/ProdutosList';
import { FornecedorForm } from '@/modules/estoque/components/FornecedorForm';
import { FornecedoresList } from '@/modules/estoque/components/FornecedoresList';
import { CategoriaForm } from '@/modules/estoque/components/CategoriaForm';
import { CategoriasList } from '@/modules/estoque/components/CategoriasList';
import { BarcodeScannerDialog } from '@/modules/estoque/components/BarcodeScannerDialog';
import type { Produto, Fornecedor, Categoria } from '@/modules/estoque/types/estoque.types';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'list' | 'form';

export default function EstoqueCadastros() {
  const { toast } = useToast();
  const {
    produtos,
    fornecedores,
    categorias,
    loading,
    addProduto,
    updateProduto,
    deleteProduto,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    addCategoria,
    updateCategoria,
    deleteCategoria,
  } = useEstoqueSupabase();

  const [produtoViewMode, setProdutoViewMode] = useState<ViewMode>('list');
  const [fornecedorViewMode, setFornecedorViewMode] = useState<ViewMode>('list');
  const [categoriaViewMode, setCategoriaViewMode] = useState<ViewMode>('list');

  const [selectedProduto, setSelectedProduto] = useState<Produto | undefined>();
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | undefined>();
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | undefined>();
  const [scannerOpen, setScannerOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'produto' | 'fornecedor' | 'categoria' } | null>(null);

  const [searchProduto, setSearchProduto] = useState('');
  const [searchFornecedor, setSearchFornecedor] = useState('');

  // Produtos handlers
  const handleAddProduto = () => {
    setSelectedProduto(undefined);
    setProdutoViewMode('form');
  };

  const handleEditProduto = (produto: Produto) => {
    setSelectedProduto(produto);
    setProdutoViewMode('form');
  };

  const handleSubmitProduto = (data: Produto) => {
    if (selectedProduto) {
      updateProduto(selectedProduto.id!, data);
      toast({ title: 'Sucesso', description: 'Produto atualizado com sucesso!' });
    } else {
      addProduto(data);
      toast({ title: 'Sucesso', description: 'Produto cadastrado com sucesso!' });
    }
    setProdutoViewMode('list');
    setSelectedProduto(undefined);
  };

  const handleDeleteProduto = (id: string) => {
    setItemToDelete({ id, type: 'produto' });
    setDeleteDialogOpen(true);
  };

  // Fornecedores handlers
  const handleAddFornecedor = () => {
    setSelectedFornecedor(undefined);
    setFornecedorViewMode('form');
  };

  const handleEditFornecedor = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setFornecedorViewMode('form');
  };

  const handleSubmitFornecedor = async (data: Fornecedor) => {
    try {
      if (selectedFornecedor) {
        await updateFornecedor(selectedFornecedor.id!, data);
        toast({ title: 'Sucesso', description: 'Fornecedor atualizado com sucesso!' });
      } else {
        await addFornecedor(data);
        toast({ title: 'Sucesso', description: 'Fornecedor cadastrado com sucesso!' });
      }
      setFornecedorViewMode('list');
      setSelectedFornecedor(undefined);
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar fornecedor', variant: 'destructive' });
    }
  };

  const handleDeleteFornecedor = (id: string) => {
    setItemToDelete({ id, type: 'fornecedor' });
    setDeleteDialogOpen(true);
  };

  // Categorias handlers
  const handleAddCategoria = () => {
    setSelectedCategoria(undefined);
    setCategoriaViewMode('form');
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setCategoriaViewMode('form');
  };

  const handleSubmitCategoria = async (data: Categoria) => {
    try {
      if (selectedCategoria) {
        await updateCategoria(selectedCategoria.id!, data);
        toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso!' });
      } else {
        await addCategoria(data);
        toast({ title: 'Sucesso', description: 'Categoria cadastrada com sucesso!' });
      }
      setCategoriaViewMode('list');
      setSelectedCategoria(undefined);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar categoria', variant: 'destructive' });
    }
  };

  const handleDeleteCategoria = (id: string) => {
    setItemToDelete({ id, type: 'categoria' });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case 'produto':
          await deleteProduto(itemToDelete.id);
          toast({ title: 'Sucesso', description: 'Produto excluído com sucesso!' });
          break;
        case 'fornecedor':
          await deleteFornecedor(itemToDelete.id);
          toast({ title: 'Sucesso', description: 'Fornecedor excluído com sucesso!' });
          break;
        case 'categoria':
          await deleteCategoria(itemToDelete.id);
          toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso!' });
          break;
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({ title: 'Erro', description: 'Erro ao excluir item', variant: 'destructive' });
    }
  };

  const handleScanSuccess = (barcode: string) => {
    const produto = produtos.find(p => p.codigoBarras === barcode || p.codigo === barcode);
    if (produto) {
      setSelectedProduto(produto);
      setProdutoViewMode('form');
      toast({ title: 'Sucesso', description: `Produto encontrado: ${produto.nome}` });
    } else {
      toast({ title: 'Erro', description: 'Produto não encontrado com este código de barras', variant: 'destructive' });
    }
  };

  const filteredProdutos = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchProduto.toLowerCase())
  );

  const filteredFornecedores = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(searchFornecedor.toLowerCase()) ||
    (f.cnpj && f.cnpj.toLowerCase().includes(searchFornecedor.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Package}
          title="Cadastros de Estoque"
          description="Gestão de produtos, fornecedores e categorias do estoque"
        />
        <LoadingState variant="spinner" size="lg" message="Carregando cadastros..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          icon={Package}
          title="Cadastros de Estoque"
          description="Gestão de produtos, fornecedores e categorias do estoque"
        />
        <Button onClick={() => setScannerOpen(true)} variant="outline" className="hover-scale">
          <Scan className="mr-2 h-4 w-4" />
          Scanner de Código de Barras
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">
              {produtos.filter(p => p.ativo).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedores.length}</div>
            <p className="text-xs text-muted-foreground">
              {fornecedores.filter(f => f.ativo).length} ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
            <p className="text-xs text-muted-foreground">
              Grupos de produtos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>
                    Gerencie o cadastro de produtos do estoque
                  </CardDescription>
                </div>
                <Button onClick={handleAddProduto}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {produtoViewMode === 'list' ? (
                <div className="space-y-4">
                  <SearchInput
                    value={searchProduto}
                    onChange={setSearchProduto}
                    placeholder="Buscar produtos por nome ou código..."
                  />
                  <ProdutosList
                    produtos={filteredProdutos}
                    categorias={categorias}
                    fornecedores={fornecedores}
                    onEdit={handleEditProduto}
                    onDelete={handleDeleteProduto}
                  />
                </div>
              ) : (
                <ProdutoForm
                  produto={selectedProduto}
                  categorias={categorias}
                  fornecedores={fornecedores}
                  onSubmit={handleSubmitProduto}
                  onCancel={() => {
                    setProdutoViewMode('list');
                    setSelectedProduto(undefined);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fornecedores</CardTitle>
                  <CardDescription>
                    Gerencie o cadastro de fornecedores
                  </CardDescription>
                </div>
                <Button onClick={handleAddFornecedor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fornecedorViewMode === 'list' ? (
                <div className="space-y-4">
                  <SearchInput
                    value={searchFornecedor}
                    onChange={setSearchFornecedor}
                    placeholder="Buscar fornecedores por nome ou CNPJ..."
                  />
                  <FornecedoresList
                    fornecedores={filteredFornecedores}
                    onEdit={handleEditFornecedor}
                    onDelete={handleDeleteFornecedor}
                  />
                </div>
              ) : (
                <FornecedorForm
                  fornecedor={selectedFornecedor}
                  onSubmit={handleSubmitFornecedor}
                  onCancel={() => {
                    setFornecedorViewMode('list');
                    setSelectedFornecedor(undefined);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>
                    Organize produtos em categorias
                  </CardDescription>
                </div>
                <Button onClick={handleAddCategoria}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categoriaViewMode === 'list' ? (
                <CategoriasList
                  categorias={categorias}
                  onEdit={handleEditCategoria}
                  onDelete={handleDeleteCategoria}
                />
              ) : (
                <CategoriaForm
                  categoria={selectedCategoria}
                  onSubmit={handleSubmitCategoria}
                  onCancel={() => {
                    setCategoriaViewMode('list');
                    setSelectedCategoria(undefined);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir este ${itemToDelete?.type}? Esta ação não pode ser desfeita.`}
      />

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
