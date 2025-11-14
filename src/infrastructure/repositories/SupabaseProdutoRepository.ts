import { Produto } from '@/domain/entities/Produto';
import { IProdutoRepository } from '@/domain/repositories/IProdutoRepository';
import { supabase } from '@/integrations/supabase/client';
import { ProdutoMapper } from './mappers/ProdutoMapper';

/**
 * Implementação do repositório de Produto usando Supabase
 */
export class SupabaseProdutoRepository implements IProdutoRepository {
  async findById(id: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return ProdutoMapper.toDomain(data);
  }

  async findByCodigoBarras(codigoBarras: string, clinicId: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('codigo_barras', codigoBarras)
      .eq('clinic_id', clinicId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return ProdutoMapper.toDomain(data);
  }

  async findByClinicId(clinicId: string): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('nome', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ProdutoMapper.toDomain(row));
  }

  async findActiveByClinicId(clinicId: string): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ProdutoMapper.toDomain(row));
  }

  async findByCategoria(
    clinicId: string,
    categoria: 'MATERIAL' | 'MEDICAMENTO' | 'EQUIPAMENTO' | 'CONSUMIVEL' | 'OUTRO'
  ): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('categoria', categoria)
      .order('nome', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ProdutoMapper.toDomain(row));
  }

  async findEstoqueBaixo(clinicId: string): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('ativo', true)
      .order('quantidade_atual', { ascending: true });

    if (error || !data) {
      return [];
    }

    // Filtrar produtos onde quantidade_atual <= quantidade_minima
    return data
      .filter(row => Number(row.quantidade_atual) <= Number(row.quantidade_minima))
      .map(row => ProdutoMapper.toDomain(row));
  }

  async findEstoqueZerado(clinicId: string): Promise<Produto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('quantidade_atual', 0)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(row => ProdutoMapper.toDomain(row));
  }

  async save(produto: Produto): Promise<void> {
    const insert = ProdutoMapper.toSupabaseInsert(produto);

    const { error } = await supabase
      .from('produtos')
      .insert(insert);

    if (error) {
      throw new Error(`Erro ao salvar produto: ${error.message}`);
    }
  }

  async update(produto: Produto): Promise<void> {
    const insert = ProdutoMapper.toSupabaseInsert(produto);

    const { error } = await supabase
      .from('produtos')
      .update(insert)
      .eq('id', produto.id);

    if (error) {
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  }
}
