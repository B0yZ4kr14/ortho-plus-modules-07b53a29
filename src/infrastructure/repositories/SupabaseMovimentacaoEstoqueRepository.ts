import { MovimentacaoEstoque } from '@/domain/entities/MovimentacaoEstoque';
import { IMovimentacaoEstoqueRepository } from '@/domain/repositories/IMovimentacaoEstoqueRepository';
import { supabase } from '@/integrations/supabase/client';
import { MovimentacaoEstoqueMapper } from './mappers/MovimentacaoEstoqueMapper';

/**
 * Implementação do repositório de MovimentacaoEstoque usando Supabase
 */
export class SupabaseMovimentacaoEstoqueRepository implements IMovimentacaoEstoqueRepository {
  async findById(id: string): Promise<MovimentacaoEstoque | null> {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return MovimentacaoEstoqueMapper.toDomain(data);
  }

  async findByProdutoId(produtoId: string): Promise<MovimentacaoEstoque[]> {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('produto_id', produtoId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentacaoEstoqueMapper.toDomain(row));
  }

  async findByProdutoAndDateRange(
    produtoId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MovimentacaoEstoque[]> {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('produto_id', produtoId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentacaoEstoqueMapper.toDomain(row));
  }

  async findByClinicId(clinicId: string): Promise<MovimentacaoEstoque[]> {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentacaoEstoqueMapper.toDomain(row));
  }

  async findByTipo(
    clinicId: string,
    tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
  ): Promise<MovimentacaoEstoque[]> {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('tipo', tipo)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentacaoEstoqueMapper.toDomain(row));
  }

  async findByUsuarioId(usuarioId: string): Promise<MovimentacaoEstoque[]> {
    const { data, error } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => MovimentacaoEstoqueMapper.toDomain(row));
  }

  async save(movimentacao: MovimentacaoEstoque): Promise<void> {
    const insert = MovimentacaoEstoqueMapper.toSupabaseInsert(movimentacao);

    const { error } = await supabase
      .from('movimentacoes_estoque')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar movimentação: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('movimentacoes_estoque')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar movimentação: ${error.message}`);
    }
  }
}
