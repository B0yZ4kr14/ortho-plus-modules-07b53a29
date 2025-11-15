import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { AppointmentMapper } from '../mappers/AppointmentMapper';
import { Database } from '@/integrations/supabase/types';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];

export class AppointmentRepositorySupabase implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    
    const { data: result, error } = await supabase
      .from('appointments')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Erro ao salvar agendamento: ${error.message}`);
    
    return AppointmentMapper.toDomain(result as AppointmentRow);
  }

  async findById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }

    return data ? AppointmentMapper.toDomain(data as AppointmentRow) : null;
  }

  async findByClinicId(clinicId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('start_time', { ascending: true });

    if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`);

    return (data as AppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });

    if (error) throw new Error(`Erro ao buscar agendamentos do paciente: ${error.message}`);

    return (data as AppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  async findByDentist(dentistId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('dentist_id', dentistId)
      .order('start_time', { ascending: true });

    if (error) throw new Error(`Erro ao buscar agendamentos do dentista: ${error.message}`);

    return (data as AppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  async findByDateRange(clinicId: string, startDate: Date, endDate: Date): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error) throw new Error(`Erro ao buscar agendamentos por período: ${error.message}`);

    return (data as AppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('dentist_id', dentistId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error) throw new Error(`Erro ao buscar agendamentos do dentista por período: ${error.message}`);

    return (data as AppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  async findConflicts(
    dentistId: string,
    startDatetime: Date,
    endDatetime: Date,
    excludeId?: string
  ): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('dentist_id', dentistId)
      .neq('status', 'CANCELADO')
      .neq('status', 'FALTOU')
      .lt('start_time', endDatetime.toISOString())
      .gt('end_time', startDatetime.toISOString());

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Erro ao verificar conflitos: ${error.message}`);

    return (data as AppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toUpdate(appointment);

    const { data: result, error } = await supabase
      .from('appointments')
      .update(data)
      .eq('id', appointment.id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar agendamento: ${error.message}`);

    return AppointmentMapper.toDomain(result as AppointmentRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar agendamento: ${error.message}`);
  }
}
