import { Confirmacao } from '../entities/Confirmacao';

/**
 * Interface do repositório de confirmações
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IConfirmacaoRepository {
  /**
   * Busca uma confirmação por ID
   */
  findById(id: string): Promise<Confirmacao | null>;

  /**
   * Busca confirmação por ID do agendamento
   */
  findByAgendamentoId(agendamentoId: string): Promise<Confirmacao | null>;

  /**
   * Busca confirmações por status
   */
  findByStatus(
    status: 'PENDENTE' | 'ENVIADA' | 'CONFIRMADA' | 'ERRO'
  ): Promise<Confirmacao[]>;

  /**
   * Busca confirmações pendentes (não enviadas ainda)
   */
  findPendentes(): Promise<Confirmacao[]>;

  /**
   * Busca confirmações enviadas mas não confirmadas
   */
  findEnviadasNaoConfirmadas(): Promise<Confirmacao[]>;

  /**
   * Salva uma nova confirmação
   */
  save(confirmacao: Confirmacao): Promise<void>;

  /**
   * Atualiza uma confirmação existente
   */
  update(confirmacao: Confirmacao): Promise<void>;

  /**
   * Remove uma confirmação
   */
  delete(id: string): Promise<void>;
}
