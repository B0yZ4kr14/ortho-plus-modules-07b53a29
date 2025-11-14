import { DomainError } from './DomainError';

/**
 * Erro de infraestrutura (banco de dados, rede, etc.)
 */
export class InfrastructureError extends DomainError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
  }
}
