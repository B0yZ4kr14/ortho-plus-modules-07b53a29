import { supabase } from '@/integrations/supabase/client';
import { BlockedTime } from '../../domain/entities/BlockedTime';
import { IBlockedTimeRepository } from '../../domain/repositories/IBlockedTimeRepository';
import { BlockedTimeMapper } from '../mappers/BlockedTimeMapper';
import { Database } from '@/integrations/supabase/types';

type BlockedTimeRow = Database['public']['Tables']['blocked_times']['Row'];

export class BlockedTimeRepositorySupabase implements IBlockedTimeRepository {
  private readonly tableName = 'blocked_times';

  async save(blockedTime: BlockedTime): Promise<BlockedTime> {
    const data = BlockedTimeMapper.toPersistence(blockedTime);
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single();

    if (error) throw new Error(`Erro ao salvar bloqueio: ${error.message}`);
    
    return BlockedTimeMapper.toDomain(result as any);
  }

  async findById(id: string): Promise<BlockedTime | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar bloqueio: ${error.message}`);
    }

    return data ? BlockedTimeMapper.toDomain(data as any) : null;
  }

  async findByDentist(dentistId: string): Promise<BlockedTime[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('dentist_id', dentistId)
      .gte('end_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });

    if (error) throw new Error(`Erro ao buscar bloqueios do dentista: ${error.message}`);

    return (data as any[]).map(BlockedTimeMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BlockedTime[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('dentist_id', dentistId)
      .lt('start_datetime', endDate.toISOString())
      .gt('end_datetime', startDate.toISOString())
      .order('start_datetime', { ascending: true });

    if (error) throw new Error(`Erro ao buscar bloqueios por período: ${error.message}`);

    return (data as any[]).map(BlockedTimeMapper.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<BlockedTime[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('end_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });

    if (error) throw new Error(`Erro ao buscar bloqueios da clínica: ${error.message}`);

    return (data as any[]).map(BlockedTimeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar bloqueio: ${error.message}`);
  }
}
