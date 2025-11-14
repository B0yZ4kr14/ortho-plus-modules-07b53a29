import { DomainError } from './DomainError';

/**
 * Erro quando entidade não é encontrada
 */
export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} com ID ${id} não encontrado`);
  }
}
