import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/apiClient";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface Produto {
  id: string;
  codigo_barra: string;
  nome: string;
  categoria: string;
  unidadeMedida: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  valorUnitario: number;
  fornecedor: string;
  localizacao: string;
  lote?: string;
  dataValidade?: string;
  ativo: boolean;
  clinicId?: string;
  createdAt?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  prazo_entrega_dias?: number;
}

export interface Requisicao {
  id: string;
  produtoId: string;
  quantidade: number;
  motivo: string;
  prioridade: "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";
  status: "PENDENTE" | "APROVADA" | "REJEITADA" | "ENTREGUE";
  solicitadoPor: string;
  aprovadoPor?: string;
  dataAprovacao?: string;
  observacoes?: string;
  createdAt?: string;
}

export interface Movimentacao {
  id?: string;
  produtoId: string;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE" | "PERDA" | "VENCIMENTO";
  quantidade: number;
  lote?: string;
  dataValidade?: string;
  motivo?: string;
  valorUnitario?: number;
  valorTotal?: number;
  fornecedorId?: string;
  notaFiscal?: string;
  realizadoPor: string;
  observacoes?: string;
  createdAt?: string;
}

export interface Alerta {
  id: string;
  produtoId: string;
  tipo: "ESTOQUE_BAIXO" | "VENCIMENTO_PROXIMO" | "VENCIDO";
  mensagem: string;
  quantidadeAtual: number;
  quantidadeSugerida?: number;
  lido: boolean;
  createdAt: string;
}

export interface Pedido {
  id: string;
  numeroPedido: string;
  fornecedorId?: string;
  status:
    | "RASCUNHO"
    | "ENVIADO"
    | "RECEBIDO_PARCIAL"
    | "RECEBIDO"
    | "CANCELADO";
  tipo: "COMPRA" | "TRANSFERENCIA";
  dataPedido: string;
  dataPrevistaEntrega?: string;
  dataRecebimento?: string;
  valorTotal?: number;
  observacoes?: string;
  createdAt?: string;
  createdBy?: string;
  geradoAutomaticamente?: boolean;
}

export interface PedidoItem {
  id: string;
  pedidoId: string;
  produtoId: string;
  quantidade: number;
  precoUnitario?: number;
  valorTotal?: number;
  quantidadeRecebida: number;
  observacoes?: string;
  createdAt?: string;
}

export interface PedidoConfig {
  id?: string;
  produtoId: string;
  quantidadeReposicao: number;
  pontoPedido: number;
  gerarAutomaticamente: boolean;
  diasEntregaEstimados: number;
  createdAt?: string;
}

export function useEstoque() {
  const { user } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosItens, setPedidosItens] = useState<PedidoItem[]>([]);
  const [pedidosConfig, setPedidosConfig] = useState<PedidoConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Categorias
  const loadCategorias = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/categorias");
      setCategorias(
        data.map((c) => ({
          id: c.id,
          nome: c.nome,
          descricao: c.descricao,
        })),
      );
    } catch (error) {
      console.error("Error loading categorias:", error);
    }
  }, []);

  const addCategoria = async (
    categoria: Pick<Categoria, "nome" | "descricao">,
  ) => {
    try {
      await apiClient.post("/estoque/categorias", categoria);
      toast.success("Categoria adicionada");
      await loadCategorias();
    } catch (error) {
      toast.error("Erro ao adicionar categoria");
      throw error;
    }
  };

  const updateCategoria = async (id: string, categoria: Partial<Categoria>) => {
    try {
      await apiClient.patch(`/estoque/categorias/${id}`, categoria);
      toast.success("Categoria atualizada");
      await loadCategorias();
    } catch (error) {
      toast.error("Erro ao atualizar categoria");
      throw error;
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      await apiClient.delete(`/estoque/categorias/${id}`);
      toast.success("Categoria removida");
      await loadCategorias();
    } catch (error) {
      toast.error("Erro ao remover categoria");
      throw error;
    }
  };

  const getCategoriaById = (id: string) => categorias.find((c) => c.id === id);

  // Fornecedores
  const loadFornecedores = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/fornecedores");
      setFornecedores(
        data.map((f) => ({
          id: f.id,
          nome: f.nome,
          cnpj: f.cnpj,
          telefone: f.telefone,
          email: f.email,
          contato: f.contato,
          prazo_entrega_dias: f.prazo_entrega_dias,
        })),
      );
    } catch (error) {
      console.error("Error loading fornecedores:", error);
    }
  }, []);

  const addFornecedor = async (fornecedor: Omit<Fornecedor, "id">) => {
    try {
      await apiClient.post("/estoque/fornecedores", fornecedor);
      toast.success("Fornecedor adicionado");
      await loadFornecedores();
    } catch (error) {
      toast.error("Erro ao adicionar fornecedor");
      throw error;
    }
  };

  const updateFornecedor = async (
    id: string,
    fornecedor: Partial<Fornecedor>,
  ) => {
    try {
      await apiClient.patch(`/estoque/fornecedores/${id}`, fornecedor);
      toast.success("Fornecedor atualizado");
      await loadFornecedores();
    } catch (error) {
      toast.error("Erro ao atualizar fornecedor");
      throw error;
    }
  };

  const deleteFornecedor = async (id: string) => {
    try {
      await apiClient.delete(`/estoque/fornecedores/${id}`);
      toast.success("Fornecedor removido");
      await loadFornecedores();
    } catch (error) {
      toast.error("Erro ao remover fornecedor");
      throw error;
    }
  };

  const getFornecedorById = (id: string) =>
    fornecedores.find((f) => f.id === id);

  // Produtos
  const loadProdutos = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/produtos");
      setProdutos(
        data.map((p) => ({
          id: p.id,
          codigo_barra: p.codigo_barra,
          nome: p.nome,
          categoria: p.categoria,
          unidadeMedida: p.unidade_medida,
          quantidadeAtual: Number(p.quantidade_atual),
          quantidadeMinima: Number(p.quantidade_minima),
          valorUnitario: Number(p.valor_unitario),
          fornecedor: p.fornecedor,
          localizacao: p.localizacao,
          lote: p.lote,
          dataValidade: p.data_validade,
          ativo: p.ativo,
          clinicId: p.clinic_id,
          createdAt: p.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading produtos:", error);
    }
  }, []);

  const addProduto = async (
    produto: Omit<Produto, "id" | "createdAt" | "clinicId">,
  ) => {
    try {
      const result = await apiClient.post("/estoque/produtos", {
        ...produto,
        unidade_medida: produto.unidadeMedida,
        quantidade_atual: produto.quantidadeAtual,
        quantidade_minima: produto.quantidadeMinima,
        valor_unitario: produto.valorUnitario,
        data_validade: produto.dataValidade,
      });
      toast.success("Produto adicionado com sucesso");
      await loadProdutos();
      return result;
    } catch (error) {
      toast.error("Erro ao adicionar produto");
      throw error;
    }
  };

  const updateProduto = async (id: string, data: Partial<Produto>) => {
    try {
      const updateData: any = { ...data };
      if (data.unidadeMedida !== undefined) {
        updateData.unidade_medida = data.unidadeMedida;
        delete updateData.unidadeMedida;
      }
      if (data.quantidadeAtual !== undefined) {
        updateData.quantidade_atual = data.quantidadeAtual;
        delete updateData.quantidadeAtual;
      }
      if (data.quantidadeMinima !== undefined) {
        updateData.quantidade_minima = data.quantidadeMinima;
        delete updateData.quantidadeMinima;
      }
      if (data.valorUnitario !== undefined) {
        updateData.valor_unitario = data.valorUnitario;
        delete updateData.valorUnitario;
      }
      if (data.dataValidade !== undefined) {
        updateData.data_validade = data.dataValidade;
        delete updateData.dataValidade;
      }

      await apiClient.patch(`/estoque/produtos/${id}`, updateData);
      toast.success("Produto atualizado com sucesso");
      await loadProdutos();
      await loadAlertas();
    } catch (error) {
      toast.error("Erro ao atualizar produto");
      throw error;
    }
  };

  const deleteProduto = async (id: string) => {
    try {
      await apiClient.delete(`/estoque/produtos/${id}`);
      toast.success("Produto excluído com sucesso");
      await loadProdutos();
    } catch (error) {
      toast.error("Erro ao excluir produto");
      throw error;
    }
  };

  const getProdutoById = (id: string) => produtos.find((p) => p.id === id);

  // Requisições
  const loadRequisicoes = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/requisicoes");
      setRequisicoes(
        data.map((r) => ({
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
        })),
      );
    } catch (error) {
      console.error("Error loading requisicoes:", error);
    }
  }, []);

  const addRequisicao = async (requisicao: Requisicao) => {
    try {
      const data = await apiClient.post("/estoque/requisicoes", {
        produto_id: requisicao.produtoId,
        quantidade: requisicao.quantidade,
        motivo: requisicao.motivo,
        prioridade: requisicao.prioridade,
        status: requisicao.status || "PENDENTE",
        solicitado_por: requisicao.solicitadoPor,
        observacoes: requisicao.observacoes,
      });
      toast.success("Requisição criada com sucesso");
      await loadRequisicoes();
      return data;
    } catch (error) {
      toast.error("Erro ao criar requisição");
      throw error;
    }
  };

  const updateRequisicao = async (id: string, data: Partial<Requisicao>) => {
    try {
      const updateData: any = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.aprovadoPor !== undefined)
        updateData.aprovado_por = data.aprovadoPor;
      if (data.dataAprovacao !== undefined)
        updateData.data_aprovacao = data.dataAprovacao;
      if (data.observacoes !== undefined)
        updateData.observacoes = data.observacoes;

      await apiClient.patch(`/estoque/requisicoes/${id}`, updateData);
      await loadRequisicoes();
    } catch (error) {
      toast.error("Erro ao atualizar requisição");
      throw error;
    }
  };

  const aprovarRequisicao = async (id: string, aprovadoPor: string) => {
    const requisicao = requisicoes.find((r) => r.id === id);
    if (!requisicao) return;

    try {
      await updateRequisicao(id, {
        status: "APROVADA",
        aprovadoPor,
        dataAprovacao: new Date().toISOString(),
      });

      // Criar movimentação de saída
      const produto = produtos.find((p) => p.id === requisicao.produtoId);
      if (produto) {
        await addMovimentacao({
          produtoId: requisicao.produtoId,
          tipo: "SAIDA",
          quantidade: requisicao.quantidade,
          motivo: `Requisição aprovada: ${requisicao.motivo}`,
          realizadoPor: aprovadoPor,
        });
      }

      toast.success("Requisição aprovada com sucesso");
    } catch (error) {
      console.error(error);
    }
  };

  const rejeitarRequisicao = async (id: string, motivo: string) => {
    await updateRequisicao(id, {
      status: "REJEITADA",
      observacoes: motivo,
    });
    toast.success("Requisição rejeitada");
  };

  const getRequisicaoById = (id: string) =>
    requisicoes.find((r) => r.id === id);

  // Movimentações
  const loadMovimentacoes = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/movimentacoes");
      setMovimentacoes(
        data.map((m) => ({
          id: m.id as string,
          produtoId: m.produto_id,
          tipo: m.tipo as any,
          quantidade: Number(m.quantidade),
          lote: m.lote || undefined,
          dataValidade: m.data_validade || undefined,
          motivo: m.motivo,
          valorUnitario: m.valor_unitario
            ? Number(m.valor_unitario)
            : undefined,
          valorTotal: m.valor_total ? Number(m.valor_total) : undefined,
          fornecedorId: m.fornecedor_id || undefined,
          notaFiscal: m.nota_fiscal || undefined,
          realizadoPor: m.realizado_por,
          observacoes: m.observacoes || undefined,
          createdAt: m.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading movimentacoes:", error);
    }
  }, []);

  const addMovimentacao = async (movimentacao: Movimentacao) => {
    try {
      const data = await apiClient.post("/estoque/movimentacoes", {
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
      });

      toast.success("Movimentação registrada com sucesso");

      // O backend deve atualizar o estoque e criar alertas, então recarregamos os dados
      await Promise.all([loadMovimentacoes(), loadProdutos(), loadAlertas()]);

      return data;
    } catch (error) {
      toast.error("Erro ao criar movimentação");
      throw error;
    }
  };

  const getMovimentacaoById = (id: string) =>
    movimentacoes.find((m) => m.id === id);

  // Alertas
  const loadAlertas = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/alertas");
      setAlertas(
        data.map((a) => ({
          id: a.id as string,
          produtoId: a.produto_id,
          tipo: a.tipo as any,
          mensagem: a.mensagem,
          quantidadeAtual: Number(a.quantidade_atual),
          quantidadeSugerida: a.quantidade_sugerida
            ? Number(a.quantidade_sugerida)
            : undefined,
          lido: a.lido,
          createdAt: a.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading alertas:", error);
    }
  }, []);

  const marcarAlertaComoLido = async (id: string) => {
    try {
      await apiClient.patch(`/estoque/alertas/${id}`, { lido: true });
      await loadAlertas();
    } catch (error) {
      toast.error("Erro ao marcar alerta como lido");
      throw error;
    }
  };

  const limparAlertasLidos = async () => {
    try {
      await apiClient.delete("/estoque/alertas/lidos");
      toast.success("Alertas lidos removidos");
      await loadAlertas();
    } catch (error) {
      toast.error("Erro ao limpar alertas");
      throw error;
    }
  };

  const calcularSugestaoReposicao = (produtoId: string): number => {
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return 0;

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);

    const movimentacoesSaida = movimentacoes.filter(
      (m) =>
        m.produtoId === produtoId &&
        (m.tipo === "SAIDA" || m.tipo === "PERDA") &&
        new Date(m.createdAt!) >= dataLimite,
    );

    const consumoTotal = movimentacoesSaida.reduce(
      (sum, m) => sum + m.quantidade,
      0,
    );
    const consumoMedio = consumoTotal / 30;
    const diasEstoque = produto.quantidadeAtual / (consumoMedio || 1);

    if (diasEstoque < 15) {
      return Math.ceil(consumoMedio * 60);
    }

    return 0;
  };

  // Pedidos
  const loadPedidos = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/pedidos");
      setPedidos(
        data.map((p) => ({
          id: p.id,
          numeroPedido: p.numero_pedido,
          fornecedorId: p.fornecedor_id,
          status: p.status,
          tipo: p.tipo,
          dataPedido: p.data_pedido,
          dataPrevistaEntrega: p.data_prevista_entrega,
          dataRecebimento: p.data_recebimento,
          valorTotal: Number(p.valor_total),
          observacoes: p.observacoes,
          geradoAutomaticamente: p.gerado_automaticamente,
          createdAt: p.created_at,
          createdBy: p.created_by,
        })),
      );
    } catch (error) {
      console.error("Error loading pedidos:", error);
    }
  }, []);

  const loadPedidosItens = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/pedidos-itens");
      setPedidosItens(
        data.map((i) => ({
          id: i.id,
          pedidoId: i.pedido_id,
          produtoId: i.produto_id,
          quantidade: Number(i.quantidade),
          precoUnitario: Number(i.preco_unitario),
          valorTotal: Number(i.valor_total),
          quantidadeRecebida: Number(i.quantidade_recebida),
          observacoes: i.observacoes,
          createdAt: i.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading pedidos itens:", error);
    }
  }, []);

  const loadPedidosConfig = useCallback(async () => {
    try {
      const data = await apiClient.get<any[]>("/estoque/pedidos-config");
      setPedidosConfig(
        data.map((c) => ({
          id: c.id,
          produtoId: c.produto_id,
          quantidadeReposicao: Number(c.quantidade_reposicao),
          pontoPedido: Number(c.ponto_pedido),
          gerarAutomaticamente: c.gerar_automaticamente,
          diasEntregaEstimados: c.dias_entrega_estimados,
          createdAt: c.created_at,
        })),
      );
    } catch (error) {
      console.error("Error loading pedidos config:", error);
    }
  }, []);

  const addPedidoConfig = async (config: PedidoConfig) => {
    try {
      await apiClient.post("/estoque/pedidos-config", {
        produto_id: config.produtoId,
        quantidade_reposicao: config.quantidadeReposicao,
        ponto_pedido: config.pontoPedido,
        gerar_automaticamente: config.gerarAutomaticamente,
        dias_entrega_estimados: config.diasEntregaEstimados,
      });
      toast.success("Configuração criada com sucesso");
      await loadPedidosConfig();
    } catch (error) {
      toast.error("Erro ao criar configuração");
      throw error;
    }
  };

  const updatePedidoConfig = async (id: string, config: PedidoConfig) => {
    try {
      await apiClient.patch(`/estoque/pedidos-config/${id}`, {
        quantidade_reposicao: config.quantidadeReposicao,
        ponto_pedido: config.pontoPedido,
        gerar_automaticamente: config.gerarAutomaticamente,
        dias_entrega_estimados: config.diasEntregaEstimados,
      });
      toast.success("Configuração atualizada com sucesso");
      await loadPedidosConfig();
    } catch (error) {
      toast.error("Erro ao atualizar configuração");
      throw error;
    }
  };

  const updatePedidoStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };

      if (status === "RECEBIDO") {
        updates.data_recebimento = new Date().toISOString();
      }

      await apiClient.patch(`/estoque/pedidos/${id}`, updates);
      toast.success("Status do pedido atualizado");
      await loadPedidos();
    } catch (error) {
      toast.error("Erro ao atualizar status do pedido");
      throw error;
    }
  };

  const gerarPedidosAutomaticos = async () => {
    try {
      await apiClient.post("/estoque/pedidos/gerar-automaticos", {});
      toast.success("Pedidos automáticos gerados com sucesso");
      await loadPedidos();
      await loadPedidosItens();
    } catch (error) {
      toast.error("Erro ao gerar pedidos automáticos");
      throw error;
    }
  };

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        loadProdutos(),
        loadFornecedores(),
        loadCategorias(),
        loadRequisicoes(),
        loadMovimentacoes(),
        loadAlertas(),
        loadPedidos(),
        loadPedidosItens(),
        loadPedidosConfig(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Erro ao carregar dados do estoque");
    } finally {
      setLoading(false);
    }
  }, [
    user,
    loadProdutos,
    loadFornecedores,
    loadCategorias,
    loadRequisicoes,
    loadMovimentacoes,
    loadAlertas,
    loadPedidos,
    loadPedidosItens,
    loadPedidosConfig,
  ]);

  // Use a manual reload flow rather than realtime subscriptions which complicate logic
  const reloadData = loadData;

  return {
    produtos,
    fornecedores,
    categorias,
    requisicoes,
    movimentacoes,
    alertas,
    pedidos,
    pedidosItens,
    pedidosConfig,
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
    addPedidoConfig,
    updatePedidoConfig,
    updatePedidoStatus,
    gerarPedidosAutomaticos,
    reloadData,
    loadData,
  };
}
