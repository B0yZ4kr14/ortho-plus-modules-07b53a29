/**
 * Domain Errors
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class InfrastructureError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'InfrastructureError';
  }
}
