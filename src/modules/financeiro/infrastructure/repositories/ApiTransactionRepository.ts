import { apiClient } from "@/lib/api/apiClient";
import {
  Transaction,
  TransactionProps,
} from "../../domain/entities/Transaction";
import {
  ITransactionRepository,
  TransactionFilters,
} from "../../domain/repositories/ITransactionRepository";
import { Money } from "../../domain/valueObjects/Money";
import { Period } from "../../domain/valueObjects/Period";

export class ApiTransactionRepository implements ITransactionRepository {
  private readonly baseUrl = "/rest/v1/financial_transactions";

  async findById(id: string): Promise<Transaction | null> {
    try {
      const data = await apiClient.get<any[]>(`${this.baseUrl}?id=eq.${id}`);
      if (!data || data.length === 0) return null;
      return this.toDomain(data[0]);
    } catch {
      return null;
    }
  }

  async findByClinic(
    clinicId: string,
    filters?: TransactionFilters,
  ): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);

      if (filters?.type) params.append("type", `eq.${filters.type}`);
      if (filters?.status) params.append("status", `eq.${filters.status}`);
      if (filters?.categoryId)
        params.append("category_id", `eq.${filters.categoryId}`);

      if (filters?.period) {
        params.append(
          "due_date",
          `gte.${filters.period.startDate.toISOString()}`,
        );
        params.append(
          "due_date",
          `lte.${filters.period.endDate.toISOString()}`,
        );
      }

      if (filters?.relatedEntityType)
        params.append("related_entity_type", `eq.${filters.relatedEntityType}`);
      if (filters?.relatedEntityId)
        params.append("related_entity_id", `eq.${filters.relatedEntityId}`);

      params.append("order", "due_date.desc");

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      return (data || []).map((row) => this.toDomain(row));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async save(transaction: Transaction): Promise<void> {
    const data = this.toDatabase(transaction);
    await apiClient.post(this.baseUrl, data);
  }

  async update(transaction: Transaction): Promise<void> {
    const data = this.toDatabase(transaction);
    await apiClient.patch(`${this.baseUrl}?id=eq.${transaction.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}?id=eq.${id}`);
  }

  async getTotalByPeriod(
    clinicId: string,
    period: Period,
    type: "RECEITA" | "DESPESA",
  ): Promise<number> {
    try {
      const params = new URLSearchParams();
      params.append("select", "amount");
      params.append("clinic_id", `eq.${clinicId}`);
      params.append("type", `eq.${type}`);
      params.append("status", `eq.PAGO`);
      params.append("paid_date", `gte.${period.startDate.toISOString()}`);
      params.append("paid_date", `lte.${period.endDate.toISOString()}`);

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      return (data || []).reduce((sum, row) => sum + Number(row.amount), 0);
    } catch {
      return 0;
    }
  }

  async getOverdueTransactions(clinicId: string): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);
      params.append("status", `eq.PENDENTE`);
      params.append("due_date", `lt.${new Date().toISOString()}`);

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      return (data || []).map((row) => this.toDomain(row));
    } catch {
      return [];
    }
  }

  async getPendingTransactions(clinicId: string): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      params.append("clinic_id", `eq.${clinicId}`);
      params.append("status", `eq.PENDENTE`);

      const data = await apiClient.get<any[]>(
        `${this.baseUrl}?${params.toString()}`,
      );
      return (data || []).map((row) => this.toDomain(row));
    } catch {
      return [];
    }
  }

  private toDomain(row: any): Transaction {
    const props: TransactionProps = {
      id: row.id,
      clinicId: row.clinic_id,
      type: row.type,
      amount: Money.fromNumber(row.amount, row.currency || "BRL"),
      description: row.description,
      categoryId: row.category_id,
      dueDate: new Date(row.due_date),
      paidDate: row.paid_date ? new Date(row.paid_date) : undefined,
      status: row.status,
      paymentMethod: row.payment_method,
      notes: row.notes,
      attachmentUrl: row.attachment_url,
      relatedEntityType: row.related_entity_type,
      relatedEntityId: row.related_entity_id,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Transaction(props);
  }

  private toDatabase(transaction: Transaction): any {
    return {
      id: transaction.id,
      clinic_id: transaction.clinicId,
      type: transaction.type,
      amount: transaction.amount.toNumber(),
      currency: transaction.amount.currency,
      description: transaction.description,
      category_id: transaction.categoryId,
      due_date: transaction.dueDate.toISOString(),
      paid_date: transaction.paidDate?.toISOString(),
      status: transaction.status,
      payment_method: transaction.paymentMethod,
      notes: transaction.notes,
      attachment_url: transaction.attachmentUrl,
      related_entity_type: transaction.relatedEntityType,
      related_entity_id: transaction.relatedEntityId,
      created_by: transaction.createdBy,
      created_at: transaction.createdAt.toISOString(),
      updated_at: transaction.updatedAt.toISOString(),
    };
  }
}
