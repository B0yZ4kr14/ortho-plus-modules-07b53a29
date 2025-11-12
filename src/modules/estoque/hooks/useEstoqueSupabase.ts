import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Produto, Fornecedor, Categoria, Requisicao, Movimentacao, Alerta } from '../types/estoque.types';
import { toast } from 'sonner';

export function useEstoqueSupabase() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount and setup realtime
  useEffect(() => {
    loadAllData();

    // Setup Realtime subscriptions
    const produtosChannel = supabase
      .channel('estoque_produtos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_produtos' }, () => {
        loadProdutos();
      })
      .subscribe();

    const categoriasChannel = supabase
      .channel('estoque_categorias_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_categorias' }, () => {
        loadCategorias();
      })
      .subscribe();

    const fornecedoresChannel = supabase
      .channel('estoque_fornecedores_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_fornecedores' }, () => {
        loadFornecedores();
      })
      .subscribe();

    const requisicoesChannel = supabase
      .channel('estoque_requisicoes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_requisicoes' }, () => {
        loadRequisicoes();
      })
      .subscribe();

    const movimentacoesChannel = supabase
      .channel('estoque_movimentacoes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_movimentacoes' }, () => {
        loadMovimentacoes();
      })
      .subscribe();

    const alertasChannel = supabase
      .channel('estoque_alertas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque_alertas' }, () => {
        loadAlertas();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(produtosChannel);
      supabase.removeChannel(categoriasChannel);
      supabase.removeChannel(fornecedoresChannel);
      supabase.removeChannel(requisicoesChannel);
      supabase.removeChannel(movimentacoesChannel);
      supabase.removeChannel(alertasChannel);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategorias(),
        loadFornecedores(),
        loadProdutos(),
        loadRequisicoes(),
        loadMovimentacoes(),
        loadAlertas(),
      ]);
    } catch (error) {
      console.error('Error loading estoque data:', error);
      toast.error('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  // Categorias
  const loadCategorias = async () => {
    const { data, error } = await supabase
      .from('estoque_categorias' as any)
      .select('*')
      .order('nome');

    if (error) {
      console.error('Error loading categorias:', error);
      return;
    }

    setCategorias((data as any[]).map((c: any) => ({
      id: c.id as string,
      nome: c.nome,
      descricao: c.descricao || undefined,
      cor: c.cor || undefined,
      createdAt: c.created_at,
    })));
  };

  const addCategoria = async (categoria: Categoria) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    const { data, error } = await supabase
      .from('estoque_categorias' as any)
      .insert({
        clinic_id: profile?.clinic_id,
        nome: categoria.nome,
        descricao: categoria.descricao,
        cor: categoria.cor,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao adicionar categoria');
      throw error;
    }

    toast.success('Categoria adicionada com sucesso');
    await loadCategorias();
    return data;
  };

  const updateCategoria = async (id: string, data: Partial<Categoria>) => {
    const { error } = await supabase
      .from('estoque_categorias' as any)
      .update({
        nome: data.nome,
        descricao: data.descricao,
        cor: data.cor,
      } as any)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar categoria');
      throw error;
    }

    toast.success('Categoria atualizada com sucesso');
    await loadCategorias();
  };

  const deleteCategoria = async (id: string) => {
    const { error } = await supabase
      .from('estoque_categorias' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir categoria');
      throw error;
    }

    toast.success('Categoria excluída com sucesso');
    await loadCategorias();
  };

  const getCategoriaById = (id: string) => categorias.find(c => c.id === id);

  // Fornecedores
  const loadFornecedores = async () => {
    const { data, error } = await supabase
      .from('estoque_fornecedores' as any)
      .select('*')
      .order('nome');

    if (error) {
      console.error('Error loading fornecedores:', error);
      return;
    }

    setFornecedores((data as any[]).map((f: any) => ({
      id: f.id as string,
      nome: f.nome,
      razaoSocial: f.razao_social || undefined,
      cnpj: f.cnpj || undefined,
      email: f.email || undefined,
      telefone: f.telefone || undefined,
      endereco: f.endereco || undefined,
      cidade: f.cidade || undefined,
      estado: f.estado || undefined,
      cep: f.cep || undefined,
      observacoes: f.observacoes || undefined,
      ativo: f.ativo,
      createdAt: f.created_at,
    })));
  };

  const addFornecedor = async (fornecedor: Fornecedor) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    const { data, error } = await supabase
      .from('estoque_fornecedores' as any)
      .insert({
        clinic_id: profile?.clinic_id,
        nome: fornecedor.nome,
        razao_social: fornecedor.razaoSocial,
        cnpj: fornecedor.cnpj,
        email: fornecedor.email,
        telefone: fornecedor.telefone,
        endereco: fornecedor.endereco,
        cidade: fornecedor.cidade,
        estado: fornecedor.estado,
        cep: fornecedor.cep,
        observacoes: fornecedor.observacoes,
        ativo: fornecedor.ativo ?? true,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao adicionar fornecedor');
      throw error;
    }

    toast.success('Fornecedor adicionado com sucesso');
    await loadFornecedores();
    return data;
  };

  const updateFornecedor = async (id: string, data: Partial<Fornecedor>) => {
    const { error } = await supabase
      .from('estoque_fornecedores' as any)
      .update({
        nome: data.nome,
        razao_social: data.razaoSocial,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        observacoes: data.observacoes,
        ativo: data.ativo,
      } as any)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar fornecedor');
      throw error;
    }

    toast.success('Fornecedor atualizado com sucesso');
    await loadFornecedores();
  };

  const deleteFornecedor = async (id: string) => {
    const { error } = await supabase
      .from('estoque_fornecedores' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir fornecedor');
      throw error;
    }

    toast.success('Fornecedor excluído com sucesso');
    await loadFornecedores();
  };

  const getFornecedorById = (id: string) => fornecedores.find(f => f.id === id);

  // Produtos
  const loadProdutos = async () => {
    const { data, error } = await supabase
      .from('estoque_produtos' as any)
      .select('*')
      .order('nome');

    if (error) {
      console.error('Error loading produtos:', error);
      return;
    }

    setProdutos((data as any[]).map((p: any) => ({
      id: p.id as string,
      nome: p.nome,
      descricao: p.descricao || undefined,
      codigo: p.codigo,
      categoriaId: p.categoria_id,
      fornecedorId: p.fornecedor_id,
      unidadeMedida: p.unidade_medida as any,
      quantidadeMinima: Number(p.quantidade_minima),
      quantidadeAtual: Number(p.quantidade_atual),
      precoCompra: Number(p.preco_compra),
      precoVenda: p.preco_venda ? Number(p.preco_venda) : undefined,
      lote: p.lote || undefined,
      dataValidade: p.data_validade || undefined,
      ativo: p.ativo,
      createdAt: p.created_at,
    })));
  };

  const addProduto = async (produto: Produto) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    const { data, error } = await supabase
      .from('estoque_produtos' as any)
      .insert({
        clinic_id: profile?.clinic_id,
        nome: produto.nome,
        descricao: produto.descricao,
        codigo: produto.codigo,
        categoria_id: produto.categoriaId,
        fornecedor_id: produto.fornecedorId,
        unidade_medida: produto.unidadeMedida,
        quantidade_minima: produto.quantidadeMinima,
        quantidade_atual: produto.quantidadeAtual,
        preco_compra: produto.precoCompra,
        preco_venda: produto.precoVenda,
        lote: produto.lote,
        data_validade: produto.dataValidade,
        ativo: produto.ativo ?? true,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao adicionar produto');
      throw error;
    }

    toast.success('Produto adicionado com sucesso');
    await loadProdutos();
    return data;
  };

  const updateProduto = async (id: string, data: Partial<Produto>) => {
    const updateData: any = {};
    
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.codigo !== undefined) updateData.codigo = data.codigo;
    if (data.categoriaId !== undefined) updateData.categoria_id = data.categoriaId;
    if (data.fornecedorId !== undefined) updateData.fornecedor_id = data.fornecedorId;
    if (data.unidadeMedida !== undefined) updateData.unidade_medida = data.unidadeMedida;
    if (data.quantidadeMinima !== undefined) updateData.quantidade_minima = data.quantidadeMinima;
    if (data.quantidadeAtual !== undefined) updateData.quantidade_atual = data.quantidadeAtual;
    if (data.precoCompra !== undefined) updateData.preco_compra = data.precoCompra;
    if (data.precoVenda !== undefined) updateData.preco_venda = data.precoVenda;
    if (data.lote !== undefined) updateData.lote = data.lote;
    if (data.dataValidade !== undefined) updateData.data_validade = data.dataValidade;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const { error } = await supabase
      .from('estoque_produtos' as any)
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar produto');
      throw error;
    }

    toast.success('Produto atualizado com sucesso');
    await loadProdutos();
    await loadAlertas(); // Recarregar alertas pois podem ter mudado
  };

  const deleteProduto = async (id: string) => {
    const { error } = await supabase
      .from('estoque_produtos' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir produto');
      throw error;
    }

    toast.success('Produto excluído com sucesso');
    await loadProdutos();
  };

  const getProdutoById = (id: string) => produtos.find(p => p.id === id);

  // Requisições
  const loadRequisicoes = async () => {
    const { data, error } = await supabase
      .from('estoque_requisicoes' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requisicoes:', error);
      return;
    }

    setRequisicoes((data as any[]).map((r: any) => ({
      id: r.id as string,
      produtoId: r.produto_id,
      quantidade: Number(r.quantidade),
      motivo: r.motivo,
      prioridade: r.prioridade as any,
      status: r.status as any,
      solicitadoPor: r.solicitado_por,
      aprovadoPor: r.aprovado_por || undefined,
      dataAprovacao: r.data_aprovacao || undefined,
      observacoes: r.observacoes || undefined,
      createdAt: r.created_at,
    })));
  };

  const addRequisicao = async (requisicao: Requisicao) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    const { data, error } = await supabase
      .from('estoque_requisicoes' as any)
      .insert({
        clinic_id: profile?.clinic_id,
        produto_id: requisicao.produtoId,
        quantidade: requisicao.quantidade,
        motivo: requisicao.motivo,
        prioridade: requisicao.prioridade,
        status: requisicao.status || 'PENDENTE',
        solicitado_por: requisicao.solicitadoPor,
        observacoes: requisicao.observacoes,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar requisição');
      throw error;
    }

    toast.success('Requisição criada com sucesso');
    await loadRequisicoes();
    return data;
  };

  const updateRequisicao = async (id: string, data: Partial<Requisicao>) => {
    const updateData: any = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.aprovadoPor !== undefined) updateData.aprovado_por = data.aprovadoPor;
    if (data.dataAprovacao !== undefined) updateData.data_aprovacao = data.dataAprovacao;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    const { error } = await supabase
      .from('estoque_requisicoes' as any)
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar requisição');
      throw error;
    }

    await loadRequisicoes();
  };

  const aprovarRequisicao = async (id: string, aprovadoPor: string) => {
    const requisicao = requisicoes.find(r => r.id === id);
    if (!requisicao) return;

    await updateRequisicao(id, {
      status: 'APROVADA',
      aprovadoPor,
      dataAprovacao: new Date().toISOString(),
    });

    // Criar movimentação de saída
    const produto = produtos.find(p => p.id === requisicao.produtoId);
    if (produto) {
      await addMovimentacao({
        produtoId: requisicao.produtoId,
        tipo: 'SAIDA',
        quantidade: requisicao.quantidade,
        motivo: `Requisição aprovada: ${requisicao.motivo}`,
        realizadoPor: aprovadoPor,
      });
    }

    toast.success('Requisição aprovada com sucesso');
  };

  const rejeitarRequisicao = async (id: string, motivo: string) => {
    await updateRequisicao(id, {
      status: 'REJEITADA',
      observacoes: motivo,
    });
    toast.success('Requisição rejeitada');
  };

  const getRequisicaoById = (id: string) => requisicoes.find(r => r.id === id);

  // Movimentações
  const loadMovimentacoes = async () => {
    const { data, error } = await supabase
      .from('estoque_movimentacoes' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading movimentacoes:', error);
      return;
    }

    setMovimentacoes((data as any[]).map((m: any) => ({
      id: m.id as string,
      produtoId: m.produto_id,
      tipo: m.tipo as any,
      quantidade: Number(m.quantidade),
      lote: m.lote || undefined,
      dataValidade: m.data_validade || undefined,
      motivo: m.motivo,
      valorUnitario: m.valor_unitario ? Number(m.valor_unitario) : undefined,
      valorTotal: m.valor_total ? Number(m.valor_total) : undefined,
      fornecedorId: m.fornecedor_id || undefined,
      notaFiscal: m.nota_fiscal || undefined,
      realizadoPor: m.realizado_por,
      observacoes: m.observacoes || undefined,
      createdAt: m.created_at,
    })));
  };

  const addMovimentacao = async (movimentacao: Movimentacao) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', userData.user?.id)
      .single();

    const { data, error } = await supabase
      .from('estoque_movimentacoes' as any)
      .insert({
        clinic_id: profile?.clinic_id,
        produto_id: movimentacao.produtoId,
        tipo: movimentacao.tipo,
        quantidade: movimentacao.quantidade,
        lote: movimentacao.lote,
        data_validade: movimentacao.dataValidade,
        motivo: movimentacao.motivo,
        valor_unitario: movimentacao.valorUnitario,
        valor_total: movimentacao.valorTotal,
        fornecedor_id: movimentacao.fornecedorId,
        nota_fiscal: movimentacao.notaFiscal,
        realizado_por: movimentacao.realizadoPor,
        observacoes: movimentacao.observacoes,
      } as any)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar movimentação');
      throw error;
    }

    toast.success('Movimentação registrada com sucesso');
    
    // O trigger do banco já atualiza o estoque e cria alertas automaticamente
    await Promise.all([
      loadMovimentacoes(),
      loadProdutos(),
      loadAlertas(),
    ]);
    
    return data;
  };

  const getMovimentacaoById = (id: string) => movimentacoes.find(m => m.id === id);

  // Alertas
  const loadAlertas = async () => {
    const { data, error } = await supabase
      .from('estoque_alertas' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading alertas:', error);
      return;
    }

    setAlertas((data as any[]).map((a: any) => ({
      id: a.id as string,
      produtoId: a.produto_id,
      tipo: a.tipo as any,
      mensagem: a.mensagem,
      quantidadeAtual: Number(a.quantidade_atual),
      quantidadeSugerida: a.quantidade_sugerida ? Number(a.quantidade_sugerida) : undefined,
      lido: a.lido,
      createdAt: a.created_at,
    })));
  };

  const marcarAlertaComoLido = async (id: string) => {
    const { error } = await supabase
      .from('estoque_alertas' as any)
      .update({ lido: true } as any)
      .eq('id', id);

    if (error) {
      toast.error('Erro ao marcar alerta como lido');
      throw error;
    }

    await loadAlertas();
  };

  const limparAlertasLidos = async () => {
    const { error } = await supabase
      .from('estoque_alertas' as any)
      .delete()
      .eq('lido', true);

    if (error) {
      toast.error('Erro ao limpar alertas');
      throw error;
    }

    toast.success('Alertas lidos removidos');
    await loadAlertas();
  };

  const calcularSugestaoReposicao = (produtoId: string): number => {
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
    loading,
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
