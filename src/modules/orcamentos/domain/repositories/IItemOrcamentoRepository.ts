import { ItemOrcamento } from '../entities/ItemOrcamento';

export interface IItemOrcamentoRepository {
  findById(id: string): Promise<ItemOrcamento | null>;
  findByBudgetId(budgetId: string): Promise<ItemOrcamento[]>;
  save(item: ItemOrcamento): Promise<void>;
  update(item: ItemOrcamento): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByBudgetId(budgetId: string): Promise<void>;
}
