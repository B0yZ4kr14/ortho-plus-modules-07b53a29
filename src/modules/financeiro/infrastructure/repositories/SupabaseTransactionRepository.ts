import { supabase } from '@/integrations/supabase/client';
import { Transaction, TransactionProps } from '../../domain/entities/Transaction';
import { ITransactionRepository, TransactionFilters } from '../../domain/repositories/ITransactionRepository';
import { Money } from '../../domain/valueObjects/Money';
import { Period } from '../../domain/valueObjects/Period';

export class SupabaseTransactionRepository implements ITransactionRepository {
  private readonly tableName = 'financial_transactions';

  async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByClinic(clinicId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    let query = (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.period) {
      query = query
        .gte('due_date', filters.period.startDate.toISOString())
        .lte('due_date', filters.period.endDate.toISOString());
    }

    if (filters?.relatedEntityType) {
      query = query.eq('related_entity_type', filters.relatedEntityType);
    }

    if (filters?.relatedEntityId) {
      query = query.eq('related_entity_id', filters.relatedEntityId);
    }

    const { data, error } = await query.order('due_date', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async save(transaction: Transaction): Promise<void> {
    const data = this.toDatabase(transaction);
    const { error } = await (supabase as any).from(this.tableName).insert(data);
    
    if (error) {
      throw new Error(`Erro ao salvar transação: ${error.message}`);
    }
  }

  async update(transaction: Transaction): Promise<void> {
    const data = this.toDatabase(transaction);
    const { error } = await (supabase as any)
      .from(this.tableName)
      .update(data)
      .eq('id', transaction.id);

    if (error) {
      throw new Error(`Erro ao atualizar transação: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar transação: ${error.message}`);
    }
  }

  async getTotalByPeriod(clinicId: string, period: Period, type: 'RECEITA' | 'DESPESA'): Promise<number> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('amount')
      .eq('clinic_id', clinicId)
      .eq('type', type)
      .eq('status', 'PAGO')
      .gte('paid_date', period.startDate.toISOString())
      .lte('paid_date', period.endDate.toISOString());

    if (error || !data) return 0;
    return data.reduce((sum, row) => sum + row.amount, 0);
  }

  async getOverdueTransactions(clinicId: string): Promise<Transaction[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .lt('due_date', new Date().toISOString());

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async getPendingTransactions(clinicId: string): Promise<Transaction[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE');

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  private toDomain(row: any): Transaction {
    const props: TransactionProps = {
      id: row.id,
      clinicId: row.clinic_id,
      type: row.type,
      amount: Money.fromNumber(row.amount, row.currency || 'BRL'),
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
