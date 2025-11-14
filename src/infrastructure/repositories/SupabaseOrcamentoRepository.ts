import { Orcamento } from '@/domain/entities/Orcamento';
import { IOrcamentoRepository } from '@/domain/repositories/IOrcamentoRepository';
import { supabase } from '@/integrations/supabase/client';
import { OrcamentoMapper } from './mappers/OrcamentoMapper';

/**
 * Implementação do repositório de Orçamentos usando Supabase
 */
export class SupabaseOrcamentoRepository implements IOrcamentoRepository {
  async findById(id: string): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return OrcamentoMapper.toDomain(data);
  }

  async findByNumero(numeroOrcamento: string, clinicId: string): Promise<Orcamento | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('numero_orcamento', numeroOrcamento)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) {
      return null;
    }

    return OrcamentoMapper.toDomain(data);
  }

  async findByPatientId(patientId: string, clinicId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => OrcamentoMapper.toDomain(row));
  }

  async findByClinicId(clinicId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => OrcamentoMapper.toDomain(row));
  }

  async findByStatus(
    clinicId: string,
    status: 'RASCUNHO' | 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'EXPIRADO'
  ): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => OrcamentoMapper.toDomain(row));
  }

  async findPendentes(clinicId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .order('data_expiracao', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => OrcamentoMapper.toDomain(row));
  }

  async findExpirados(clinicId: string): Promise<Orcamento[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', 'PENDENTE')
      .lte('data_expiracao', now)
      .order('data_expiracao', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => OrcamentoMapper.toDomain(row));
  }

  async save(orcamento: Orcamento): Promise<void> {
    const insert = OrcamentoMapper.toSupabaseInsert(orcamento);

    const { error } = await supabase
      .from('budgets')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar orçamento: ${error.message}`);
    }
  }

  async update(orcamento: Orcamento): Promise<void> {
    const insert = OrcamentoMapper.toSupabaseInsert(orcamento);

    const { error } = await supabase
      .from('budgets')
      .update(insert)
      .eq('id', orcamento.id);

    if (error) {
      throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar orçamento: ${error.message}`);
    }
  }
}
