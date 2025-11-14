import { Lead } from '../entities/Lead';

export interface ILeadRepository {
  save(lead: Lead): Promise<Lead>;
  findById(id: string): Promise<Lead | null>;
  findByClinicId(clinicId: string): Promise<Lead[]>;
  findByResponsavel(responsavelId: string): Promise<Lead[]>;
  findByStatus(clinicId: string, status: string): Promise<Lead[]>;
  update(lead: Lead): Promise<Lead>;
  delete(id: string): Promise<void>;
}
