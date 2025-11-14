import { IAnexoRepository } from '@/domain/repositories/IAnexoRepository';
import { Anexo } from '@/domain/entities/Anexo';
import { AnexoMapper } from '../mappers/AnexoMapper';
import { supabase } from '@/integrations/supabase/client';
import { InfrastructureError } from '../errors/InfrastructureError';

export class SupabaseAnexoRepository implements IAnexoRepository {
  async findById(id: string): Promise<Anexo | null> {
    try {
      const { data, error } = await supabase
        .from('pep_anexos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return AnexoMapper.toDomain(data);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar anexo', error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Anexo[]> {
    try {
      const { data, error } = await supabase
        .from('pep_anexos')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar anexos do prontuário', error);
    }
  }

  async findByHistoricoId(historicoId: string): Promise<Anexo[]> {
    try {
      const { data, error } = await supabase
        .from('pep_anexos')
        .select('*')
        .eq('historico_id', historicoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar anexos do histórico', error);
    }
  }

  async findByTipo(prontuarioId: string, tipo: string): Promise<Anexo[]> {
    try {
      const { data, error } = await supabase
        .from('pep_anexos')
        .select('*')
        .eq('prontuario_id', prontuarioId)
        .eq('tipo_arquivo', tipo)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar anexos por tipo', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Anexo[]> {
    try {
      // Fazer join com prontuarios para filtrar por clinic_id
      const { data, error } = await supabase
        .from('pep_anexos')
        .select(`
          *,
          prontuarios!inner(clinic_id)
        `)
        .eq('prontuarios.clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError('Erro ao buscar anexos da clínica', error);
    }
  }

  async save(anexo: Anexo): Promise<void> {
    try {
      const data = AnexoMapper.toInsert(anexo);
      
      const { error } = await supabase
        .from('pep_anexos')
        .insert(data);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao salvar anexo', error);
    }
  }

  async update(anexo: Anexo): Promise<void> {
    try {
      const data = AnexoMapper.toPersistence(anexo);
      
      const { error } = await supabase
        .from('pep_anexos')
        .update(data)
        .eq('id', anexo.id);

      if (error) throw error;
    } catch (error) {
      throw new InfrastructureError('Erro ao atualizar anexo', error);
    }
  }

  async delete(id: string, storagePath: string): Promise<void> {
    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('pep-anexos')
        .remove([storagePath]);

      if (storageError) {
        console.error('Erro ao deletar arquivo do storage:', storageError);
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('pep_anexos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
    } catch (error) {
      throw new InfrastructureError('Erro ao deletar anexo', error);
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('pep-anexos')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('pep-anexos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      throw new InfrastructureError('Erro ao fazer upload do arquivo', error);
    }
  }
}
