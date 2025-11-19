import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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

export default function EstoqueCadastrosPage() {
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
      toast({ title: 'Erro', description: 'Erro ao salvar categoria', variant: 'destructive' });
    }
  };

  const handleDeleteCategoria = (id: string) => {
    setItemToDelete({ id, type: 'categoria' });
    setDeleteDialogOpen(true);
  };

  // Delete confirmation
  const handleConfirmDelete = async () => {
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
      toast({ title: 'Erro', description: 'Erro ao excluir item', variant: 'destructive' });
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    const produto = produtos.find(p => p.codigoBarras === barcode);
    if (produto) {
      handleEditProduto(produto);
    }
    setScannerOpen(false);
  };

  if (loading) {
    return <LoadingState variant="spinner" size="lg" message="Carregando cadastros..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Cadastros de Estoque"
        description="Gerencie produtos, fornecedores e categorias"
      />

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="produtos">
            <Package className="h-4 w-4 mr-2" />
            Produtos ({produtos.length})
          </TabsTrigger>
          <TabsTrigger value="fornecedores">
            <Users className="h-4 w-4 mr-2" />
            Fornecedores ({fornecedores.length})
          </TabsTrigger>
          <TabsTrigger value="categorias">
            <Building2 className="h-4 w-4 mr-2" />
            Categorias ({categorias.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          {produtoViewMode === 'list' ? (
            <>
              <div className="flex justify-between items-center gap-4">
                <SearchInput
                  placeholder="Buscar produtos..."
                  value={searchProduto}
                  onChange={setSearchProduto}
                  className="max-w-sm"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setScannerOpen(true)}>
                    <Scan className="h-4 w-4 mr-2" />
                    Scanner
                  </Button>
                  <Button onClick={handleAddProduto}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </div>
              <ProdutosList
                produtos={produtos.filter(p => 
                  p.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
                  (p.codigoBarras && p.codigoBarras.includes(searchProduto))
                )}
                categorias={categorias}
                fornecedores={fornecedores}
                onEdit={handleEditProduto}
                onDelete={handleDeleteProduto}
              />
            </>
          ) : (
            <Card className="p-6">
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
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          {fornecedorViewMode === 'list' ? (
            <>
              <div className="flex justify-between items-center gap-4">
                <SearchInput
                  placeholder="Buscar fornecedores..."
                  value={searchFornecedor}
                  onChange={setSearchFornecedor}
                  className="max-w-sm"
                />
                <Button onClick={handleAddFornecedor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
              <FornecedoresList
                fornecedores={fornecedores.filter(f =>
                  f.nome.toLowerCase().includes(searchFornecedor.toLowerCase()) ||
                  f.cnpj.includes(searchFornecedor)
                )}
                onEdit={handleEditFornecedor}
                onDelete={handleDeleteFornecedor}
              />
            </>
          ) : (
            <Card className="p-6">
              <FornecedorForm
                fornecedor={selectedFornecedor}
                onSubmit={handleSubmitFornecedor}
                onCancel={() => {
                  setFornecedorViewMode('list');
                  setSelectedFornecedor(undefined);
                }}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          {categoriaViewMode === 'list' ? (
            <>
              <div className="flex justify-end">
                <Button onClick={handleAddCategoria}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
              <CategoriasList
                categorias={categorias}
                onEdit={handleEditCategoria}
                onDelete={handleDeleteCategoria}
              />
            </>
          ) : (
            <Card className="p-6">
              <CategoriaForm
                categoria={selectedCategoria}
                onSubmit={handleSubmitCategoria}
                onCancel={() => {
                  setCategoriaViewMode('list');
                  setSelectedCategoria(undefined);
                }}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleBarcodeScanned}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
