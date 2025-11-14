import { DomainError } from './DomainError';

/**
 * Erro de autorização
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Ação não autorizada') {
    super(message);
  }
}
