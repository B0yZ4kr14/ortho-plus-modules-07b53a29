import { Orcamento, StatusOrcamento } from '../entities/Orcamento';

export interface IOrcamentoRepository {
  findById(id: string): Promise<Orcamento | null>;
  findByNumero(numeroOrcamento: string, clinicId: string): Promise<Orcamento | null>;
  findByPatientId(patientId: string, clinicId: string): Promise<Orcamento[]>;
  findByClinicId(clinicId: string): Promise<Orcamento[]>;
  findByStatus(clinicId: string, status: StatusOrcamento): Promise<Orcamento[]>;
  findPendentes(clinicId: string): Promise<Orcamento[]>;
  findExpirados(clinicId: string): Promise<Orcamento[]>;
  save(orcamento: Orcamento): Promise<void>;
  update(orcamento: Orcamento): Promise<void>;
  delete(id: string): Promise<void>;
}
