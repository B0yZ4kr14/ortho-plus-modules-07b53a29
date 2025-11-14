import { supabase } from '@/integrations/supabase/client';
import { Agendamento } from '@/domain/entities/Agendamento';
import { IAgendamentoRepository } from '@/domain/repositories/IAgendamentoRepository';
import { AgendamentoMapper } from './mappers/AgendamentoMapper';

export class SupabaseAgendamentoRepository implements IAgendamentoRepository {
  async findById(id: string): Promise<Agendamento | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return AgendamentoMapper.toDomain(data);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('dentist_id', dentistId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(AgendamentoMapper.toDomain);
  }

  async findByPatientId(patientId: string, clinicId: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('start_time', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(AgendamentoMapper.toDomain);
  }

  async findByClinicAndDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(AgendamentoMapper.toDomain);
  }

  async findByStatus(
    clinicId: string,
    status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'FALTOU'
  ): Promise<Agendamento[]> {
    // Mapear status para o formato do banco
    const dbStatus = status.toLowerCase();

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('status', dbStatus)
      .order('start_time', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(AgendamentoMapper.toDomain);
  }

  async findAtivos(clinicId: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .not('status', 'in', '(cancelado,concluido,faltou)')
      .order('start_time', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(AgendamentoMapper.toDomain);
  }

  async hasConflict(
    dentistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from('appointments')
      .select('id')
      .eq('dentist_id', dentistId)
      .not('status', 'in', '(cancelado,faltou)')
      .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao verificar conflito:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  async save(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);

    const { error } = await supabase
      .from('appointments')
      .insert(dbData);

    if (error) {
      throw new Error(`Erro ao salvar agendamento: ${error.message}`);
    }
  }

  async update(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);

    const { error } = await supabase
      .from('appointments')
      .update(dbData)
      .eq('id', agendamento.id);

    if (error) {
      throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar agendamento: ${error.message}`);
    }
  }
}
