/**
 * FASE 2 - TASK 2.1: Split Transaction Entity
 * Domain entity representando transação de split executada
 */

import { EntityType, PaymentMethod } from './SplitConfig';

export type SplitTransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PayoutStatus = 'PENDING' | 'SCHEDULED' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface SplitResult {
  entity_type: EntityType;
  entity_id?: string;
  entity_name?: string;
  percentage: number;
  amount_cents: number;
  status: PayoutStatus;
  paid_at?: string;
}

export interface SplitTransaction {
  id: string;
  clinic_id: string;
  payment_id?: string;
  patient_id?: string;
  amount_total_cents: number;
  payment_method: PaymentMethod;
  payment_date: string;
  split_config_id?: string;
  split_config_snapshot: any; // Snapshot das regras no momento do split
  split_results: SplitResult[];
  status: SplitTransactionStatus;
  processed_at?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface SplitPayout {
  id: string;
  clinic_id: string;
  split_transaction_id: string;
  entity_type: EntityType;
  entity_id?: string;
  entity_name?: string;
  amount_cents: number;
  percentage: number;
  payout_method?: string;
  payout_status: PayoutStatus;
  scheduled_for?: string;
  paid_at?: string;
  proof_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSplitTransactionDTO {
  payment_id?: string;
  patient_id?: string;
  amount_total_cents: number;
  payment_method: PaymentMethod;
  payment_date?: string;
  split_config_id?: string;
}

/**
 * Value Object: Cálculo de Split
 */
export class SplitCalculator {
  static calculateAmounts(
    totalCents: number,
    rules: Array<{ entity_type: EntityType; entity_id?: string; percentage: number }>
  ): SplitResult[] {
    let totalAssigned = 0;
    const results: SplitResult[] = [];

    // Calcular valores baseados nas porcentagens
    rules.forEach((rule, index) => {
      const amountCents = Math.round((totalCents * rule.percentage) / 100);
      totalAssigned += amountCents;

      results.push({
        entity_type: rule.entity_type,
        entity_id: rule.entity_id,
        percentage: rule.percentage,
        amount_cents: amountCents,
        status: 'PENDING',
      });
    });

    // Ajustar arredondamento (diferença vai para o primeiro item)
    const difference = totalCents - totalAssigned;
    if (difference !== 0 && results.length > 0) {
      results[0].amount_cents += difference;
    }

    return results;
  }

  static formatCurrency(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  }
}
