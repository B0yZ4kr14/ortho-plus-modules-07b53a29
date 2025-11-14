import { supabase } from '@/integrations/supabase/client';
import { Confirmacao } from '@/domain/entities/Confirmacao';
import { IConfirmacaoRepository } from '@/domain/repositories/IConfirmacaoRepository';
import { ConfirmacaoMapper } from './mappers/ConfirmacaoMapper';

export class SupabaseConfirmacaoRepository implements IConfirmacaoRepository {
  async findById(id: string): Promise<Confirmacao | null> {
    const { data, error } = await supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return ConfirmacaoMapper.toDomain(data);
  }

  async findByAgendamentoId(agendamentoId: string): Promise<Confirmacao | null> {
    const { data, error } = await supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('appointment_id', agendamentoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return ConfirmacaoMapper.toDomain(data);
  }

  async findByStatus(
    status: 'PENDENTE' | 'ENVIADA' | 'CONFIRMADA' | 'ERRO'
  ): Promise<Confirmacao[]> {
    // Mapear status para o formato do banco
    const dbStatus = status === 'PENDENTE' ? 'PENDING' :
                     status === 'ENVIADA' ? 'SENT' :
                     status === 'CONFIRMADA' ? 'CONFIRMED' : 'ERROR';

    const { data, error } = await supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('status', dbStatus)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(ConfirmacaoMapper.toDomain);
  }

  async findPendentes(): Promise<Confirmacao[]> {
    const { data, error } = await supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(ConfirmacaoMapper.toDomain);
  }

  async findEnviadasNaoConfirmadas(): Promise<Confirmacao[]> {
    const { data, error } = await supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('status', 'SENT')
      .order('sent_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(ConfirmacaoMapper.toDomain);
  }

  async save(confirmacao: Confirmacao): Promise<void> {
    const dbData = ConfirmacaoMapper.toDatabase(confirmacao);

    const { error } = await supabase
      .from('appointment_confirmations')
      .insert(dbData);

    if (error) {
      throw new Error(`Erro ao salvar confirmação: ${error.message}`);
    }
  }

  async update(confirmacao: Confirmacao): Promise<void> {
    const dbData = ConfirmacaoMapper.toDatabase(confirmacao);

    const { error } = await supabase
      .from('appointment_confirmations')
      .update(dbData)
      .eq('id', confirmacao.id);

    if (error) {
      throw new Error(`Erro ao atualizar confirmação: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointment_confirmations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar confirmação: ${error.message}`);
    }
  }
}
