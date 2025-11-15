import { supabase } from '@/integrations/supabase/client';
import { CashRegister, CashRegisterProps, CashRegisterStatus } from '../../domain/entities/CashRegister';
import { ICashRegisterRepository, CashRegisterFilters } from '../../domain/repositories/ICashRegisterRepository';
import { Money } from '../../domain/valueObjects/Money';

export class SupabaseCashRegisterRepository implements ICashRegisterRepository {
  private readonly tableName = 'cash_registers';

  async findById(id: string): Promise<CashRegister | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByClinic(clinicId: string, filters?: CashRegisterFilters): Promise<CashRegister[]> {
    let query = (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.openedBy) {
      query = query.eq('opened_by', filters.openedBy);
    }

    if (filters?.period) {
      query = query
        .gte('opened_at', filters.period.startDate.toISOString())
        .lte('opened_at', filters.period.endDate.toISOString());
    }

    const { data, error } = await query.order('opened_at', { ascending: false });

    if (error || !data) return [];
    return data.map(row => this.toDomain(row));
  }

  async save(cashRegister: CashRegister): Promise<void> {
    const data = this.toDatabase(cashRegister);
    const { error } = await (supabase as any).from(this.tableName).insert(data);
    
    if (error) {
      throw new Error(`Erro ao salvar caixa: ${error.message}`);
    }
  }

  async update(cashRegister: CashRegister): Promise<void> {
    const data = this.toDatabase(cashRegister);
    const { error } = await (supabase as any)
      .from(this.tableName)
      .update(data)
      .eq('id', cashRegister.id);

    if (error) {
      throw new Error(`Erro ao atualizar caixa: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar caixa: ${error.message}`);
    }
  }

  async findOpenRegister(clinicId: string): Promise<CashRegister | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'ABERTO')
      .order('opened_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async getLastClosedRegister(clinicId: string): Promise<CashRegister | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'FECHADO')
      .order('closed_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  private toDomain(row: any): CashRegister {
    const props: CashRegisterProps = {
      id: row.id,
      clinicId: row.clinic_id,
      openedBy: row.opened_by,
      openedAt: new Date(row.opened_at),
      closedBy: row.closed_by,
      closedAt: row.closed_at ? new Date(row.closed_at) : undefined,
      initialAmount: Money.fromNumber(row.initial_amount, row.currency || 'BRL'),
      finalAmount: row.final_amount ? Money.fromNumber(row.final_amount, row.currency || 'BRL') : undefined,
      expectedAmount: row.expected_amount ? Money.fromNumber(row.expected_amount, row.currency || 'BRL') : undefined,
      difference: row.difference ? Money.fromNumber(row.difference, row.currency || 'BRL') : undefined,
      status: row.status,
      notes: row.notes,
    };

    return new CashRegister(props);
  }

  private toDatabase(cashRegister: CashRegister): any {
    return {
      id: cashRegister.id,
      clinic_id: cashRegister.clinicId,
      opened_by: cashRegister.openedBy,
      opened_at: cashRegister.openedAt.toISOString(),
      closed_by: cashRegister.closedBy,
      closed_at: cashRegister.closedAt?.toISOString(),
      initial_amount: cashRegister.initialAmount.toNumber(),
      final_amount: cashRegister.finalAmount?.toNumber(),
      expected_amount: cashRegister.expectedAmount?.toNumber(),
      difference: cashRegister.difference?.toNumber(),
      currency: cashRegister.initialAmount.currency,
      status: cashRegister.status,
      notes: cashRegister.notes,
    };
  }
}
