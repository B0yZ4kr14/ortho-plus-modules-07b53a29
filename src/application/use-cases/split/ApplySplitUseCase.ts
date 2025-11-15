/**
 * FASE 2 - TASK 2.1: Apply Split Use Case
 * Aplica split a um pagamento recebido
 */

import { CreateSplitTransactionDTO, SplitTransaction, SplitCalculator } from '@/domain/entities/SplitTransaction';
import { SupabaseSplitRepository } from '@/infrastructure/repositories/SupabaseSplitRepository';
import { NotFoundError, ValidationError } from '@/domain/errors';

export interface ApplySplitInput extends CreateSplitTransactionDTO {
  clinicId: string;
  userId: string;
}

export class ApplySplitUseCase {
  constructor(private repository: SupabaseSplitRepository) {}

  async execute(input: ApplySplitInput): Promise<SplitTransaction> {
    // 1. Validar valores
    if (input.amount_total_cents <= 0) {
      throw new ValidationError('Valor do pagamento deve ser maior que zero');
    }

    // 2. Buscar configuração de split
    let splitConfig;
    
    if (input.split_config_id) {
      // Configuração específica fornecida
      splitConfig = await this.repository.getConfigById(input.split_config_id);
    } else {
      // Buscar configuração padrão ativa
      const activeConfigs = await this.repository.getActiveConfigs(input.clinicId);
      
      if (activeConfigs.length === 0) {
        throw new NotFoundError('Nenhuma configuração de split ativa encontrada');
      }

      // Filtrar por payment_method se aplicável
      const matchingConfigs = activeConfigs.filter(config =>
        config.apply_to_payment_methods.includes(input.payment_method)
      );

      if (matchingConfigs.length === 0) {
        throw new NotFoundError(
          `Nenhuma configuração de split encontrada para método de pagamento: ${input.payment_method}`
        );
      }

      // Usar a primeira configuração encontrada
      splitConfig = matchingConfigs[0];
    }

    // 3. Verificar valor mínimo
    if (input.amount_total_cents < splitConfig.minimum_amount_cents) {
      throw new ValidationError(
        `Valor do pagamento está abaixo do mínimo configurado (${SplitCalculator.formatCurrency(
          splitConfig.minimum_amount_cents
        )})`
      );
    }

    // 4. Calcular split
    const splitResults = SplitCalculator.calculateAmounts(
      input.amount_total_cents,
      splitConfig.split_rules
    );

    // 5. Criar transação de split
    const transaction = await this.repository.createTransaction(
      input,
      input.clinicId,
      input.userId,
      splitResults,
      splitConfig
    );

    // 6. Criar payouts individuais
    // TODO: Implementar criação de payouts na tabela split_payouts

    return transaction;
  }
}
