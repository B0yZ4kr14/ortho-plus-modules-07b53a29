/**
 * FASE 1: AGGREGATES
 * Aggregate Root para Orçamento - gerencia consistência transacional
 */

import { Orcamento, StatusOrcamento } from '@/modules/orcamentos/domain/entities/Orcamento';
import { DomainEvent } from '@/domain/events/DomainEvent';
import { 
  OrcamentoCriadoEvent, 
  OrcamentoAprovadoEvent, 
  OrcamentoRejeitadoEvent,
  OrcamentoEnviadoEvent 
} from '@/domain/events/OrcamentoEvents';

export class OrcamentoAggregate {
  private orcamento: Orcamento;
  private uncommittedEvents: DomainEvent[] = [];

  constructor(orcamento: Orcamento) {
    this.orcamento = orcamento;
  }

  static create(data: {
    clinicId: string;
    patientId: string;
    createdBy: string;
    titulo: string;
    descricao?: string;
    tipoPlano: string;
    validadeDias: number;
    valorSubtotal: number;
    descontoPercentual?: number;
    descontoValor?: number;
    valorTotal: number;
  }): OrcamentoAggregate {
    const orcamento = Orcamento.create(data);
    const aggregate = new OrcamentoAggregate(orcamento);
    
    // Registrar evento de criação
    aggregate.addEvent(
      new OrcamentoCriadoEvent(orcamento.id, {
        clinicId: data.clinicId,
        patientId: data.patientId,
        valorTotal: data.valorTotal,
        createdBy: data.createdBy,
      })
    );
    
    return aggregate;
  }

  aprovar(aprovadoPor: string): void {
    // Validação de negócio
    if (this.orcamento.status === 'APROVADO') {
      throw new Error('Orçamento já foi aprovado');
    }

    if (this.orcamento.status === 'REJEITADO') {
      throw new Error('Orçamento rejeitado não pode ser aprovado');
    }

    // Executar ação no aggregate
    this.orcamento.aprovar(aprovadoPor);

    // Registrar evento
    this.addEvent(
      new OrcamentoAprovadoEvent(this.orcamento.id, {
        aprovadoPor,
        aprovadoEm: new Date(),
        valorTotal: this.orcamento.valorTotal,
      })
    );
  }

  rejeitar(rejeitadoPor: string, motivo?: string): void {
    // Validação de negócio
    if (this.orcamento.status === 'APROVADO') {
      throw new Error('Orçamento aprovado não pode ser rejeitado');
    }

    if (this.orcamento.status === 'REJEITADO') {
      throw new Error('Orçamento já foi rejeitado');
    }

    // Executar ação no aggregate
    this.orcamento.rejeitar(rejeitadoPor, motivo);

    // Registrar evento
    this.addEvent(
      new OrcamentoRejeitadoEvent(this.orcamento.id, {
        rejeitadoPor,
        rejeitadoEm: new Date(),
        motivo,
      })
    );
  }

  enviarParaAprovacao(): void {
    // Validação de negócio
    if (this.orcamento.status !== 'RASCUNHO') {
      throw new Error('Apenas orçamentos em rascunho podem ser enviados');
    }

    // Executar ação no aggregate
    this.orcamento.enviarParaAprovacao();

    // Registrar evento
    this.addEvent(
      new OrcamentoEnviadoEvent(this.orcamento.id, {
        enviadoEm: new Date(),
        enviadoPara: this.orcamento.patientId,
      })
    );
  }

  getOrcamento(): Orcamento {
    return this.orcamento;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  private addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
  }
}
