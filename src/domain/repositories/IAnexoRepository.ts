import { Anexo } from '../entities/Anexo';

/**
 * Interface do repositório de anexos
 * Define o contrato que os adapters de infraestrutura devem implementar
 */
export interface IAnexoRepository {
  /**
   * Busca um anexo por ID
   */
  findById(id: string): Promise<Anexo | null>;

  /**
   * Busca todos os anexos de um prontuário
   */
  findByProntuarioId(prontuarioId: string): Promise<Anexo[]>;

  /**
   * Busca anexos de um histórico específico
   */
  findByHistoricoId(historicoId: string): Promise<Anexo[]>;

  /**
   * Busca anexos por tipo
   */
  findByTipo(prontuarioId: string, tipo: string): Promise<Anexo[]>;

  /**
   * Busca anexos de uma clínica
   */
  findByClinicId(clinicId: string): Promise<Anexo[]>;

  /**
   * Salva um novo anexo
   */
  save(anexo: Anexo): Promise<void>;

  /**
   * Atualiza um anexo existente
   */
  update(anexo: Anexo): Promise<void>;

  /**
   * Remove um anexo (física e logicamente)
   */
  delete(id: string, storagePath: string): Promise<void>;

  /**
   * Faz upload de arquivo para storage
   */
  uploadFile(file: File, path: string): Promise<string>;
}
