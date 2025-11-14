import { v4 as uuidv4 } from 'uuid';

export interface ProdutoProps {
  id: string;
  clinicId: string;
  nome: string;
  descricao?: string;
  categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO';
  unidadeMedida: 'UNIDADE' | 'CAIXA' | 'PACOTE' | 'LITRO' | 'ML' | 'GRAMA' | 'KG';
  quantidadeAtual: number;
  quantidadeMinima: number;
  valorUnitario: number;
  codigoBarras?: string;
  fornecedor?: string;
  localizacao?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade de Domínio: Produto
 * 
 * Representa um produto em estoque da clínica, incluindo:
 * - Informações básicas (nome, categoria, unidade)
 * - Controle de estoque (quantidade atual, mínima)
 * - Informações financeiras (valor unitário)
 * - Rastreabilidade (código de barras, fornecedor, localização)
 */
export class Produto {
  private constructor(private props: ProdutoProps) {}

  /**
   * Factory Method: Criar novo Produto
   */
  static create(data: {
    clinicId: string;
    nome: string;
    descricao?: string;
    categoria: ProdutoProps['categoria'];
    unidadeMedida: ProdutoProps['unidadeMedida'];
    quantidadeAtual: number;
    quantidadeMinima: number;
    valorUnitario: number;
    codigoBarras?: string;
    fornecedor?: string;
    localizacao?: string;
    observacoes?: string;
  }): Produto {
    // Validações
    if (!data.clinicId?.trim()) {
      throw new Error('ID da clínica é obrigatório');
    }

    if (!data.nome?.trim()) {
      throw new Error('Nome do produto é obrigatório');
    }

    if (data.quantidadeAtual < 0) {
      throw new Error('Quantidade atual não pode ser negativa');
    }

    if (data.quantidadeMinima < 0) {
      throw new Error('Quantidade mínima não pode ser negativa');
    }

    if (data.valorUnitario < 0) {
      throw new Error('Valor unitário não pode ser negativo');
    }

    const now = new Date();

    return new Produto({
      id: uuidv4(),
      clinicId: data.clinicId,
      nome: data.nome.trim(),
      descricao: data.descricao?.trim(),
      categoria: data.categoria,
      unidadeMedida: data.unidadeMedida,
      quantidadeAtual: data.quantidadeAtual,
      quantidadeMinima: data.quantidadeMinima,
      valorUnitario: data.valorUnitario,
      codigoBarras: data.codigoBarras?.trim(),
      fornecedor: data.fornecedor?.trim(),
      localizacao: data.localizacao?.trim(),
      observacoes: data.observacoes?.trim(),
      ativo: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory Method: Restaurar Produto existente
   */
  static restore(props: ProdutoProps): Produto {
    return new Produto(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get categoria(): ProdutoProps['categoria'] {
    return this.props.categoria;
  }

  get unidadeMedida(): ProdutoProps['unidadeMedida'] {
    return this.props.unidadeMedida;
  }

  get quantidadeAtual(): number {
    return this.props.quantidadeAtual;
  }

  get quantidadeMinima(): number {
    return this.props.quantidadeMinima;
  }

  get valorUnitario(): number {
    return this.props.valorUnitario;
  }

  get codigoBarras(): string | undefined {
    return this.props.codigoBarras;
  }

  get fornecedor(): string | undefined {
    return this.props.fornecedor;
  }

  get localizacao(): string | undefined {
    return this.props.localizacao;
  }

  get observacoes(): string | undefined {
    return this.props.observacoes;
  }

  get ativo(): boolean {
    return this.props.ativo;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Método de Domínio: Atualizar informações do produto
   */
  atualizar(data: {
    nome?: string;
    descricao?: string;
    categoria?: ProdutoProps['categoria'];
    unidadeMedida?: ProdutoProps['unidadeMedida'];
    quantidadeMinima?: number;
    valorUnitario?: number;
    codigoBarras?: string;
    fornecedor?: string;
    localizacao?: string;
    observacoes?: string;
  }): void {
    // Validações
    if (data.nome !== undefined && !data.nome.trim()) {
      throw new Error('Nome do produto não pode ser vazio');
    }

    if (data.quantidadeMinima !== undefined && data.quantidadeMinima < 0) {
      throw new Error('Quantidade mínima não pode ser negativa');
    }

    if (data.valorUnitario !== undefined && data.valorUnitario < 0) {
      throw new Error('Valor unitário não pode ser negativo');
    }

    // Atualizar campos
    if (data.nome !== undefined) this.props.nome = data.nome.trim();
    if (data.descricao !== undefined) this.props.descricao = data.descricao.trim();
    if (data.categoria !== undefined) this.props.categoria = data.categoria;
    if (data.unidadeMedida !== undefined) this.props.unidadeMedida = data.unidadeMedida;
    if (data.quantidadeMinima !== undefined) this.props.quantidadeMinima = data.quantidadeMinima;
    if (data.valorUnitario !== undefined) this.props.valorUnitario = data.valorUnitario;
    if (data.codigoBarras !== undefined) this.props.codigoBarras = data.codigoBarras.trim();
    if (data.fornecedor !== undefined) this.props.fornecedor = data.fornecedor.trim();
    if (data.localizacao !== undefined) this.props.localizacao = data.localizacao.trim();
    if (data.observacoes !== undefined) this.props.observacoes = data.observacoes.trim();

    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Adicionar quantidade ao estoque
   */
  adicionarEstoque(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade a adicionar deve ser positiva');
    }

    this.props.quantidadeAtual += quantidade;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Remover quantidade do estoque
   */
  removerEstoque(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade a remover deve ser positiva');
    }

    if (quantidade > this.props.quantidadeAtual) {
      throw new Error(`Estoque insuficiente. Disponível: ${this.props.quantidadeAtual}, Solicitado: ${quantidade}`);
    }

    this.props.quantidadeAtual -= quantidade;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Ajustar estoque (correção manual)
   */
  ajustarEstoque(novaQuantidade: number): void {
    if (novaQuantidade < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }

    this.props.quantidadeAtual = novaQuantidade;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Verificar se está em estoque baixo
   */
  isEstoqueBaixo(): boolean {
    return this.props.quantidadeAtual <= this.props.quantidadeMinima;
  }

  /**
   * Método de Domínio: Verificar se está zerado
   */
  isEstoqueZerado(): boolean {
    return this.props.quantidadeAtual === 0;
  }

  /**
   * Método de Domínio: Calcular valor total em estoque
   */
  calcularValorTotal(): number {
    return this.props.quantidadeAtual * this.props.valorUnitario;
  }

  /**
   * Método de Domínio: Inativar produto
   */
  inativar(): void {
    this.props.ativo = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Método de Domínio: Reativar produto
   */
  reativar(): void {
    this.props.ativo = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Converte para objeto plain (para persistência)
   */
  toObject(): ProdutoProps {
    return { ...this.props };
  }
}
