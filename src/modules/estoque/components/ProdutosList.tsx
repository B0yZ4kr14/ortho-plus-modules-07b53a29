import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { Package, AlertTriangle } from 'lucide-react';
import type { Produto, Categoria, Fornecedor } from '../types/estoque.types';

interface ProdutosListProps {
  produtos: Produto[];
  categorias: Categoria[];
  fornecedores: Fornecedor[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
}

export function ProdutosList({ produtos, categorias, fornecedores, onEdit, onDelete }: ProdutosListProps) {
  if (produtos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum produto cadastrado</p>
      </div>
    );
  }

  const getCategoriaNome = (id: string) => 
    categorias.find(c => c.id === id)?.nome || 'N/A';
  
  const getFornecedorNome = (id: string) => 
    fornecedores.find(f => f.id === id)?.nome || 'N/A';

  return (
    <div className="space-y-4">
      {produtos.map((produto) => {
        const estoqueAbaixoMinimo = produto.quantidadeAtual < produto.quantidadeMinima;
        
        return (
          <div
            key={produto.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{produto.nome}</h3>
                    <Badge variant={produto.ativo ? 'default' : 'secondary'} className="text-xs">
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {estoqueAbaixoMinimo && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Estoque Baixo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Código: {produto.codigo} | {getCategoriaNome(produto.categoriaId)}
                  </p>
                  {produto.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">{produto.descricao}</p>
                  )}
                </div>
              </div>
              <ActionButtons
                onEdit={() => onEdit(produto)}
                onDelete={() => onDelete(produto.id!)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4 text-sm border-t pt-3">
              <div>
                <span className="text-muted-foreground">Fornecedor:</span>
                <p className="font-medium">{getFornecedorNome(produto.fornecedorId)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estoque:</span>
                <p className="font-medium">
                  {produto.quantidadeAtual} {produto.unidadeMedida}
                  <span className="text-muted-foreground text-xs ml-1">
                    (mín: {produto.quantidadeMinima})
                  </span>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Preço Compra:</span>
                <p className="font-medium">
                  R$ {produto.precoCompra.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Preço Venda:</span>
                <p className="font-medium">
                  {produto.precoVenda ? `R$ ${produto.precoVenda.toFixed(2)}` : '-'}
                </p>
              </div>
            </div>

            {(produto.lote || produto.dataValidade) && (
              <div className="flex gap-4 text-sm mt-2 pt-2 border-t">
                {produto.lote && (
                  <div>
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="ml-1 font-medium">{produto.lote}</span>
                  </div>
                )}
                {produto.dataValidade && (
                  <div>
                    <span className="text-muted-foreground">Validade:</span>
                    <span className="ml-1 font-medium">
                      {new Date(produto.dataValidade).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
