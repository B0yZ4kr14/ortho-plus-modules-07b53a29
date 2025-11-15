/**
 * FASE 2 - TASK 2.1: Create Split Config Use Case
 * Cria uma nova configuração de split de pagamentos
 */

import { CreateSplitConfigDTO, SplitConfig, SplitRulesValidator } from '@/domain/entities/SplitConfig';
import { SupabaseSplitRepository } from '@/infrastructure/repositories/SupabaseSplitRepository';
import { ValidationError, UnauthorizedError } from '@/domain/errors';

export interface CreateSplitConfigInput extends CreateSplitConfigDTO {
  clinicId: string;
  userId: string;
  userRole: string;
}

export class CreateSplitConfigUseCase {
  constructor(private repository: SupabaseSplitRepository) {}

  async execute(input: CreateSplitConfigInput): Promise<SplitConfig> {
    // 1. Verificar permissões (apenas ADMIN pode criar configurações)
    if (input.userRole !== 'ADMIN' && input.userRole !== 'ROOT') {
      throw new UnauthorizedError('Apenas administradores podem criar configurações de split');
    }

    // 2. Validar split rules
    const validation = SplitRulesValidator.validate(input.split_rules);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Regras de split inválidas');
    }

    // 3. Validar nome
    if (!input.name || input.name.trim().length < 3) {
      throw new ValidationError('Nome deve ter no mínimo 3 caracteres');
    }

    // 4. Criar configuração
    return await this.repository.createConfig(
      {
        name: input.name,
        description: input.description,
        split_type: input.split_type,
        split_rules: input.split_rules,
        apply_to_payment_methods: input.apply_to_payment_methods,
        minimum_amount_cents: input.minimum_amount_cents || 0,
        is_active: input.is_active ?? true,
      },
      input.clinicId,
      input.userId
    );
  }
}
