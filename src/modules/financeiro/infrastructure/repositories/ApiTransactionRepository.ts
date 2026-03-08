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
  private readonly baseUrl = "/financeiro/transactions";

  async findById(id: string): Promise<Transaction | null> {
    try {
      const data = await apiClient.get<any>(`${this.baseUrl}/${id}`);
      if (!data) return null;
      return this.toDomain(data);
    } catch {
      return null;
    }
  }

  async findByClinic(
    clinicId: string,
    filters?: TransactionFilters,
  ): Promise<Transaction[]> {
    try {
      const params: Record<string, string> = {};
      if (filters?.type) params.type = filters.type;
      if (filters?.status) params.status = filters.status;
      if (filters?.categoryId) params.category_id = filters.categoryId;

      if (filters?.period) {
        params.start_date = filters.period.startDate.toISOString();
        params.end_date = filters.period.endDate.toISOString();
      }

      if (filters?.relatedEntityType)
        params.related_entity_type = filters.relatedEntityType;
      if (filters?.relatedEntityId)
        params.related_entity_id = filters.relatedEntityId;

      const data = await apiClient.get<any[]>(this.baseUrl, { params });
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
    await apiClient.patch(`${this.baseUrl}/${transaction.id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getTotalByPeriod(
    clinicId: string,
    period: Period,
    type: "RECEITA" | "DESPESA",
  ): Promise<number> {
    try {
      const data = await apiClient.get<any[]>(this.baseUrl, {
        params: {
          type,
          status: "PAGO",
          start_date: period.startDate.toISOString(),
          end_date: period.endDate.toISOString(),
        },
      });
      return (data || []).reduce((sum, row) => sum + Number(row.amount), 0);
    } catch {
      return 0;
    }
  }

  async getOverdueTransactions(clinicId: string): Promise<Transaction[]> {
    try {
      const data = await apiClient.get<any[]>(this.baseUrl, {
        params: { status: "PENDENTE", end_date: new Date().toISOString() },
      });
      return (data || []).map((row) => this.toDomain(row));
    } catch {
      return [];
    }
  }

  async getPendingTransactions(clinicId: string): Promise<Transaction[]> {
    try {
      const data = await apiClient.get<any[]>(this.baseUrl, {
        params: { status: "PENDENTE" },
      });
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
