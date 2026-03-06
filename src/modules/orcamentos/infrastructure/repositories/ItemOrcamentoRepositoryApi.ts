import { apiClient } from "@/lib/api/apiClient";
import { ItemOrcamento } from "../../domain/entities/ItemOrcamento";
import { IItemOrcamentoRepository } from "../../domain/repositories/IItemOrcamentoRepository";

export class ItemOrcamentoRepositoryApi implements IItemOrcamentoRepository {
  async findById(id: string): Promise<ItemOrcamento | null> {
    try {
      const data: any = await apiClient.get(`/orcamentos/items/${id}`);
      return this.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByBudgetId(budgetId: string): Promise<ItemOrcamento[]> {
    try {
      const data: any = await apiClient.get(`/orcamentos/${budgetId}/items`, {
        params: { sort: "ordem.asc" },
      });
      return data.map((item: any) => this.toDomain(item));
    } catch {
      return [];
    }
  }

  async save(item: ItemOrcamento): Promise<void> {
    const data = this.toPersistence(item);
    await apiClient.post("/orcamentos/items", data);
  }

  async update(item: ItemOrcamento): Promise<void> {
    const data = this.toPersistence(item);
    await apiClient.put(`/orcamentos/items/${item.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orcamentos/items/${id}`);
  }

  async deleteByBudgetId(budgetId: string): Promise<void> {
    await apiClient.delete(`/orcamentos/${budgetId}/items`);
  }

  private toDomain(data: any): ItemOrcamento {
    return ItemOrcamento.restore({
      id: data.id,
      budgetId: data.budget_id,
      ordem: data.ordem,
      descricao: data.descricao,
      procedimentoId: data.procedimento_id,
      denteRegiao: data.dente_regiao,
      quantidade: data.quantidade,
      valorUnitario: data.valor_unitario,
      descontoPercentual: data.desconto_percentual,
      descontoValor: data.desconto_valor,
      valorTotal: data.valor_total,
      observacoes: data.observacoes,
      createdAt: new Date(data.created_at),
    });
  }

  private toPersistence(item: ItemOrcamento): any {
    return {
      id: item.id,
      budget_id: item.budgetId,
      ordem: item.ordem,
      descricao: item.descricao,
      procedimento_id: item.procedimentoId,
      dente_regiao: item.denteRegiao,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario,
      desconto_percentual: item.descontoPercentual,
      desconto_valor: item.descontoValor,
      valor_total: item.valorTotal,
      observacoes: item.observacoes,
      created_at: item.createdAt.toISOString(),
    };
  }
}
