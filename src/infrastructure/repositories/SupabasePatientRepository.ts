import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { Patient } from '@/domain/entities/Patient';
import { PatientMapper } from '../mappers/PatientMapper';
import { NotFoundError, InfrastructureError } from '../errors';
import { supabase } from '@/integrations/supabase/client';

export class SupabasePatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
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
        .from('patients')
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
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new InfrastructureError(`Erro ao buscar pacientes ativos: ${error.message}`, error);
      }

      return data.map(PatientMapper.toDomain);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar pacientes ativos', error);
    }
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('cpf', cpf)
        .eq('clinic_id', clinicId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new InfrastructureError(`Erro ao buscar paciente por CPF: ${error.message}`, error);
      }

      return data ? PatientMapper.toDomain(data) : null;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar paciente por CPF', error);
    }
  }

  async save(patient: Patient): Promise<void> {
    try {
      const data = PatientMapper.toPersistence(patient);
      const { error } = await supabase.from('patients').insert(data);

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
      const data = PatientMapper.toPersistence(patient);
      const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', patient.id);

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
      const { error } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', id);

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
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('risk_level', riskLevel)
        .eq('is_active', true)
        .order('risk_score_overall', { ascending: false });

      if (error) {
        throw new InfrastructureError(`Erro ao buscar pacientes por risco: ${error.message}`, error);
      }

      return data.map(PatientMapper.toDomain);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar pacientes por risco', error);
    }
  }
}
