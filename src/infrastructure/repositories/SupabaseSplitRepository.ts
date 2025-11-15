/**
 * FASE 2 - TASK 2.1: Supabase Split Repository
 * Implementação de repositório para Split de Pagamentos
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  SplitConfig, 
  CreateSplitConfigDTO, 
  UpdateSplitConfigDTO 
} from '@/domain/entities/SplitConfig';
import { 
  SplitTransaction, 
  CreateSplitTransactionDTO,
  SplitPayout 
} from '@/domain/entities/SplitTransaction';
import { NotFoundError, ValidationError } from '@/domain/errors';

export class SupabaseSplitRepository {
  // ========================================================================
  // SPLIT CONFIG
  // ========================================================================
  
  async getAllConfigs(clinicId: string): Promise<SplitConfig[]> {
    const { data, error } = await supabase
      .from('split_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getActiveConfigs(clinicId: string): Promise<SplitConfig[]> {
    const { data, error } = await supabase
      .from('split_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConfigById(id: string): Promise<SplitConfig> {
    const { data, error } = await supabase
      .from('split_config')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Configuração de split não encontrada');
    }

    return data;
  }

  async createConfig(dto: CreateSplitConfigDTO, clinicId: string, userId: string): Promise<SplitConfig> {
    const { data, error } = await supabase
      .from('split_config')
      .insert({
        clinic_id: clinicId,
        created_by: userId,
        ...dto,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23514') { // Check constraint violation
        throw new ValidationError('A soma das porcentagens deve ser 100%');
      }
      throw error;
    }

    return data;
  }

  async updateConfig(dto: UpdateSplitConfigDTO): Promise<SplitConfig> {
    const { id, ...updates } = dto;

    const { data, error } = await supabase
      .from('split_config')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23514') {
        throw new ValidationError('A soma das porcentagens deve ser 100%');
      }
      throw error;
    }

    if (!data) {
      throw new NotFoundError('Configuração de split não encontrada');
    }

    return data;
  }

  async deleteConfig(id: string): Promise<void> {
    const { error } = await supabase
      .from('split_config')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ========================================================================
  // SPLIT TRANSACTIONS
  // ========================================================================

  async getAllTransactions(
    clinicId: string,
    filters?: {
      status?: string;
      payment_method?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<SplitTransaction[]> {
    let query = supabase
      .from('split_transactions')
      .select('*')
      .eq('clinic_id', clinicId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }
    if (filters?.start_date) {
      query = query.gte('payment_date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('payment_date', filters.end_date);
    }

    query = query.order('payment_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getTransactionById(id: string): Promise<SplitTransaction> {
    const { data, error } = await supabase
      .from('split_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Transação de split não encontrada');
    }

    return data;
  }

  async createTransaction(
    dto: CreateSplitTransactionDTO,
    clinicId: string,
    userId: string,
    splitResults: any,
    splitConfigSnapshot: any
  ): Promise<SplitTransaction> {
    const { data, error } = await supabase
      .from('split_transactions')
      .insert({
        clinic_id: clinicId,
        created_by: userId,
        split_results: splitResults,
        split_config_snapshot: splitConfigSnapshot,
        payment_date: dto.payment_date || new Date().toISOString(),
        ...dto,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    processedAt?: string
  ): Promise<SplitTransaction> {
    const { data, error } = await supabase
      .from('split_transactions')
      .update({ 
        status, 
        processed_at: processedAt || new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundError('Transação de split não encontrada');
    }

    return data;
  }

  // ========================================================================
  // SPLIT PAYOUTS
  // ========================================================================

  async getPayoutsByTransaction(transactionId: string): Promise<SplitPayout[]> {
    const { data, error } = await supabase
      .from('split_payouts')
      .select('*')
      .eq('split_transaction_id', transactionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPayoutsByEntity(
    clinicId: string,
    entityType: string,
    entityId?: string
  ): Promise<SplitPayout[]> {
    let query = supabase
      .from('split_payouts')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('entity_type', entityType);

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async updatePayoutStatus(
    id: string,
    status: string,
    paidAt?: string,
    proofUrl?: string
  ): Promise<SplitPayout> {
    const updates: any = { payout_status: status };
    
    if (paidAt) updates.paid_at = paidAt;
    if (proofUrl) updates.proof_url = proofUrl;

    const { data, error } = await supabase
      .from('split_payouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundError('Payout não encontrado');
    }

    return data;
  }
}
