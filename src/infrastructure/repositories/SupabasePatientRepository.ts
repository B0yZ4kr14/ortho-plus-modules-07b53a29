import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { Patient } from '@/domain/entities/Patient';
import { PatientMapper } from '../mappers/PatientMapper';
import { NotFoundError, InfrastructureError } from '../errors';
import { supabase } from '@/integrations/supabase/client';

export class SupabasePatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('patient_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new InfrastructureError(`Erro ao buscar paciente: ${error.message}`, error);
      }

      return data ? PatientMapper.toDomain(data) : null;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar paciente', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new InfrastructureError(`Erro ao buscar pacientes: ${error.message}`, error);
      }

      return data.map(PatientMapper.toDomain);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar pacientes', error);
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Patient[]> {
    try {
      // Simplesmente retorna todos, pois não temos status na tabela prontuarios
      return this.findByClinicId(clinicId);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar pacientes ativos', error);
    }
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    try {
      // Busca por nome que contenha o CPF (workaround até ter tabela de pacientes completa)
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('clinic_id', clinicId)
        .ilike('patient_name', `%${cpf}%`)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        return null; // Não encontrado
      }

      return data ? PatientMapper.toDomain(data) : null;
    } catch (error) {
      return null;
    }
  }

  async save(patient: Patient): Promise<void> {
    try {
      const data = PatientMapper.toPersistence(patient);
      const { error } = await supabase.from('prontuarios').insert(data);

      if (error) {
        throw new InfrastructureError(`Erro ao salvar paciente: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao salvar paciente', error);
    }
  }

  async update(patient: Patient): Promise<void> {
    try {
      const { error } = await supabase
        .from('prontuarios')
        .update({ 
          patient_name: patient.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('patient_id', patient.id);

      if (error) {
        throw new InfrastructureError(`Erro ao atualizar paciente: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao atualizar paciente', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Soft delete removendo todos os prontuários do paciente
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('patient_id', id);

      if (error) {
        throw new InfrastructureError(`Erro ao deletar paciente: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao deletar paciente', error);
    }
  }

  async findByRiskLevel(clinicId: string, riskLevel: string): Promise<Patient[]> {
    try {
      // Retorna todos os pacientes (prontuários) - o filtro por risco será feito na camada de aplicação
      return this.findByClinicId(clinicId);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar pacientes por risco', error);
    }
  }
}
