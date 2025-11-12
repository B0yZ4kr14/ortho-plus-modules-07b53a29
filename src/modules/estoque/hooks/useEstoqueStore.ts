import { useState, useEffect } from 'react';
import type { Produto, Fornecedor, Categoria } from '../types/estoque.types';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: '1',
    nome: 'Materiais de Restauração',
    descricao: 'Resinas, amálgamas, cimentos',
    cor: '#3b82f6',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Instrumentos',
    descricao: 'Instrumentos odontológicos',
    cor: '#10b981',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    nome: 'Descartáveis',
    descricao: 'Luvas, máscaras, seringas',
    cor: '#f59e0b',
    createdAt: new Date().toISOString(),
  },
];

const MOCK_FORNECEDORES: Fornecedor[] = [
  {
    id: '1',
    nome: 'Dental Supply Ltda',
    razaoSocial: 'Dental Supply Comércio Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@dentalsupply.com.br',
    telefone: '(11) 3456-7890',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    ativo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Odonto Distribuidora',
    razaoSocial: 'Odonto Distribuidora Médica S.A.',
    cnpj: '98.765.432/0001-10',
    email: 'vendas@odontodist.com.br',
    telefone: '(11) 9876-5432',
    endereco: 'Av. Paulista, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    ativo: true,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_PRODUTOS: Produto[] = [
  {
    id: '1',
    nome: 'Resina Composta Z350',
    descricao: 'Resina fotopolimerizável universal',
    codigo: 'RSN-Z350-A2',
    categoriaId: '1',
    fornecedorId: '1',
    unidadeMedida: 'UNIDADE',
    quantidadeMinima: 5,
    quantidadeAtual: 12,
    precoCompra: 95.00,
    precoVenda: 150.00,
    lote: 'LT2024001',
    dataValidade: '2025-12-31',
    ativo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Luvas de Procedimento',
    descricao: 'Luvas de látex tam M',
    codigo: 'LUV-LAT-M',
    categoriaId: '3',
    fornecedorId: '2',
    unidadeMedida: 'CAIXA',
    quantidadeMinima: 10,
    quantidadeAtual: 25,
    precoCompra: 35.00,
    precoVenda: 55.00,
    lote: 'LT2024002',
    dataValidade: '2026-06-30',
    ativo: true,
    createdAt: new Date().toISOString(),
  },
];

export function useEstoqueStore() {
  const [produtos, setProdutos] = useLocalStorage<Produto[]>('estoque-produtos', MOCK_PRODUTOS);
  const [fornecedores, setFornecedores] = useLocalStorage<Fornecedor[]>('estoque-fornecedores', MOCK_FORNECEDORES);
  const [categorias, setCategorias] = useLocalStorage<Categoria[]>('estoque-categorias', MOCK_CATEGORIAS);

  // Produtos
  const addProduto = (produto: Produto) => {
    const newProduto = {
      ...produto,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProdutos([...produtos, newProduto]);
    return newProduto;
  };

  const updateProduto = (id: string, data: Partial<Produto>) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduto = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const getProdutoById = (id: string) => produtos.find(p => p.id === id);

  // Fornecedores
  const addFornecedor = (fornecedor: Fornecedor) => {
    const newFornecedor = {
      ...fornecedor,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setFornecedores([...fornecedores, newFornecedor]);
    return newFornecedor;
  };

  const updateFornecedor = (id: string, data: Partial<Fornecedor>) => {
    setFornecedores(fornecedores.map(f => f.id === id ? { ...f, ...data } : f));
  };

  const deleteFornecedor = (id: string) => {
    setFornecedores(fornecedores.filter(f => f.id !== id));
  };

  const getFornecedorById = (id: string) => fornecedores.find(f => f.id === id);

  // Categorias
  const addCategoria = (categoria: Categoria) => {
    const newCategoria = {
      ...categoria,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCategorias([...categorias, newCategoria]);
    return newCategoria;
  };

  const updateCategoria = (id: string, data: Partial<Categoria>) => {
    setCategorias(categorias.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategoria = (id: string) => {
    setCategorias(categorias.filter(c => c.id !== id));
  };

  const getCategoriaById = (id: string) => categorias.find(c => c.id === id);

  return {
    produtos,
    fornecedores,
    categorias,
    addProduto,
    updateProduto,
    deleteProduto,
    getProdutoById,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    getFornecedorById,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriaById,
  };
}
