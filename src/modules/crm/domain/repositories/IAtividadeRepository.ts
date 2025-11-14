import { Atividade } from '../entities/Atividade';

export interface IAtividadeRepository {
  save(atividade: Atividade): Promise<Atividade>;
  findById(id: string): Promise<Atividade | null>;
  findByLeadId(leadId: string): Promise<Atividade[]>;
  findByResponsavel(responsavelId: string): Promise<Atividade[]>;
  findAgendadasPorData(clinicId: string, data: Date): Promise<Atividade[]>;
  update(atividade: Atividade): Promise<Atividade>;
  delete(id: string): Promise<void>;
}
