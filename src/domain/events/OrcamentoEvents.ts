/**
 * FASE 1: DOMAIN EVENTS - Orçamento
 */

import { BaseDomainEvent } from './DomainEvent';

export class OrcamentoCriadoEvent extends BaseDomainEvent {
  constructor(
    orcamentoId: string,
    payload: {
      clinicId: string;
      patientId: string;
      valorTotal: number;
      createdBy: string;
    }
  ) {
    super(orcamentoId, 'ORCAMENTO_CRIADO', payload);
  }
}

export class OrcamentoAprovadoEvent extends BaseDomainEvent {
  constructor(
    orcamentoId: string,
    payload: {
      aprovadoPor: string;
      aprovadoEm: Date;
      valorTotal: number;
    }
  ) {
    super(orcamentoId, 'ORCAMENTO_APROVADO', payload);
  }
}

export class OrcamentoRejeitadoEvent extends BaseDomainEvent {
  constructor(
    orcamentoId: string,
    payload: {
      rejeitadoPor: string;
      rejeitadoEm: Date;
      motivo?: string;
    }
  ) {
    super(orcamentoId, 'ORCAMENTO_REJEITADO', payload);
  }
}

export class OrcamentoEnviadoEvent extends BaseDomainEvent {
  constructor(
    orcamentoId: string,
    payload: {
      enviadoEm: Date;
      enviadoPara: string;
    }
  ) {
    super(orcamentoId, 'ORCAMENTO_ENVIADO', payload);
  }
}
