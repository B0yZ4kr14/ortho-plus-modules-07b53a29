import { useState, useEffect } from 'react';
import type { Produto, Fornecedor, Categoria, Requisicao, Movimentacao, Alerta } from '../types/estoque.types';
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
  const [requisicoes, setRequisicoes] = useLocalStorage<Requisicao[]>('estoque-requisicoes', []);
  const [movimentacoes, setMovimentacoes] = useLocalStorage<Movimentacao[]>('estoque-movimentacoes', []);
  const [alertas, setAlertas] = useLocalStorage<Alerta[]>('estoque-alertas', []);

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

  // Requisições
  const addRequisicao = (requisicao: Requisicao) => {
    const newRequisicao = {
      ...requisicao,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setRequisicoes([...requisicoes, newRequisicao]);
    return newRequisicao;
  };

  const updateRequisicao = (id: string, data: Partial<Requisicao>) => {
    setRequisicoes(requisicoes.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const aprovarRequisicao = (id: string, aprovadoPor: string) => {
    const requisicao = requisicoes.find(r => r.id === id);
    if (!requisicao) return;

    updateRequisicao(id, {
      status: 'APROVADA',
      aprovadoPor,
      dataAprovacao: new Date().toISOString(),
    });

    // Criar movimentação de saída
    const produto = produtos.find(p => p.id === requisicao.produtoId);
    if (produto) {
      addMovimentacao({
        produtoId: requisicao.produtoId,
        tipo: 'SAIDA',
        quantidade: requisicao.quantidade,
        motivo: `Requisição aprovada: ${requisicao.motivo}`,
        realizadoPor: aprovadoPor,
      });
    }
  };

  const rejeitarRequisicao = (id: string, motivo: string) => {
    updateRequisicao(id, {
      status: 'REJEITADA',
      observacoes: motivo,
    });
  };

  const getRequisicaoById = (id: string) => requisicoes.find(r => r.id === id);

  // Movimentações
  const addMovimentacao = (movimentacao: Movimentacao) => {
    const newMovimentacao = {
      ...movimentacao,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setMovimentacoes([...movimentacoes, newMovimentacao]);

    // Atualizar estoque do produto
    const produto = produtos.find(p => p.id === movimentacao.produtoId);
    if (produto) {
      let novaQuantidade = produto.quantidadeAtual;

      switch (movimentacao.tipo) {
        case 'ENTRADA':
        case 'DEVOLUCAO':
          novaQuantidade += movimentacao.quantidade;
          break;
        case 'SAIDA':
        case 'PERDA':
          novaQuantidade -= movimentacao.quantidade;
          break;
        case 'AJUSTE':
          novaQuantidade = movimentacao.quantidade;
          break;
      }

      updateProduto(produto.id!, { quantidadeAtual: Math.max(0, novaQuantidade) });
      verificarEstoqueMinimo(produto.id!, Math.max(0, novaQuantidade));
    }

    return newMovimentacao;
  };

  const getMovimentacaoById = (id: string) => movimentacoes.find(m => m.id === id);

  // Alertas
  const verificarEstoqueMinimo = (produtoId: string, quantidadeAtual: number) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    // Remover alertas antigos deste produto
    setAlertas(alertas.filter(a => a.produtoId !== produtoId));

    if (quantidadeAtual <= produto.quantidadeMinima * 0.5) {
      // Estoque crítico (50% do mínimo)
      addAlerta({
        produtoId,
        tipo: 'ESTOQUE_CRITICO',
        mensagem: `Estoque CRÍTICO! ${produto.nome} está com apenas ${quantidadeAtual} unidades.`,
        quantidadeAtual,
        quantidadeSugerida: produto.quantidadeMinima * 2,
        lido: false,
      });
    } else if (quantidadeAtual <= produto.quantidadeMinima) {
      // Estoque mínimo atingido
      addAlerta({
        produtoId,
        tipo: 'ESTOQUE_MINIMO',
        mensagem: `${produto.nome} atingiu o estoque mínimo (${quantidadeAtual}/${produto.quantidadeMinima}).`,
        quantidadeAtual,
        quantidadeSugerida: produto.quantidadeMinima * 1.5,
        lido: false,
      });
    }
  };

  const addAlerta = (alerta: Alerta) => {
    const newAlerta = {
      ...alerta,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAlertas([...alertas, newAlerta]);
    return newAlerta;
  };

  const marcarAlertaComoLido = (id: string) => {
    setAlertas(alertas.map(a => a.id === id ? { ...a, lido: true } : a));
  };

  const limparAlertasLidos = () => {
    setAlertas(alertas.filter(a => !a.lido));
  };

  const calcularSugestaoReposicao = (produtoId: string): number => {
    // Calcula consumo médio dos últimos 30 dias
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return 0;

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    const movimentacoesSaida = movimentacoes.filter(
      m => m.produtoId === produtoId && 
      (m.tipo === 'SAIDA' || m.tipo === 'PERDA') &&
      new Date(m.createdAt!) >= dataLimite
    );

    const consumoTotal = movimentacoesSaida.reduce((sum, m) => sum + m.quantidade, 0);
    const consumoMedio = consumoTotal / 30;
    const diasEstoque = produto.quantidadeAtual / (consumoMedio || 1);

    // Se tem menos de 15 dias de estoque, sugerir reposição para 60 dias
    if (diasEstoque < 15) {
      return Math.ceil(consumoMedio * 60);
    }

    return 0;
  };

  return {
    produtos,
    fornecedores,
    categorias,
    requisicoes,
    movimentacoes,
    alertas,
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
    addRequisicao,
    updateRequisicao,
    aprovarRequisicao,
    rejeitarRequisicao,
    getRequisicaoById,
    addMovimentacao,
    getMovimentacaoById,
    marcarAlertaComoLido,
    limparAlertasLidos,
    calcularSugestaoReposicao,
  };
}
