/**
 * useInventoryAPI Hook
 * Hook para gestão de inventário via REST API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/apiClient';
import { toast } from 'sonner';

interface Product {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  descricao?: string;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  valorUnitario: number;
  fornecedor?: string;
  localizacao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useInventoryAPI() {
  const { clinicId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<{ data: any[] }>('/inventario/produtos');
      
      // Converter dados da API para formato frontend
      const transformed: Product[] = response.data.map((apiProduct: any) => ({
        id: apiProduct.id,
        nome: apiProduct.nome,
        codigo: apiProduct.codigo,
        categoria: apiProduct.categoria,
        descricao: apiProduct.descricao,
        unidadeMedida: apiProduct.unidade_medida,
        estoqueAtual: apiProduct.estoque_atual,
        estoqueMinimo: apiProduct.estoque_minimo,
        estoqueMaximo: apiProduct.estoque_maximo,
        valorUnitario: apiProduct.valor_unitario,
        fornecedor: apiProduct.fornecedor,
        localizacao: apiProduct.localizacao,
        ativo: apiProduct.ativo,
        createdAt: apiProduct.created_at,
        updatedAt: apiProduct.updated_at,
      }));

      setProducts(transformed);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = async (data: Partial<Product>) => {
    if (!clinicId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      await apiClient.post('/inventario/produtos', {
        clinicId,
        nome: data.nome,
        codigo: data.codigo,
        categoria: data.categoria,
        descricao: data.descricao,
        unidadeMedida: data.unidadeMedida,
        estoqueMinimo: data.estoqueMinimo,
        estoqueMaximo: data.estoqueMaximo,
        valorUnitario: data.valorUnitario,
        fornecedor: data.fornecedor,
        localizacao: data.localizacao,
      });

      toast.success('Produto cadastrado com sucesso!');
      await loadProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error('Erro ao cadastrar produto: ' + error.message);
      throw error;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await apiClient.patch(`/inventario/produtos/${id}`, {
        nome: data.nome,
        estoqueMinimo: data.estoqueMinimo,
        estoqueMaximo: data.estoqueMaximo,
        valorUnitario: data.valorUnitario,
        ativo: data.ativo,
      });

      toast.success('Produto atualizado com sucesso!');
      await loadProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto: ' + error.message);
      throw error;
    }
  };

  const adjustStock = async (id: string, quantidade: number, motivo: string) => {
    try {
      await apiClient.post(`/inventario/produtos/${id}/ajustar-estoque`, {
        quantidade,
        motivo,
      });

      toast.success('Estoque ajustado com sucesso!');
      await loadProducts();
    } catch (error: any) {
      console.error('Error adjusting stock:', error);
      toast.error('Erro ao ajustar estoque: ' + error.message);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiClient.delete(`/inventario/produtos/${id}`);
      toast.success('Produto removido com sucesso!');
      await loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao remover produto: ' + error.message);
      throw error;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    adjustStock,
    deleteProduct,
    reloadProducts: loadProducts,
  };
}
