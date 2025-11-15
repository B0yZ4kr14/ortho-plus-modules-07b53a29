import { IModuleRepository } from '@/domain/repositories/IModuleRepository';
import { Module } from '@/domain/entities/Module';
import { ModuleMapper } from '../mappers/ModuleMapper';
import { NotFoundError, InfrastructureError } from '../errors';
import { supabase } from '@/integrations/supabase/client';

export class SupabaseModuleRepository implements IModuleRepository {
  async findById(id: number): Promise<Module | null> {
    try {
      const { data: catalog, error: catalogError } = await supabase
        .from('module_catalog')
        .select('*')
        .eq('id', id)
        .single();

      if (catalogError) {
        if (catalogError.code === 'PGRST116') return null;
        throw new InfrastructureError(`Erro ao buscar módulo: ${catalogError.message}`, catalogError);
      }

      return catalog ? ModuleMapper.toDomain(catalog) : null;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar módulo', error);
    }
  }

  async findByKey(moduleKey: string): Promise<Module | null> {
    try {
      const { data: catalog, error: catalogError } = await supabase
        .from('module_catalog')
        .select('*')
        .eq('module_key', moduleKey)
        .single();

      if (catalogError) {
        if (catalogError.code === 'PGRST116') return null;
        throw new InfrastructureError(`Erro ao buscar módulo: ${catalogError.message}`, catalogError);
      }

      return catalog ? ModuleMapper.toDomain(catalog) : null;
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar módulo por chave', error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from('clinic_modules')
        .select(`
          *,
          module_catalog (*)
        `)
        .eq('clinic_id', clinicId);

      if (error) {
        throw new InfrastructureError(`Erro ao buscar módulos da clínica: ${error.message}`, error);
      }

      return data.map((row) =>
        ModuleMapper.toDomain(row.module_catalog as any, row)
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar módulos da clínica', error);
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from('clinic_modules')
        .select(`
          *,
          module_catalog (*)
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (error) {
        throw new InfrastructureError(`Erro ao buscar módulos ativos: ${error.message}`, error);
      }

      return (data as any[]).map((row) =>
        ModuleMapper.toDomain(row.module_catalog, row)
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar módulos ativos', error);
    }
  }

  async findByCategory(category: string): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from('module_catalog')
        .select('*')
        .eq('category', category);

      if (error) {
        throw new InfrastructureError(`Erro ao buscar módulos por categoria: ${error.message}`, error);
      }

      return data.map(catalog => ModuleMapper.toDomain(catalog));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao buscar módulos por categoria', error);
    }
  }

  async activate(moduleId: number, clinicId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clinic_modules')
        .update({ is_active: true })
        .eq('module_catalog_id', moduleId)
        .eq('clinic_id', clinicId);

      if (error) {
        throw new InfrastructureError(`Erro ao ativar módulo: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao ativar módulo', error);
    }
  }

  async deactivate(moduleId: number, clinicId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clinic_modules')
        .update({ is_active: false })
        .eq('module_catalog_id', moduleId)
        .eq('clinic_id', clinicId);

      if (error) {
        throw new InfrastructureError(`Erro ao desativar módulo: ${error.message}`, error);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro inesperado ao desativar módulo', error);
    }
  }

  async findDependencies(moduleKey: string): Promise<Array<{ module_key: string; depends_on_module_key: string; depends_on_module_name: string }>> {
    try {
      const { data, error } = await supabase
        .from('module_dependencies')
        .select(`
          module_id,
          depends_on_module_id,
          module_catalog!module_dependencies_module_id_fkey(module_key),
          dep_module:module_catalog!module_dependencies_depends_on_module_id_fkey(module_key, name)
        `)
        .eq('module_catalog.module_key', moduleKey);

      if (error) throw new InfrastructureError(`Erro ao buscar dependências: ${error.message}`, error);
      
      return (data || []).map(d => ({
        module_key: moduleKey,
        depends_on_module_key: (d as any).dep_module?.module_key || '',
        depends_on_module_name: (d as any).dep_module?.name || ''
      }));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro ao buscar dependências', error);
    }
  }

  async findDependentsActive(moduleKey: string, clinicId: string): Promise<Array<{ module_key: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('module_dependencies')
        .select(`
          module_catalog!module_dependencies_module_id_fkey(module_key, name),
          clinic_modules!inner(is_active)
        `)
        .eq('dep_module.module_key', moduleKey)
        .eq('clinic_modules.clinic_id', clinicId)
        .eq('clinic_modules.is_active', true);

      if (error) throw new InfrastructureError(`Erro ao buscar dependentes: ${error.message}`, error);
      
      return (data || []).map(d => ({
        module_key: (d as any).module_catalog?.module_key || '',
        name: (d as any).module_catalog?.name || ''
      }));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError('Erro ao buscar dependentes ativos', error);
    }
  }
}
