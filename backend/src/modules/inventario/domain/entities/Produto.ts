/**
 * MÓDULO INVENTÁRIO - Entidade Produto (Aggregate Root)
 * Seguindo padrão DDD estabelecido no golden pattern PACIENTES
 */

import { EventBus } from "@/shared/events/EventBus";

export interface ProdutoProps {
  id: string;
  clinicId: string;
  codigo: string;
  nome: string;
  descricao?: string;
  categoriaId?: string;
  fornecedorId?: string;
  unidadeMedida: string;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  precoCusto?: number;
  precoVenda?: number;
  margemLucro?: number;
  temNfe: boolean;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Produto {
  private props: ProdutoProps;

  private constructor(props: ProdutoProps) {
    this.props = props;
  }

  static create(
    data: Omit<ProdutoProps, "id" | "createdAt" | "updatedAt">,
  ): Produto {
    // Validações de domínio
    if (!data.nome || data.nome.trim().length < 3) {
      throw new Error("Nome do produto deve ter pelo menos 3 caracteres");
    }

    if (data.quantidadeEstoque < 0) {
      throw new Error("Quantidade em estoque não pode ser negativa");
    }

    if (data.quantidadeMinima < 0) {
      throw new Error("Quantidade mínima não pode ser negativa");
    }

    if (data.precoCusto && data.precoCusto < 0) {
      throw new Error("Preço de custo não pode ser negativo");
    }

    if (data.precoVenda && data.precoVenda < 0) {
      throw new Error("Preço de venda não pode ser negativo");
    }

    const now = new Date();
    const produto = new Produto({
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });

    // Emitir evento de domínio
    EventBus.getInstance().publish({
      eventId: crypto.randomUUID(),
      aggregateType: "Produto",
      eventType: "Inventario.ProdutoCriado",
      aggregateId: produto.id,
      payload: {
        clinicId: produto.clinicId,
        produtoId: produto.id,
        nome: produto.nome,
        codigo: produto.codigo,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    return produto;
  }

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
  get codigo(): string {
    return this.props.codigo;
  }
  get nome(): string {
    return this.props.nome;
  }
  get descricao(): string | undefined {
    return this.props.descricao;
  }
  get categoriaId(): string | undefined {
    return this.props.categoriaId;
  }
  get fornecedorId(): string | undefined {
    return this.props.fornecedorId;
  }
  get unidadeMedida(): string {
    return this.props.unidadeMedida;
  }
  get quantidadeEstoque(): number {
    return this.props.quantidadeEstoque;
  }
  get quantidadeMinima(): number {
    return this.props.quantidadeMinima;
  }
  get precoCusto(): number | undefined {
    return this.props.precoCusto;
  }
  get precoVenda(): number | undefined {
    return this.props.precoVenda;
  }
  get margemLucro(): number | undefined {
    return this.props.margemLucro;
  }
  get temNfe(): boolean {
    return this.props.temNfe;
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

  // Métodos de domínio
  ajustarEstoque(
    quantidade: number,
    tipo: "ENTRADA" | "SAIDA" | "AJUSTE",
  ): void {
    const quantidadeAnterior = this.props.quantidadeEstoque;

    if (tipo === "ENTRADA" || tipo === "AJUSTE") {
      this.props.quantidadeEstoque += quantidade;
    } else if (tipo === "SAIDA") {
      if (this.props.quantidadeEstoque < quantidade) {
        throw new Error("Estoque insuficiente para realizar a saída");
      }
      this.props.quantidadeEstoque -= quantidade;
    }

    this.props.updatedAt = new Date();

    // Emitir evento de estoque alterado
    EventBus.getInstance().publish({
      eventId: crypto.randomUUID(),
      aggregateType: "Produto",
      eventType: "Inventario.EstoqueAlterado",
      aggregateId: this.id,
      payload: {
        produtoId: this.id,
        clinicId: this.clinicId,
        tipo,
        quantidade,
        quantidadeAnterior,
        quantidadeAtual: this.props.quantidadeEstoque,
        estoqueAbaixoMinimo:
          this.props.quantidadeEstoque < this.props.quantidadeMinima,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  atualizarPrecos(precoCusto?: number, precoVenda?: number): void {
    if (precoCusto !== undefined) {
      if (precoCusto < 0)
        throw new Error("Preço de custo não pode ser negativo");
      this.props.precoCusto = precoCusto;
    }

    if (precoVenda !== undefined) {
      if (precoVenda < 0)
        throw new Error("Preço de venda não pode ser negativo");
      this.props.precoVenda = precoVenda;
    }

    // Calcular margem de lucro
    if (this.props.precoCusto && this.props.precoVenda) {
      this.props.margemLucro =
        ((this.props.precoVenda - this.props.precoCusto) /
          this.props.precoCusto) *
        100;
    }

    this.props.updatedAt = new Date();
  }

  inativar(): void {
    this.props.ativo = false;
    this.props.updatedAt = new Date();
  }

  ativar(): void {
    this.props.ativo = true;
    this.props.updatedAt = new Date();
  }

  isEstoqueBaixo(): boolean {
    return this.props.quantidadeEstoque <= this.props.quantidadeMinima;
  }

  toObject(): ProdutoProps {
    return { ...this.props };
  }
}
