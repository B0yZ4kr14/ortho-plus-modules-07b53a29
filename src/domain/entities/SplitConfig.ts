/**
 * FASE 2 - TASK 2.1: Split Config Entity
 * Domain entity representando configuração de split de pagamentos
 */

export type SplitType = 'BY_DENTIST' | 'BY_PROCEDURE' | 'BY_PAYMENT_METHOD' | 'HYBRID';
export type EntityType = 'DENTIST' | 'CLINIC' | 'LAB' | 'THIRD_PARTY';
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MONEY' | 'CRYPTO';

export interface SplitRule {
  entity_type: EntityType;
  entity_id?: string; // UUID do dentista, lab, etc. (opcional se for CLINIC)
  percentage: number;
  priority: number;
}

export interface SplitConfig {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  split_type: SplitType;
  split_rules: SplitRule[];
  apply_to_payment_methods: PaymentMethod[];
  minimum_amount_cents: number;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface CreateSplitConfigDTO {
  name: string;
  description?: string;
  split_type: SplitType;
  split_rules: SplitRule[];
  apply_to_payment_methods?: PaymentMethod[];
  minimum_amount_cents?: number;
  is_active?: boolean;
}

export interface UpdateSplitConfigDTO extends Partial<CreateSplitConfigDTO> {
  id: string;
}

/**
 * Value Object: Validação de Split Rules
 */
export class SplitRulesValidator {
  static validate(rules: SplitRule[]): { valid: boolean; error?: string } {
    // 1. Verificar se há pelo menos uma regra
    if (!rules || rules.length === 0) {
      return { valid: false, error: 'É necessário definir pelo menos uma regra de split' };
    }

    // 2. Verificar se a soma das porcentagens é 100
    const totalPercentage = rules.reduce((sum, rule) => sum + rule.percentage, 0);
    if (totalPercentage !== 100) {
      return { 
        valid: false, 
        error: `A soma das porcentagens deve ser 100% (atualmente: ${totalPercentage}%)` 
      };
    }

    // 3. Verificar se todas as porcentagens são positivas
    const hasNegative = rules.some(rule => rule.percentage <= 0);
    if (hasNegative) {
      return { valid: false, error: 'Todas as porcentagens devem ser maiores que zero' };
    }

    // 4. Verificar prioridades únicas
    const priorities = rules.map(r => r.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      return { valid: false, error: 'As prioridades devem ser únicas' };
    }

    return { valid: true };
  }
}
