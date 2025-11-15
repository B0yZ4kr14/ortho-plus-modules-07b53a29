import { supabase } from '@/integrations/supabase/client';
import { DentistSchedule } from '../../domain/entities/DentistSchedule';
import { IDentistScheduleRepository } from '../../domain/repositories/IDentistScheduleRepository';
import { DentistScheduleMapper } from '../mappers/DentistScheduleMapper';
import { Database } from '@/integrations/supabase/types';

type DentistScheduleRow = Database['public']['Tables']['dentist_schedules']['Row'];

export class DentistScheduleRepositorySupabase implements IDentistScheduleRepository {
  private readonly tableName = 'dentist_schedules';

  async save(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toPersistence(schedule);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single();

    if (error) throw new Error(`Erro ao salvar horário: ${error.message}`);
    
    return DentistScheduleMapper.toDomain(result as any);
  }

  async findById(id: string): Promise<DentistSchedule | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar horário: ${error.message}`);
    }

    return data ? DentistScheduleMapper.toDomain(data as any) : null;
  }

  async findByDentist(dentistId: string): Promise<DentistSchedule[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('dentist_id', dentistId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true });

    if (error) throw new Error(`Erro ao buscar horários do dentista: ${error.message}`);

    return (data as any[]).map(DentistScheduleMapper.toDomain);
  }

  async findByDentistAndDayOfWeek(dentistId: string, dayOfWeek: number): Promise<DentistSchedule | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('dentist_id', dentistId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar horário: ${error.message}`);
    }

    return data ? DentistScheduleMapper.toDomain(data as any) : null;
  }

  async findByClinicId(clinicId: string): Promise<DentistSchedule[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('dentist_id', { ascending: true })
      .order('day_of_week', { ascending: true });

    if (error) throw new Error(`Erro ao buscar horários da clínica: ${error.message}`);

    return (data as any[]).map(DentistScheduleMapper.toDomain);
  }

  async update(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toUpdate(schedule);

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', schedule.id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar horário: ${error.message}`);

    return DentistScheduleMapper.toDomain(result as any);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar horário: ${error.message}`);
  }
}
